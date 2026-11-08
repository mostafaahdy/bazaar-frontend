using System;
using System.Threading;
using System.Threading.Tasks;
using Bazaar.Application.Common.Interfaces;
using Bazaar.Application.DTOs;
using Bazaar.Domain.Enums;
using Bazaar.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Application.Features.Coupons;

public record ValidateCouponCommand(ValidateCouponRequest Request) : IRequest<CouponDto>;

public class ValidateCouponCommandHandler : IRequestHandler<ValidateCouponCommand, CouponDto>
{
    private readonly IAppDbContext _context;

    public ValidateCouponCommandHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<CouponDto> Handle(ValidateCouponCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;
        var code = req.Code.Trim().ToUpperInvariant();

        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == code && c.IsActive, cancellationToken);

        if (coupon == null)
            throw new DomainException($"Invalid promo code '{code}'. Try EGYPT10, WELCOME15 or CAIROFREE.");

        if (coupon.ExpiryDate.HasValue && coupon.ExpiryDate.Value < DateTime.UtcNow)
            throw new DomainException($"Coupon '{code}' has expired.");

        if (req.CartSubtotal < coupon.MinOrderAmount)
            throw new DomainException($"Coupon requires a minimum order of {coupon.MinOrderAmount:N0} EGP.");

        decimal discountAmount = 0;
        if (coupon.Type == CouponType.Percentage)
        {
            discountAmount = Math.Round(req.CartSubtotal * (coupon.DiscountValue / 100m));
        }
        else if (coupon.Type == CouponType.FreeShipping)
        {
            discountAmount = 50m; // standard shipping discount
        }
        else if (coupon.Type == CouponType.FixedAmount)
        {
            discountAmount = Math.Min(req.CartSubtotal, coupon.DiscountValue);
        }

        var newTotal = Math.Max(0, req.CartSubtotal - discountAmount);

        return new CouponDto(
            coupon.Code,
            coupon.Type.ToString(),
            discountAmount,
            newTotal,
            $"Promo code {coupon.Code} applied successfully! You saved {discountAmount:N0} EGP."
        );
    }
}

