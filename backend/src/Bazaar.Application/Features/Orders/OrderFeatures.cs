using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Bazaar.Application.Common.Interfaces;
using Bazaar.Application.DTOs;
using Bazaar.Domain.Entities;
using Bazaar.Domain.Enums;
using Bazaar.Domain.Exceptions;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Application.Features.Orders;

// ── 1. Create Order Command ────────────────────────────────
public record CreateOrderCommand(Guid UserId, CreateOrderRequest Request) : IRequest<OrderDto>;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x).Must(cmd => cmd.Request.AddressId.HasValue || cmd.Request.ShippingAddress != null)
            .WithMessage("Delivery address is required.");
    }
}

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, OrderDto>
{
    private readonly IAppDbContext _context;

    public CreateOrderCommandHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> Handle(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var (userId, req) = (command.UserId, command.Request);

        // 1. Resolve Address
        Address? address = null;
        if (req.AddressId.HasValue)
        {
            address = await _context.Addresses
                .FirstOrDefaultAsync(a => a.Id == req.AddressId.Value, cancellationToken);
        }

        if (address == null && req.ShippingAddress == null)
        {
            address = await _context.Addresses
                .FirstOrDefaultAsync(a => a.UserId == userId, cancellationToken)
                ?? await _context.Addresses.FirstOrDefaultAsync(cancellationToken);
        }

        string shippingFullName = address?.FullName ?? req.ShippingAddress?.FullName ?? "Valued Customer";
        string shippingPhone = address?.Phone ?? req.ShippingAddress?.Phone ?? "+201001234567";
        string shippingGovernorate = address?.Governorate ?? req.ShippingAddress?.Governorate ?? "Cairo";
        string shippingCityArea = address?.CityArea ?? req.ShippingAddress?.CityArea ?? "New Cairo";
        string shippingStreet = address?.StreetAddress ?? req.ShippingAddress?.StreetAddress ?? "Street 90";
        string shippingBuilding = address?.BuildingFloor ?? req.ShippingAddress?.BuildingFloor ?? "Building 1";

        // 2. Resolve Items & Stock
        decimal subtotal = 0;
        var orderItems = new List<OrderItem>();

        if (req.Items != null && req.Items.Count > 0)
        {
            // Process items sent directly from frontend
            foreach (var item in req.Items)
            {
                Guid.TryParse(item.ProductId, out var pGuid);
                Guid? vGuid = Guid.TryParse(item.VariantId, out var parsedV) ? parsedV : null;

                var linePrice = item.Price * item.Quantity;
                subtotal += linePrice;

                // Deduct stock if product found in DB
                if (pGuid != Guid.Empty)
                {
                    var p = await _context.Products.Include(prod => prod.Variants).FirstOrDefaultAsync(prod => prod.Id == pGuid, cancellationToken);
                    if (p != null)
                    {
                        p.StockQuantity = Math.Max(0, p.StockQuantity - item.Quantity);
                        var v = p.Variants.FirstOrDefault(vr => vr.Id == vGuid);
                        if (v != null) v.Stock = Math.Max(0, v.Stock - item.Quantity);
                    }
                }

                orderItems.Add(new OrderItem
                {
                    ProductId = pGuid,
                    VariantId = vGuid,
                    ProductName = item.Name ?? "Product",
                    Brand = item.Brand ?? "Bazaar",
                    ProductImage = item.Image ?? "",
                    VariantLabel = item.VariantLabel,
                    UnitPrice = item.Price,
                    Quantity = item.Quantity,
                    TotalPrice = linePrice
                });
            }
        }
        else
        {
            // Fetch User Cart
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Images)
                .Include(c => c.Items)
                    .ThenInclude(i => i.Variant)
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

            if (cart == null || cart.Items.Count == 0)
                throw new DomainException("Cannot checkout with an empty shopping cart.");

            foreach (var cartItem in cart.Items)
            {
                var p = cartItem.Product;
                var v = cartItem.Variant;

                var availableStock = v?.Stock ?? p.StockQuantity;
                if (availableStock < cartItem.Quantity)
                    throw new InsufficientStockException(p.Title, cartItem.Quantity, availableStock);

                var linePrice = cartItem.UnitPrice * cartItem.Quantity;
                subtotal += linePrice;

                if (v != null) v.Stock -= cartItem.Quantity;
                p.StockQuantity -= cartItem.Quantity;

                orderItems.Add(new OrderItem
                {
                    ProductId = p.Id,
                    VariantId = v?.Id,
                    ProductName = p.Title,
                    Brand = p.Brand,
                    ProductImage = p.Images.OrderBy(img => img.DisplayOrder).Select(img => img.ImageUrl).FirstOrDefault() ?? "",
                    VariantLabel = v?.Name,
                    UnitPrice = cartItem.UnitPrice,
                    Quantity = cartItem.Quantity,
                    TotalPrice = linePrice
                });
            }

            // Clear user cart
            _context.CartItems.RemoveRange(cart.Items);
        }

        // 4. Calculate Shipping
        const decimal freeShippingThreshold = 500m;
        var isExpress = req.DeliverySpeed.Equals("express", StringComparison.OrdinalIgnoreCase);
        var shippingFee = isExpress ? (subtotal >= freeShippingThreshold ? 0m : 50m) : 0m;

        // 5. Coupon Discount
        decimal discountAmount = 0;
        if (!string.IsNullOrWhiteSpace(req.CouponCode))
        {
            var code = req.CouponCode.Trim().ToUpper();
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code == code && c.IsActive, cancellationToken);

            if (coupon != null && (coupon.ExpiryDate == null || coupon.ExpiryDate > DateTime.UtcNow))
            {
                if (coupon.Type == CouponType.Percentage)
                {
                    discountAmount = Math.Round(subtotal * (coupon.DiscountValue / 100m));
                }
                else if (coupon.Type == CouponType.FreeShipping)
                {
                    discountAmount = shippingFee;
                    shippingFee = 0;
                }
                else if (coupon.Type == CouponType.FixedAmount)
                {
                    discountAmount = Math.Min(subtotal, coupon.DiscountValue);
                }

                coupon.UsageCount++;
            }
        }

        var totalAmount = Math.Max(0, subtotal + shippingFee - discountAmount);

        // 6. Construct Order
        var orderNumber = $"BZR-EG-{Random.Shared.Next(100000, 999999)}";
        var trackingNumber = $"EGY-CAI-{Random.Shared.Next(1000000, 9999999)}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = userId,
            AddressId = address?.Id,
            ShippingFullName = shippingFullName,
            ShippingPhone = shippingPhone,
            ShippingGovernorate = shippingGovernorate,
            ShippingCityArea = shippingCityArea,
            ShippingStreet = shippingStreet,
            ShippingBuilding = shippingBuilding,
            Subtotal = subtotal,
            ShippingFee = shippingFee,
            DiscountAmount = discountAmount,
            TotalAmount = totalAmount,
            Currency = "EGP",
            Status = OrderStatus.Confirmed,
            PaymentMethod = req.PaymentMethod,
            PaymentStatus = req.PaymentMethod == PaymentMethod.Cod ? PaymentStatus.Pending : PaymentStatus.Paid,
            ValuMonths = req.PaymentMethod == PaymentMethod.Valu ? (req.ValuMonths ?? 12) : null,
            TrackingNumber = trackingNumber,
            EstimatedDeliveryDate = isExpress ? "Tomorrow between 2:00 PM - 6:00 PM" : "In 2-3 Business Days",
            Items = orderItems
        };

        _context.Orders.Add(order);

        await _context.SaveChangesAsync(cancellationToken);

        return MapToOrderDto(order);
    }

    internal static OrderDto MapToOrderDto(Order o) => new(
        o.Id,
        o.OrderNumber,
        o.CreatedAt,
        o.Status.ToString(),
        o.PaymentMethod.ToString(),
        o.PaymentStatus.ToString(),
        o.Subtotal,
        o.ShippingFee,
        o.DiscountAmount,
        o.TotalAmount,
        o.Currency,
        o.EstimatedDeliveryDate,
        o.TrackingNumber,
        o.ValuMonths,
        new ShippingAddressDto(
            o.ShippingFullName,
            o.ShippingPhone,
            o.ShippingGovernorate,
            o.ShippingCityArea,
            o.ShippingStreet,
            o.ShippingBuilding,
            null
        ),
        o.Items.Select(i => new OrderItemDto(
            i.Id,
            i.ProductId,
            i.ProductName,
            i.Brand,
            i.ProductImage,
            i.VariantLabel,
            i.UnitPrice,
            i.Quantity,
            i.TotalPrice
        )).ToList()
    );
}

// ── 2. Get User Orders Query ───────────────────────────────
public record GetOrdersQuery(Guid UserId) : IRequest<List<OrderDto>>;

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, List<OrderDto>>
{
    private readonly IAppDbContext _context;

    public GetOrdersQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.UserId == request.UserId)
            .OrderByDescending(o => o.CreatedAt)
            .Include(o => o.Items)
            .Select(o => CreateOrderCommandHandler.MapToOrderDto(o))
            .ToListAsync(cancellationToken);
    }
}

// ── 3. Get Order By Id Query ───────────────────────────────
public record GetOrderByIdQuery(Guid UserId, Guid OrderId) : IRequest<OrderDto>;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto>
{
    private readonly IAppDbContext _context;

    public GetOrderByIdQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && (request.UserId == Guid.Empty || o.UserId == request.UserId), cancellationToken);

        if (order == null)
            throw new EntityNotFoundException(nameof(Order), request.OrderId);

        return CreateOrderCommandHandler.MapToOrderDto(order);
    }
}

