using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Bazaar.Application.Common.Models;
using Bazaar.Application.DTOs;
using Bazaar.Application.Features.Products;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Bazaar.API.Controllers;

public class ProductsController : BaseApiController
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts([FromQuery] ProductFilterParams filterParams)
    {
        var result = await Mediator.Send(new GetProductsQuery(filterParams));
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDetailDto>> GetProduct(string id)
    {
        if (Guid.TryParse(id, out var guid))
        {
            var result = await Mediator.Send(new GetProductByIdQuery(guid));
            return Ok(result);
        }
        else
        {
            var result = await Mediator.Send(new GetProductBySlugQuery(id));
            return Ok(result);
        }
    }

    [HttpGet("by-slug/{slug}")]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDetailDto>> GetProductBySlug(string slug)
    {
        var result = await Mediator.Send(new GetProductBySlugQuery(slug));
        return Ok(result);
    }

    [HttpGet("flash-deals")]
    [ProducesResponseType(typeof(List<ProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductDto>>> GetFlashDeals()
    {
        var result = await Mediator.Send(new GetFlashDealsQuery());
        return Ok(result);
    }
}
