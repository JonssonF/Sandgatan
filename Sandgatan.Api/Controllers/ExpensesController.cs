using Microsoft.AspNetCore.Mvc;
using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Services;

namespace Sandgatan.Api.Controllers;

[ApiController]
[Route("api/expenses")]
public class ExpensesController(IExpenseService expenseService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ExpenseDto>>> GetByMonth([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        => Ok(await expenseService.GetByMonthAsync(year, month, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ExpenseDto>> GetById(int id, CancellationToken ct)
    {
        var expense = await expenseService.GetByIdAsync(id, ct);
        return expense is null ? NotFound() : Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> Create([FromBody] UpsertExpenseDto dto, CancellationToken ct)
    {
        var created = await expenseService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertExpenseDto dto, CancellationToken ct)
        => await expenseService.UpdateAsync(id, dto, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await expenseService.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpPost("{id:int}/copy-to-next-month")]
    public async Task<ActionResult<ExpenseDto>> CopyToNextMonth(int id, CancellationToken ct)
    {
        var copy = await expenseService.CopyToNextMonthAsync(id, ct);
        return copy is null ? NotFound() : Ok(copy);
    }
}
