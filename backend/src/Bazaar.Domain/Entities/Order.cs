using System;
using System.Collections.Generic;
using Bazaar.Domain.Common;
using Bazaar.Domain.Enums;

namespace Bazaar.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty; // e.g. "BZR-EG-894201"
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? AddressId { get; set; }
    public Address? ShippingAddress { get; set; }

    // Snapshot of delivery address at checkout
    public string ShippingFullName { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;
    public string ShippingGovernorate { get; set; } = string.Empty;
    public string ShippingCityArea { get; set; } = string.Empty;
    public string ShippingStreet { get; set; } = string.Empty;
    public string ShippingBuilding { get; set; } = string.Empty;

    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "EGP";

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Card;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    public int? ValuMonths { get; set; }
    public string TrackingNumber { get; set; } = string.Empty;
    public string EstimatedDeliveryDate { get; set; } = string.Empty;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid? VariantId { get; set; }
    public ProductVariant? Variant { get; set; }

    public string ProductName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string ProductImage { get; set; } = string.Empty;
    public string? VariantLabel { get; set; }

    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}

public class Review : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public bool IsVerifiedPurchase { get; set; }
    public string City { get; set; } = string.Empty;
    public int HelpfulCount { get; set; }
}

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public CouponType Type { get; set; } = CouponType.Percentage;
    public decimal DiscountValue { get; set; } // e.g. 10 for 10%, or 50 for 50 EGP
    public decimal MinOrderAmount { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int UsageCount { get; set; }
}

