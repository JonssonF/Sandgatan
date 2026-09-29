using Microsoft.AspNetCore.Mvc;
using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Services;

namespace Sandgatan.Api.Controllers;

[ApiController]
[Route("api/incomes")]
public class IncomesController(IIncomeService incomeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<IncomeDto>>> GetByMonth([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        => Ok(await incomeService.GetByMonthAsync(year, month, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<IncomeDto>> GetById(int id, CancellationToken ct)
    {
        var income = await incomeService.GetByIdAsync(id, ct);
        return income is null ? NotFound() : Ok(income);
    }

    [HttpPost]
    public async Task<ActionResult<IncomeDto>> Create([FromBody] UpsertIncomeDto dto, CancellationToken ct)
    {
        var created = await incomeService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertIncomeDto dto, CancellationToken ct)
        => await incomeService.UpdateAsync(id, dto, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await incomeService.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpPost("{id:int}/copy-to-next-month")]
    public async Task<ActionResult<IncomeDto>> CopyToNextMonth(int id, CancellationToken ct)
    {
        var copy = await incomeService.CopyToNextMonthAsync(id, ct);
        return copy is null ? NotFound() : Ok(copy);
    }
}
