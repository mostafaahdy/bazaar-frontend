using System;
using System.Collections.Generic;
using Bazaar.Domain.Enums;

namespace Bazaar.Application.DTOs;

// ── Auth DTOs ──────────────────────────────────────────────
public record RegisterRequest(string FullName, string Email, string Password, string PhoneNumber);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, string RefreshToken, UserProfileDto User);
public record UserProfileDto(Guid Id, string FullName, string Email, string PhoneNumber, string Role, string? AvatarUrl);

// ── Category DTOs ──────────────────────────────────────────
public record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? ImageUrl,
    string? IconName,
    int ProductCount,
    bool IsFeatured
);

// ── Product DTOs ───────────────────────────────────────────
public record ProductDto(
    Guid Id,
    string Title,
    string Slug,
    string Brand,
    string CategoryName,
    Guid CategoryId,
    decimal BasePrice,
    decimal? DiscountPrice,
    int? DiscountPercent,
    int StockQuantity,
    double Rating,
    int ReviewCount,
    bool IsFlashDeal,
    bool IsBestSeller,
    bool IsExpress,
    string? PrimaryImageUrl,
    DateTime? FlashDealEndsAt
);

public record ProductDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string Description,
    string ShortDescription,
    string Brand,
    string CategoryName,
    Guid CategoryId,
    decimal BasePrice,
    decimal? DiscountPrice,
    int? DiscountPercent,
    int StockQuantity,
    double Rating,
    int ReviewCount,
    bool IsFlashDeal,
    bool IsBestSeller,
    bool IsExpress,
    string? Warranty,
    DateTime? FlashDealEndsAt,
    string? SpecificationsJson,
    List<ProductVariantDto> Variants,
    List<ProductImageDto> Images,
    List<ReviewDto> Reviews
);

public record ProductVariantDto(
    Guid Id,
    string Name,
    string? Color,
    string? StorageSize,
    string SKU,
    decimal PriceDelta,
    decimal FinalPrice,
    int Stock
);

public record ProductImageDto(
    Guid Id,
    string ImageUrl,
    string? Alt,
    bool IsPrimary,
    int DisplayOrder
);

public record ReviewDto(
    Guid Id,
    string AuthorName,
    int Rating,
    string Title,
    string Comment,
    bool IsVerifiedPurchase,
    string City,
    int HelpfulCount,
    DateTime CreatedAt
);

public record ProductFilterParams(
    Guid? CategoryId = null,
    string? CategorySlug = null,
    string? Brand = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    double? MinRating = null,
    bool? InStockOnly = null,
    bool? ExpressOnly = null,
    bool? FlashDealsOnly = null,
    string? SearchQuery = null,
    string? SortBy = null, // "price_asc", "price_desc", "rating", "newest", "popular"
    int PageNumber = 1,
    int PageSize = 12
);

// ── Cart DTOs ──────────────────────────────────────────────
public record CartDto(
    Guid Id,
    Guid UserId,
    List<CartItemDto> Items,
    decimal Subtotal,
    int TotalItems,
    decimal ShippingFee,
    bool QualifiesForFreeShipping
);

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string Brand,
    string ProductImage,
    Guid? VariantId,
    string? VariantLabel,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice,
    int MaxStock
);

public record AddToCartRequest(
    Guid ProductId,
    Guid? VariantId,
    int Quantity
);

public record UpdateCartItemRequest(
    int Quantity
);

// ── Order DTOs ─────────────────────────────────────────────
public record OrderItemInputDto(
    string? ProductId,
    string? VariantId,
    string? Name,
    string? Brand,
    string? Image,
    string? VariantLabel,
    decimal Price,
    int Quantity
);

public record CreateOrderRequest(
    Guid? AddressId = null,
    ShippingAddressDto? ShippingAddress = null,
    List<OrderItemInputDto>? Items = null,
    PaymentMethod PaymentMethod = PaymentMethod.Card,
    string DeliverySpeed = "express", // "standard" | "express"
    string? CouponCode = null,
    int? ValuMonths = null
);

public record OrderDto(
    Guid Id,
    string OrderNumber,
    DateTime CreatedAt,
    string Status,
    string PaymentMethod,
    string PaymentStatus,
    decimal Subtotal,
    decimal ShippingFee,
    decimal DiscountAmount,
    decimal TotalAmount,
    string Currency,
    string EstimatedDeliveryDate,
    string TrackingNumber,
    int? ValuMonths,
    ShippingAddressDto ShippingAddress,
    List<OrderItemDto> Items
);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string Brand,
    string ProductImage,
    string? VariantLabel,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice
);

public record ShippingAddressDto(
    string FullName,
    string Phone,
    string Governorate,
    string CityArea,
    string StreetAddress,
    string BuildingFloor,
    string? Landmark
);

// ── Coupon DTOs ────────────────────────────────────────────
public record ValidateCouponRequest(string Code, decimal CartSubtotal);
public record CouponDto(string Code, string Type, decimal DiscountAmount, decimal NewTotal, string Message);

