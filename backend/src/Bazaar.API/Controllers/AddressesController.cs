using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Bazaar.Application.Common.Interfaces;
using Bazaar.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.API.Controllers;

[Authorize]
public class AddressesController : BaseApiController
{
    private readonly IAppDbContext _context;

    public AddressesController(IAppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(idClaim, out var userId))
            return userId;

        return Guid.Parse("22222222-2222-2222-2222-222222222202");
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<Address>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetAddresses()
    {
        var userId = GetUserId();
        var addresses = await _context.Addresses
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ToListAsync();

        return Ok(addresses);
    }
}

