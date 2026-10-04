using Microsoft.AspNetCore.Mvc;
using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Services;

namespace Sandgatan.Api.Controllers;

[ApiController]
[Route("api/purchases")]
public class PurchasesController(IPurchaseService purchaseService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PurchaseDto>>> GetByMonth([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        => Ok(await purchaseService.GetByMonthAsync(year, month, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PurchaseDto>> GetById(int id, CancellationToken ct)
    {
        var purchase = await purchaseService.GetByIdAsync(id, ct);
        return purchase is null ? NotFound() : Ok(purchase);
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseDto>> Create([FromBody] UpsertPurchaseDto dto, CancellationToken ct)
    {
        var created = await purchaseService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertPurchaseDto dto, CancellationToken ct)
        => await purchaseService.UpdateAsync(id, dto, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await purchaseService.DeleteAsync(id, ct) ? NoContent() : NotFound();

    /// <summary>The month's everyday-purchase budget (inherited from the latest earlier month if not set).</summary>
    [HttpGet("budget/{year:int}/{month:int}")]
    public async Task<ActionResult<SpendingBudgetDto>> GetBudget(int year, int month, CancellationToken ct)
        => Ok(await purchaseService.GetBudgetAsync(year, month, ct));

    /// <summary>Sets the budget from this month onwards (until a later month sets its own).</summary>
    [HttpPut("budget/{year:int}/{month:int}")]
    public async Task<ActionResult<SpendingBudgetDto>> SetBudget(int year, int month, [FromBody] SetSpendingBudgetDto dto, CancellationToken ct)
        => Ok(await purchaseService.SetBudgetAsync(year, month, dto.Amount, ct));
}
