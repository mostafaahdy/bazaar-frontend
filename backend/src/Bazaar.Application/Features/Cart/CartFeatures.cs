using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Bazaar.Application.Common.Interfaces;
using Bazaar.Application.DTOs;
using Bazaar.Domain.Entities;
using Bazaar.Domain.Exceptions;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Application.Features.Cart;

// ── 1. Get Live Cart Query ─────────────────────────────────
public record GetCartQuery(Guid UserId) : IRequest<CartDto>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, CartDto>
{
    private readonly IAppDbContext _context;
    private const decimal FreeShippingThreshold = 500m;
    private const decimal StandardExpressFee = 50m;

    public GetCartQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await GetOrCreateCartAsync(request.UserId, cancellationToken);

        var items = cart.Items.Select(i => new CartItemDto(
            i.Id,
            i.ProductId,
            i.Product.Title,
            i.Product.Brand,
            i.Product.Images.OrderBy(img => img.DisplayOrder).Select(img => img.ImageUrl).FirstOrDefault() ?? "",
            i.VariantId,
            i.Variant?.Name,
            i.Quantity,
            i.UnitPrice,
            i.UnitPrice * i.Quantity,
            i.Variant != null ? i.Variant.Stock : i.Product.StockQuantity
        )).ToList();

        var subtotal = items.Sum(i => i.TotalPrice);
        var totalItems = items.Sum(i => i.Quantity);
        var qualifiesForFree = subtotal >= FreeShippingThreshold;
        var shippingFee = subtotal == 0 ? 0 : qualifiesForFree ? 0 : StandardExpressFee;

        return new CartDto(
            cart.Id,
            cart.UserId,
            items,
            subtotal,
            totalItems,
            shippingFee,
            qualifiesForFree
        );
    }

    private async Task<Domain.Entities.Cart> GetOrCreateCartAsync(Guid userId, CancellationToken ct)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .Include(c => c.Items)
                .ThenInclude(i => i.Variant)
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (cart == null)
        {
            cart = new Domain.Entities.Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync(ct);
        }

        return cart;
    }
}

// ── 2. Add Item To Cart Command ────────────────────────────
public record AddToCartCommand(Guid UserId, AddToCartRequest Request) : IRequest<CartDto>;

public class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartCommandValidator()
    {
        RuleFor(x => x.Request.ProductId).NotEmpty().WithMessage("ProductId is required.");
        RuleFor(x => x.Request.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than zero.");
    }
}

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, CartDto>
{
    private readonly IAppDbContext _context;
    private readonly IMediator _mediator;

    public AddToCartCommandHandler(IAppDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task<CartDto> Handle(AddToCartCommand command, CancellationToken cancellationToken)
    {
        var (userId, req) = (command.UserId, command.Request);

        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == req.ProductId, cancellationToken);

        if (product == null)
            throw new EntityNotFoundException(nameof(Product), req.ProductId);

        ProductVariant? variant = null;
        if (req.VariantId.HasValue)
        {
            variant = product.Variants.FirstOrDefault(v => v.Id == req.VariantId.Value);
            if (variant == null)
                throw new EntityNotFoundException(nameof(ProductVariant), req.VariantId.Value);
        }

        var availableStock = variant?.Stock ?? product.StockQuantity;
        if (availableStock < req.Quantity)
            throw new InsufficientStockException(product.Title, req.Quantity, availableStock);

        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

        if (cart == null)
        {
            cart = new Domain.Entities.Cart { Id = Guid.NewGuid(), UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var existingItem = cart.Items.FirstOrDefault(i =>
            i.ProductId == req.ProductId && i.VariantId == req.VariantId);

        var unitPrice = variant != null && variant.FinalPrice > 0
            ? variant.FinalPrice
            : product.DiscountPrice ?? product.BasePrice;

        if (existingItem != null)
        {
            var newQuantity = existingItem.Quantity + req.Quantity;
            if (newQuantity > availableStock)
                throw new InsufficientStockException(product.Title, newQuantity, availableStock);

            existingItem.Quantity = newQuantity;
            existingItem.UnitPrice = unitPrice;
        }
        else
        {
            var newItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductId = req.ProductId,
                VariantId = req.VariantId,
                Quantity = req.Quantity,
                UnitPrice = unitPrice
            };
            _context.CartItems.Add(newItem);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return await _mediator.Send(new GetCartQuery(userId), cancellationToken);
    }
}

// ── 3. Update Cart Item Quantity Command ───────────────────
public record UpdateCartItemCommand(Guid UserId, Guid CartItemId, int Quantity) : IRequest<CartDto>;

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand, CartDto>
{
    private readonly IAppDbContext _context;
    private readonly IMediator _mediator;

    public UpdateCartItemCommandHandler(IAppDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task<CartDto> Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.CartItems
            .Include(i => i.Cart)
            .Include(i => i.Product)
            .Include(i => i.Variant)
            .FirstOrDefaultAsync(i => i.Id == request.CartItemId && i.Cart.UserId == request.UserId, cancellationToken);

        if (item == null)
            throw new EntityNotFoundException(nameof(CartItem), request.CartItemId);

        if (request.Quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            var maxStock = item.Variant?.Stock ?? item.Product.StockQuantity;
            if (request.Quantity > maxStock)
                throw new InsufficientStockException(item.Product.Title, request.Quantity, maxStock);

            item.Quantity = request.Quantity;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return await _mediator.Send(new GetCartQuery(request.UserId), cancellationToken);
    }
}

// ── 4. Remove Item From Cart Command ───────────────────────
public record RemoveCartItemCommand(Guid UserId, Guid CartItemId) : IRequest<CartDto>;

public class RemoveCartItemCommandHandler : IRequestHandler<RemoveCartItemCommand, CartDto>
{
    private readonly IAppDbContext _context;
    private readonly IMediator _mediator;

    public RemoveCartItemCommandHandler(IAppDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task<CartDto> Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.CartItems
            .Include(i => i.Cart)
            .FirstOrDefaultAsync(i => i.Id == request.CartItemId && i.Cart.UserId == request.UserId, cancellationToken);

        if (item != null)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return await _mediator.Send(new GetCartQuery(request.UserId), cancellationToken);
    }
}
