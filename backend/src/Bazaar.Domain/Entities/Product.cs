using System;
using System.Collections.Generic;
using Bazaar.Domain.Common;

namespace Bazaar.Domain.Entities;

public class Product : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;

    public decimal BasePrice { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int? DiscountPercent { get; set; }

    public int StockQuantity { get; set; }
    public double Rating { get; set; } = 5.0;
    public int ReviewCount { get; set; }

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public bool IsFlashDeal { get; set; }
    public bool IsBestSeller { get; set; }
    public bool IsTrending { get; set; }
    public bool IsFeatured { get; set; } = true;
    public bool IsExpress { get; set; } = true;
    public DateTime? FlashDealEndsAt { get; set; }
    public string? Warranty { get; set; }

    // Specifications stored in JSON or Dictionary
    public string? SpecificationsJson { get; set; }

    // Navigation properties
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string Name { get; set; } = string.Empty; // e.g. "256GB / Natural Titanium"
    public string? Color { get; set; }
    public string? StorageSize { get; set; }
    public string SKU { get; set; } = string.Empty;
    public decimal PriceDelta { get; set; } // Added or base difference
    public decimal FinalPrice { get; set; }
    public int Stock { get; set; }
}

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string ImageUrl { get; set; } = string.Empty;
    public string? Alt { get; set; }
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
}
