using System;
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

namespace Bazaar.Application.Features.Auth;

// ── 1. Register Command ────────────────────────────────────
public record RegisterCommand(RegisterRequest Request) : IRequest<AuthResponse>;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Request.FullName).NotEmpty().MinimumLength(3).MaximumLength(100);
        RuleFor(x => x.Request.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Request.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.Request.PhoneNumber).NotEmpty();
    }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly IAppDbContext _context;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;

    public RegisterCommandHandler(IAppDbContext context, IPasswordHasher hasher, IJwtTokenService jwt)
    {
        _context = context;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AuthResponse> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;
        var email = req.Email.Trim().ToLowerInvariant();

        var exists = await _context.Users.AnyAsync(u => u.Email == email, cancellationToken);
        if (exists)
            throw new DomainException("An account with this email address already exists.");

        var user = new User
        {
            FullName = req.FullName.Trim(),
            Email = email,
            PasswordHash = _hasher.HashPassword(req.Password),
            PhoneNumber = req.PhoneNumber.Trim(),
            Role = UserRole.Customer,
            AvatarUrl = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(email)}"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var token = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();

        var profile = new UserProfileDto(user.Id, user.FullName, user.Email, user.PhoneNumber, user.Role.ToString(), user.AvatarUrl);
        return new AuthResponse(token, refreshToken, profile);
    }
}

// ── 2. Login Command ───────────────────────────────────────
public record LoginCommand(LoginRequest Request) : IRequest<AuthResponse>;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Request.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Request.Password).NotEmpty();
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IAppDbContext _context;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;

    public LoginCommandHandler(IAppDbContext context, IPasswordHasher hasher, IJwtTokenService jwt)
    {
        _context = context;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AuthResponse> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;
        var email = req.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user == null || !_hasher.VerifyPassword(req.Password, user.PasswordHash))
            throw new DomainException("Invalid email or password credentials.");

        var token = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();

        var profile = new UserProfileDto(user.Id, user.FullName, user.Email, user.PhoneNumber, user.Role.ToString(), user.AvatarUrl);
        return new AuthResponse(token, refreshToken, profile);
    }
}

// ── 3. Get Current User Query ──────────────────────────────
public record GetCurrentUserQuery(Guid UserId) : IRequest<UserProfileDto>;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserProfileDto>
{
    private readonly IAppDbContext _context;

    public GetCurrentUserQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<UserProfileDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user == null)
            throw new EntityNotFoundException(nameof(User), request.UserId);

        return new UserProfileDto(user.Id, user.FullName, user.Email, user.PhoneNumber, user.Role.ToString(), user.AvatarUrl);
    }
}

