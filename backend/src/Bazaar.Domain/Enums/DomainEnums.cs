namespace Bazaar.Domain.Enums;

public enum UserRole
{
    Customer = 1,
    Admin = 2
}

public enum OrderStatus
{
    Pending = 1,
    Confirmed = 2,
    Processing = 3,
    Shipped = 4,
    OutForDelivery = 5,
    Delivered = 6,
    Cancelled = 7
}

public enum PaymentMethod
{
    Card = 1,
    Meeza = 2,
    Valu = 3,
    Sympl = 4,
    Cod = 5,
    Wallet = 6
}

public enum PaymentStatus
{
    Pending = 1,
    Authorized = 2,
    Paid = 3,
    Failed = 4,
    Refunded = 5
}

public enum CouponType
{
    Percentage = 1,
    FixedAmount = 2,
    FreeShipping = 3
}

