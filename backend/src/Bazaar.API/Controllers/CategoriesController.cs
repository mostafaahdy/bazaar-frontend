using System.Collections.Generic;
using System.Threading.Tasks;
using Bazaar.Application.DTOs;
using Bazaar.Application.Features.Categories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Bazaar.API.Controllers;

public class CategoriesController : BaseApiController
{
    [HttpGet]
    [ProducesResponseType(typeof(List<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetCategories()
    {
        var result = await Mediator.Send(new GetCategoriesQuery());
        return Ok(result);
    }
}

