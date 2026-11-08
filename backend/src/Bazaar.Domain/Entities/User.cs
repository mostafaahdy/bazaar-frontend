using System;
using System.Collections.Generic;
using Bazaar.Domain.Common;
using Bazaar.Domain.Enums;

namespace Bazaar.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;
    public string? AvatarUrl { get; set; }

    // Navigation properties
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public Cart? Cart { get; set; }
}

public class Address : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Governorate { get; set; } = string.Empty;
    public string CityArea { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public string BuildingFloor { get; set; } = string.Empty;
    public string? Landmark { get; set; }
    public bool IsDefault { get; set; }
}

