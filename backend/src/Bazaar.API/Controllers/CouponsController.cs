using System.Threading.Tasks;
using Bazaar.Application.DTOs;
using Bazaar.Application.Features.Coupons;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Bazaar.API.Controllers;

public class CouponsController : BaseApiController
{
    [HttpPost("validate")]
    [ProducesResponseType(typeof(CouponDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ValidateCoupon([FromBody] ValidateCouponRequest request)
    {
        var result = await Mediator.Send(new ValidateCouponCommand(request));
        return Ok(result);
    }
}

