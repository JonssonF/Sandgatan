using Microsoft.AspNetCore.Mvc;
using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Services;

namespace Sandgatan.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll(CancellationToken ct)
        => Ok(await categoryService.GetAllAsync(ct));

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] UpsertCategoryDto dto, CancellationToken ct)
    {
        var created = await categoryService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetAll), created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertCategoryDto dto, CancellationToken ct)
        => await categoryService.UpdateAsync(id, dto, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var result = await categoryService.DeleteAsync(id, ct);
        return result switch
        {
            DeleteCategoryResult.Deleted => NoContent(),
            DeleteCategoryResult.NotFound => NotFound(),
            DeleteCategoryResult.InUse => Conflict(new { message = "Kategorin används av en eller flera utgifter och kan inte tas bort." }),
            _ => StatusCode(500)
        };
    }
}
