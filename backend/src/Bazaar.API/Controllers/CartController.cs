using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Bazaar.Application.DTOs;
using Bazaar.Application.Features.Cart;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Bazaar.API.Controllers;

public class CartController : BaseApiController
{
    private Guid GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(idClaim, out var userId))
            return userId;

        if (Request.Headers.TryGetValue("X-User-Id", out var headerVal) && Guid.TryParse(headerVal, out var headerId))
            return headerId;

        // Default seeded customer for easy testing & guest exploration
        return Guid.Parse("22222222-2222-2222-2222-222222222202");
    }

    [HttpGet]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetCart()
    {
        var userId = GetUserId();
        var result = await Mediator.Send(new GetCartQuery(userId));
        return Ok(result);
    }

    [HttpPost("items")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> AddItem([FromBody] AddToCartRequest request)
    {
        var userId = GetUserId();
        var result = await Mediator.Send(new AddToCartCommand(userId, request));
        return Ok(result);
    }

    [HttpPut("items/{id:guid}")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UpdateItem(Guid id, [FromBody] UpdateCartItemRequest request)
    {
        var userId = GetUserId();
        var result = await Mediator.Send(new UpdateCartItemCommand(userId, id, request.Quantity));
        return Ok(result);
    }

    [HttpDelete("items/{id:guid}")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    public async Task<ActionResult> RemoveItem(Guid id)
    {
        var userId = GetUserId();
        var result = await Mediator.Send(new RemoveCartItemCommand(userId, id));
        return Ok(result);
    }
}

