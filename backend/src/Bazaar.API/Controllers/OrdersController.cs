using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Bazaar.Application.DTOs;
using Bazaar.Application.Features.Orders;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Bazaar.API.Controllers;

public class OrdersController : BaseApiController
{
    private Guid GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(idClaim, out var userId))
            return userId;

        if (Request.Headers.TryGetValue("X-User-Id", out var headerVal) && Guid.TryParse(headerVal, out var headerId))
            return headerId;

        return Guid.Parse("22222222-2222-2222-2222-222222222202");
    }

    [HttpPost]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var userId = GetUserId();
        var result = await Mediator.Send(new CreateOrderCommand(userId, request));
        return Ok(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<OrderDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetOrders()
    {
        var userId = GetUserId();
        var result = await Mediator.Send(new GetOrdersQuery(userId));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetOrderById(Guid id)
    {
        var userId = GetUserId();
        var result = await Mediator.Send(new GetOrderByIdQuery(userId, id));
        return Ok(result);
    }
}

