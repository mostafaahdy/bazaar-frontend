using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Bazaar.Application.Common.Interfaces;
using Bazaar.Application.Common.Models;
using Bazaar.Application.DTOs;
using Bazaar.Domain.Entities;
using Bazaar.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Application.Features.Products;

// ── 1. Get Products Query with Filtering, Sorting & Pagination ─────
public record GetProductsQuery(ProductFilterParams Filters) : IRequest<PagedResult<ProductDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedResult<ProductDto>>
{
    private readonly IAppDbContext _context;

    public GetProductsQueryHandler(IAppDbContext _context)
    {
        this._context = _context;
    }

    public async Task<PagedResult<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var f = request.Filters;
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .AsQueryable();

        // 1. Category Filter
        if (f.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == f.CategoryId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(f.CategorySlug))
        {
            query = query.Where(p => p.Category.Slug == f.CategorySlug.ToLower());
        }

        // 2. Brand Filter
        if (!string.IsNullOrWhiteSpace(f.Brand))
        {
            query = query.Where(p => p.Brand.ToLower() == f.Brand.ToLower());
        }

        // 3. Price Filter
        if (f.MinPrice.HasValue)
        {
            query = query.Where(p => (p.DiscountPrice ?? p.BasePrice) >= f.MinPrice.Value);
        }
        if (f.MaxPrice.HasValue)
        {
            query = query.Where(p => (p.DiscountPrice ?? p.BasePrice) <= f.MaxPrice.Value);
        }

        // 4. Rating Filter
        if (f.MinRating.HasValue)
        {
            query = query.Where(p => p.Rating >= f.MinRating.Value);
        }

        // 5. Stock / Availability
        if (f.InStockOnly == true)
        {
            query = query.Where(p => p.StockQuantity > 0);
        }

        // 6. Express Shipping
        if (f.ExpressOnly == true)
        {
            query = query.Where(p => p.IsExpress);
        }

        // 7. Flash Deals Only
        if (f.FlashDealsOnly == true)
        {
            query = query.Where(p => p.IsFlashDeal);
        }

        // 8. Search query (title, brand, description)
        if (!string.IsNullOrWhiteSpace(f.SearchQuery))
        {
            var search = f.SearchQuery.ToLower().Trim();
            query = query.Where(p =>
                p.Title.ToLower().Contains(search) ||
                p.Brand.ToLower().Contains(search) ||
                p.Description.ToLower().Contains(search) ||
                p.Category.Name.ToLower().Contains(search));
        }

        // 9. Sorting
        query = f.SortBy?.ToLowerInvariant() switch
        {
            "price_asc" or "price-asc" or "price:asc" or "price_low" => query.OrderBy(p => p.DiscountPrice ?? p.BasePrice),
            "price_desc" or "price-desc" or "price:desc" or "price_high" => query.OrderByDescending(p => p.DiscountPrice ?? p.BasePrice),
            "rating" or "highest-rated" or "top-rated" => query.OrderByDescending(p => p.Rating),
            "newest" or "new" => query.OrderByDescending(p => p.CreatedAt),
            "popular" or _ => query.OrderByDescending(p => p.ReviewCount) // Default popular
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var pageNumber = Math.Max(1, f.PageNumber);
        var pageSize = Math.Clamp(f.PageSize, 1, 50);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto(
                p.Id,
                p.Title,
                p.Slug,
                p.Brand,
                p.Category.Name,
                p.CategoryId,
                p.BasePrice,
                p.DiscountPrice,
                p.DiscountPercent,
                p.StockQuantity,
                p.Rating,
                p.ReviewCount,
                p.IsFlashDeal,
                p.IsBestSeller,
                p.IsExpress,
                p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.ImageUrl).FirstOrDefault(),
                p.FlashDealEndsAt
            ))
            .ToListAsync(cancellationToken);

        return new PagedResult<ProductDto>(items, totalCount, pageNumber, pageSize);
    }
}

// ── 2. Get Product By Id ───────────────────────────────────
public record GetProductByIdQuery(Guid Id) : IRequest<ProductDetailDto>;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDetailDto>
{
    private readonly IAppDbContext _context;

    public GetProductByIdQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ProductDetailDto> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var p = await _context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Variants)
            .Include(x => x.Images)
            .Include(x => x.Reviews)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (p == null)
            throw new EntityNotFoundException(nameof(Product), request.Id);

        return MapToDetailDto(p);
    }

    internal static ProductDetailDto MapToDetailDto(Product p) => new(
        p.Id,
        p.Title,
        p.Slug,
        p.Description,
        p.ShortDescription,
        p.Brand,
        p.Category.Name,
        p.CategoryId,
        p.BasePrice,
        p.DiscountPrice,
        p.DiscountPercent,
        p.StockQuantity,
        p.Rating,
        p.ReviewCount,
        p.IsFlashDeal,
        p.IsBestSeller,
        p.IsExpress,
        p.Warranty,
        p.FlashDealEndsAt,
        p.SpecificationsJson,
        p.Variants.Select(v => new ProductVariantDto(
            v.Id,
            v.Name,
            v.Color,
            v.StorageSize,
            v.SKU,
            v.PriceDelta,
            v.FinalPrice,
            v.Stock
        )).ToList(),
        p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto(
            i.Id,
            i.ImageUrl,
            i.Alt,
            i.IsPrimary,
            i.DisplayOrder
        )).ToList(),
        p.Reviews.OrderByDescending(r => r.CreatedAt).Select(r => new ReviewDto(
            r.Id,
            r.User.FullName,
            r.Rating,
            r.Title,
            r.Comment,
            r.IsVerifiedPurchase,
            r.City,
            r.HelpfulCount,
            r.CreatedAt
        )).ToList()
    );
}

// ── 3. Get Product By Slug ─────────────────────────────────
public record GetProductBySlugQuery(string Slug) : IRequest<ProductDetailDto>;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, ProductDetailDto>
{
    private readonly IAppDbContext _context;

    public GetProductBySlugQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ProductDetailDto> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
    {
        var p = await _context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Variants)
            .Include(x => x.Images)
            .Include(x => x.Reviews)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(x => x.Slug == request.Slug.ToLower(), cancellationToken);

        if (p == null)
            throw new EntityNotFoundException(nameof(Product), request.Slug);

        return GetProductByIdQueryHandler.MapToDetailDto(p);
    }
}

// ── 4. Get Flash Deals Rail ────────────────────────────────
public record GetFlashDealsQuery(int Limit = 8) : IRequest<List<ProductDto>>;

public class GetFlashDealsQueryHandler : IRequestHandler<GetFlashDealsQuery, List<ProductDto>>
{
    private readonly IAppDbContext _context;

    public GetFlashDealsQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> Handle(GetFlashDealsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Products
            .AsNoTracking()
            .Where(p => p.IsFlashDeal && p.StockQuantity > 0)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .OrderByDescending(p => p.DiscountPercent)
            .Take(request.Limit)
            .Select(p => new ProductDto(
                p.Id,
                p.Title,
                p.Slug,
                p.Brand,
                p.Category.Name,
                p.CategoryId,
                p.BasePrice,
                p.DiscountPrice,
                p.DiscountPercent,
                p.StockQuantity,
                p.Rating,
                p.ReviewCount,
                p.IsFlashDeal,
                p.IsBestSeller,
                p.IsExpress,
                p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.ImageUrl).FirstOrDefault(),
                p.FlashDealEndsAt
            ))
            .ToListAsync(cancellationToken);
    }
}

