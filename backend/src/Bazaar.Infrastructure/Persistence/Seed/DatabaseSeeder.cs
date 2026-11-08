using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Bazaar.Application.Common.Interfaces;
using Bazaar.Domain.Entities;
using Bazaar.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        // 1. Seed Categories if empty
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111101"),
                    Name = "Mobiles",
                    Slug = "mobiles",
                    Description = "Latest smartphones, flagship phones, and accessories.",
                    IconName = "Smartphone",
                    DisplayOrder = 1,
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80"
                },
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111102"),
                    Name = "Electronics",
                    Slug = "electronics",
                    Description = "Audio, cameras, gaming consoles, smart home accessories.",
                    IconName = "Cpu",
                    DisplayOrder = 2,
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80"
                },
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111103"),
                    Name = "Computers",
                    Slug = "computers",
                    Description = "Laptops, monitors, PC components, and office accessories.",
                    IconName = "Monitor",
                    DisplayOrder = 3,
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80"
                },
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111104"),
                    Name = "Fashion",
                    Slug = "fashion",
                    Description = "Men's, women's apparel, footwear, and trending watches.",
                    IconName = "Shirt",
                    DisplayOrder = 4,
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"
                },
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111105"),
                    Name = "Appliances",
                    Slug = "appliances",
                    Description = "Home and kitchen appliances, air fryers, and vacuum cleaners.",
                    IconName = "Zap",
                    DisplayOrder = 5,
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80"
                },
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111106"),
                    Name = "Sports",
                    Slug = "sports",
                    Description = "Running shoes, activewear, training gear, and fitness accessories.",
                    IconName = "Dumbbell",
                    DisplayOrder = 6,
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80"
                },
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111107"),
                    Name = "Home & Living",
                    Slug = "home",
                    Description = "Furniture, lighting, kitchenware, bedding, and home decoration.",
                    IconName = "Home",
                    DisplayOrder = 7,
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80"
                },
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111108"),
                    Name = "Baby Products",
                    Slug = "baby",
                    Description = "Diapers, strollers, nursery gear, baby food, and baby clothes.",
                    IconName = "Baby",
                    DisplayOrder = 8,
                    IsFeatured = true,
                    ImageUrl = "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80"
                }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        // 2. Seed Users & Addresses if empty
        if (!await context.Users.AnyAsync())
        {
            var adminUser = new User
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222201"),
                FullName = "Bazaar Admin",
                Email = "admin@bazaar.eg",
                PasswordHash = passwordHasher.HashPassword("Admin@Bazaar2026"),
                PhoneNumber = "+201001234567",
                Role = UserRole.Admin,
                AvatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
            };

            var customerUser = new User
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222202"),
                FullName = "Ahmed Hassan",
                Email = "customer@bazaar.eg",
                PasswordHash = passwordHasher.HashPassword("Customer@123"),
                PhoneNumber = "+20 100 123 4567",
                Role = UserRole.Customer,
                AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
            };

            var defaultAddress = new Address
            {
                Id = Guid.NewGuid(),
                UserId = customerUser.Id,
                FullName = "Ahmed Hassan",
                Phone = "+20 100 123 4567",
                Governorate = "Cairo",
                CityArea = "El Obour City",
                StreetAddress = "District 7, Street 12, Building 14",
                BuildingFloor = "Floor 2, Apt 3",
                Landmark = "Near City Club",
                IsDefault = true
            };

            var officeAddress = new Address
            {
                Id = Guid.NewGuid(),
                UserId = customerUser.Id,
                FullName = "Ahmed Hassan (Tech Lab)",
                Phone = "+20 100 123 4567",
                Governorate = "Giza",
                CityArea = "Dokki / Mohandessin",
                StreetAddress = "15 Mosaddak Street, Tech Center",
                BuildingFloor = "Floor 5, Suite 502",
                Landmark = "Behind Shooting Club",
                IsDefault = false
            };

            var customerCart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = customerUser.Id
            };

            await context.Users.AddRangeAsync(adminUser, customerUser);
            await context.Addresses.AddRangeAsync(defaultAddress, officeAddress);
            await context.Carts.AddAsync(customerCart);
            await context.SaveChangesAsync();
        }

        // 3. Seed Coupons if empty
        if (!await context.Coupons.AnyAsync())
        {
            var coupons = new List<Coupon>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Code = "EGYPT10",
                    Type = CouponType.Percentage,
                    DiscountValue = 10m,
                    MinOrderAmount = 500m,
                    IsActive = true,
                    ExpiryDate = DateTime.UtcNow.AddMonths(3)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Code = "WELCOME20",
                    Type = CouponType.Percentage,
                    DiscountValue = 20m,
                    MinOrderAmount = 1000m,
                    IsActive = true,
                    ExpiryDate = DateTime.UtcNow.AddMonths(1)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Code = "VALU100",
                    Type = CouponType.FixedAmount,
                    DiscountValue = 100m,
                    MinOrderAmount = 2000m,
                    IsActive = true,
                    ExpiryDate = DateTime.UtcNow.AddMonths(6)
                }
            };
            await context.Coupons.AddRangeAsync(coupons);
            await context.SaveChangesAsync();
        }

        // 4. Seed Products if empty
        if (!await context.Products.AnyAsync())
        {
            var mobilesCatId = Guid.Parse("11111111-1111-1111-1111-111111111101");
            var elecCatId = Guid.Parse("11111111-1111-1111-1111-111111111102");
            var compCatId = Guid.Parse("11111111-1111-1111-1111-111111111103");
            var fashionCatId = Guid.Parse("11111111-1111-1111-1111-111111111104");
            var appliancesCatId = Guid.Parse("11111111-1111-1111-1111-111111111105");
            var sportsCatId = Guid.Parse("11111111-1111-1111-1111-111111111106");

            var products = new List<Product>
            {
                // 1. iPhone 15 Pro Max
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333301"),
                    Title = "Apple iPhone 15 Pro Max 256GB Natural Titanium",
                    Slug = "iphone-15-pro-max",
                    Brand = "Apple",
                    CategoryId = mobilesCatId,
                    BasePrice = 72999m,
                    DiscountPrice = 59999m,
                    DiscountPercent = 18,
                    StockQuantity = 15,
                    Rating = 4.9,
                    ReviewCount = 2847,
                    IsFlashDeal = true,
                    IsBestSeller = true,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    FlashDealEndsAt = DateTime.UtcNow.AddHours(14),
                    Warranty = "1 Year Official Apple Egypt Warranty",
                    ShortDescription = "Titanium design · A17 Pro · 48MP ProRAW camera · USB 3",
                    Description = "The iPhone 15 Pro Max features aerospace-grade titanium design, lighter than ever. Powered by the groundbreaking A17 Pro chip with next-level gaming performance.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80", Alt = "iPhone 15 Pro Max Front", IsPrimary = true, DisplayOrder = 1 },
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80", Alt = "iPhone 15 Pro Max Side", IsPrimary = false, DisplayOrder = 2 }
                    },
                    Variants = new List<ProductVariant>
                    {
                        new() { Id = Guid.NewGuid(), Name = "256GB / Natural Titanium", Color = "Natural Titanium", StorageSize = "256GB", SKU = "IP15PM-256-NT", PriceDelta = 0, FinalPrice = 59999m, Stock = 10 },
                        new() { Id = Guid.NewGuid(), Name = "512GB / Black Titanium", Color = "Black Titanium", StorageSize = "512GB", SKU = "IP15PM-512-BT", PriceDelta = 10000, FinalPrice = 69999m, Stock = 5 }
                    }
                },

                // 2. Samsung Galaxy S24 Ultra
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333302"),
                    Title = "Samsung Galaxy S24 Ultra 512GB Titanium Black",
                    Slug = "samsung-galaxy-s24-ultra",
                    Brand = "Samsung",
                    CategoryId = mobilesCatId,
                    BasePrice = 65000m,
                    DiscountPrice = 54999m,
                    DiscountPercent = 15,
                    StockQuantity = 22,
                    Rating = 4.8,
                    ReviewCount = 1965,
                    IsFlashDeal = true,
                    IsBestSeller = true,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    FlashDealEndsAt = DateTime.UtcNow.AddHours(14),
                    Warranty = "1 Year Samsung Official Warranty",
                    ShortDescription = "S Pen · 200MP · AI features · Snapdragon 8 Gen 3",
                    Description = "Galaxy S24 Ultra with built-in S Pen, 200MP camera, Snapdragon 8 Gen 3, and groundbreaking Galaxy AI capabilities for real-time translation and photo editing.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80", Alt = "Samsung Galaxy S24 Ultra", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 3. Sony WH-1000XM5
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333303"),
                    Title = "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
                    Slug = "sony-wh1000xm5",
                    Brand = "Sony",
                    CategoryId = elecCatId,
                    BasePrice = 14999m,
                    DiscountPrice = 10999m,
                    DiscountPercent = 27,
                    StockQuantity = 42,
                    Rating = 4.9,
                    ReviewCount = 5621,
                    IsFlashDeal = true,
                    IsBestSeller = false,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    FlashDealEndsAt = DateTime.UtcNow.AddHours(10),
                    Warranty = "2 Years Sony Warranty",
                    ShortDescription = "Industry ANC · 30hr battery · 2-device multipoint",
                    Description = "Industry-leading noise cancellation with two processors and 8 microphones. Enjoy ultra-clear hands-free calling and up to 30 hours of battery life.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80", Alt = "Sony WH-1000XM5", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 4. MacBook Air M3
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333304"),
                    Title = "Apple MacBook Air 13\" M3 chip 8GB RAM 256GB SSD",
                    Slug = "macbook-air-m3",
                    Brand = "Apple",
                    CategoryId = compCatId,
                    BasePrice = 49999m,
                    DiscountPrice = 42999m,
                    DiscountPercent = 14,
                    StockQuantity = 18,
                    Rating = 4.9,
                    ReviewCount = 1203,
                    IsFlashDeal = false,
                    IsBestSeller = true,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    Warranty = "1 Year Apple Limited Warranty",
                    ShortDescription = "M3 chip · 18hr battery · 13.6\" Liquid Retina · MagSafe",
                    Description = "MacBook Air with M3 chip is strikingly thin, with a brilliant Liquid Retina display, up to 18 hours of battery life, and all-new MagSafe charging.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80", Alt = "MacBook Air M3", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 5. Samsung 65" Neo QLED
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333305"),
                    Title = "Samsung 65\" Neo QLED 4K Smart TV QN65QN90C",
                    Slug = "samsung-qled-65",
                    Brand = "Samsung",
                    CategoryId = elecCatId,
                    BasePrice = 44999m,
                    DiscountPrice = 32999m,
                    DiscountPercent = 27,
                    StockQuantity = 7,
                    Rating = 4.7,
                    ReviewCount = 892,
                    IsFlashDeal = true,
                    IsBestSeller = true,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    FlashDealEndsAt = DateTime.UtcNow.AddHours(10),
                    Warranty = "2 Years Samsung Warranty",
                    ShortDescription = "65\" Neo QLED · Neural Quantum Processor · Dolby Atmos",
                    Description = "65\" Neo QLED 4K TV with Neural Quantum Processor, Quantum HDR+, and Object Tracking Sound+ for immersive cinema experiences.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80", Alt = "Samsung QLED TV", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 6. Nike Air Max 270
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333306"),
                    Title = "Nike Air Max 270 Sneakers — Men's Running Shoes",
                    Slug = "nike-air-max-270",
                    Brand = "Nike",
                    CategoryId = fashionCatId,
                    BasePrice = 4299m,
                    DiscountPrice = 3299m,
                    DiscountPercent = 23,
                    StockQuantity = 85,
                    Rating = 4.6,
                    ReviewCount = 7845,
                    IsFlashDeal = false,
                    IsBestSeller = true,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    Warranty = "6 Months Manufacturer Warranty",
                    ShortDescription = "Max Air heel · Foam midsole · Breathable mesh upper",
                    Description = "The Nike Air Max 270 features Nike's biggest heel Air unit yet for a super-soft ride that feels as impossible as it looks.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", Alt = "Nike Air Max 270", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 7. Dyson V15 Detect
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333307"),
                    Title = "Dyson V15 Detect Cordless Vacuum Cleaner",
                    Slug = "dyson-v15-detect",
                    Brand = "Dyson",
                    CategoryId = appliancesCatId,
                    BasePrice = 19999m,
                    DiscountPrice = 14999m,
                    DiscountPercent = 25,
                    StockQuantity = 12,
                    Rating = 4.8,
                    ReviewCount = 2156,
                    IsFlashDeal = true,
                    IsBestSeller = true,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    FlashDealEndsAt = DateTime.UtcNow.AddHours(8),
                    Warranty = "2 Years Dyson Warranty",
                    ShortDescription = "Laser dust detection · LCD screen · 60min runtime",
                    Description = "Dyson V15 Detect laser reveals microscopic dust, with an LCD screen showing particle count and real-time cleaning statistics.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80", Alt = "Dyson V15 Vacuum", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 8. Logitech MX Master 3S
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333308"),
                    Title = "Logitech MX Master 3S Performance Wireless Mouse",
                    Slug = "logitech-mx-master-3s",
                    Brand = "Logitech",
                    CategoryId = compCatId,
                    BasePrice = 3999m,
                    DiscountPrice = 2999m,
                    DiscountPercent = 25,
                    StockQuantity = 54,
                    Rating = 4.9,
                    ReviewCount = 11234,
                    IsFlashDeal = false,
                    IsBestSeller = true,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    Warranty = "1 Year Logitech Warranty",
                    ShortDescription = "8K DPI · Silent clicks · MagSpeed scroll · 70-day battery",
                    Description = "The MX Master 3S has an 8K DPI sensor, nearly silent clicks, and ultra-fast MagSpeed scrolling for maximum productivity.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80", Alt = "Logitech MX Master 3S", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 9. Samsung Galaxy Tab S9 Ultra
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333309"),
                    Title = "Samsung Galaxy Tab S9 Ultra 12.4\" 256GB",
                    Slug = "samsung-galaxy-tab-s9-ultra",
                    Brand = "Samsung",
                    CategoryId = elecCatId,
                    BasePrice = 29999m,
                    DiscountPrice = 24999m,
                    DiscountPercent = 17,
                    StockQuantity = 20,
                    Rating = 4.7,
                    ReviewCount = 1532,
                    IsFlashDeal = false,
                    IsBestSeller = false,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    Warranty = "1 Year Samsung Warranty",
                    ShortDescription = "12.4\" Dynamic AMOLED · S Pen included · Snapdragon 8 Gen 2",
                    Description = "Galaxy Tab S9 Ultra with 12.4\" Dynamic AMOLED 2X display, Snapdragon 8 Gen 2, and built-in S Pen for ultimate creativity.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80", Alt = "Samsung Galaxy Tab S9", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 10. Adidas Ultraboost 23
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333310"),
                    Title = "Adidas Ultraboost 23 Running Shoes — Women's",
                    Slug = "adidas-ultraboost-23-women",
                    Brand = "Adidas",
                    CategoryId = sportsCatId,
                    BasePrice = 4799m,
                    DiscountPrice = 3599m,
                    DiscountPercent = 25,
                    StockQuantity = 60,
                    Rating = 4.8,
                    ReviewCount = 4532,
                    IsFlashDeal = false,
                    IsBestSeller = true,
                    IsTrending = false,
                    IsFeatured = true,
                    IsExpress = true,
                    Warranty = "6 Months Warranty",
                    ShortDescription = "BOOST midsole · Primeknit+ upper · Continental rubber sole",
                    Description = "Ultraboost 23 features BOOST midsole technology with a Linear Energy Push system for a smooth, forward-propelling stride.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80", Alt = "Adidas Ultraboost 23", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 11. AirPods Pro (2nd Gen)
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333311"),
                    Title = "Apple AirPods Pro (2nd Gen) with MagSafe Case",
                    Slug = "airpods-pro-2nd-gen",
                    Brand = "Apple",
                    CategoryId = elecCatId,
                    BasePrice = 9999m,
                    DiscountPrice = 7999m,
                    DiscountPercent = 20,
                    StockQuantity = 35,
                    Rating = 4.9,
                    ReviewCount = 8945,
                    IsFlashDeal = false,
                    IsBestSeller = true,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    Warranty = "1 Year Apple Warranty",
                    ShortDescription = "Adaptive ANC · 6hr battery · H2 chip · Spatial Audio",
                    Description = "AirPods Pro with Adaptive Audio, Transparency mode, and Personalized Spatial Audio for an immersive listening experience.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80", Alt = "AirPods Pro 2nd Gen", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 12. Nespresso Vertuo Next
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333312"),
                    Title = "Nespresso Vertuo Next Premium Coffee Machine",
                    Slug = "nespresso-vertuo-next",
                    Brand = "Nespresso",
                    CategoryId = appliancesCatId,
                    BasePrice = 5999m,
                    DiscountPrice = 4499m,
                    DiscountPercent = 25,
                    StockQuantity = 28,
                    Rating = 4.6,
                    ReviewCount = 3214,
                    IsFlashDeal = false,
                    IsBestSeller = false,
                    IsTrending = true,
                    IsFeatured = true,
                    IsExpress = true,
                    Warranty = "2 Years Nespresso Warranty",
                    ShortDescription = "Centrifusion · 5 cup sizes · Bluetooth · 25s heat-up",
                    Description = "Nespresso Vertuo Next with Bluetooth connectivity, 5 cup sizes, and intelligent extraction with centrifusion technology.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80", Alt = "Nespresso Vertuo Next", IsPrimary = true, DisplayOrder = 1 }
                    }
                },

                // 13. Anker Soundcore Life P3
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333313"),
                    Title = "Anker Soundcore Life P3 Wireless Earbuds with Multi-Mode ANC",
                    Slug = "anker-soundcore-life-p3",
                    Brand = "Anker",
                    CategoryId = elecCatId,
                    BasePrice = 1999m,
                    DiscountPrice = 1499m,
                    DiscountPercent = 25,
                    StockQuantity = 65,
                    Rating = 4.7,
                    ReviewCount = 4210,
                    IsFlashDeal = false,
                    IsBestSeller = true,
                    IsTrending = false,
                    IsFeatured = true,
                    IsExpress = true,
                    Warranty = "18 Months Anker Warranty",
                    ShortDescription = "11mm composite drivers · Multi-mode ANC · 35h total playtime",
                    Description = "Custom 11mm drivers, targeted active noise cancellation, and 35-hour playtime with wireless charging.",
                    Images = new List<ProductImage>
                    {
                        new() { Id = Guid.NewGuid(), ImageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80", Alt = "Anker Soundcore Earbuds", IsPrimary = true, DisplayOrder = 1 }
                    }
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }
    }
}
