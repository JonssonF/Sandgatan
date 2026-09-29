using Microsoft.AspNetCore.Mvc;
using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Services;

namespace Sandgatan.Api.Controllers;

[ApiController]
[Route("api/savings")]
public class SavingsController(ISavingService savingService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<SavingDto>>> GetByMonth([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        => Ok(await savingService.GetByMonthAsync(year, month, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SavingDto>> GetById(int id, CancellationToken ct)
    {
        var saving = await savingService.GetByIdAsync(id, ct);
        return saving is null ? NotFound() : Ok(saving);
    }

    [HttpPost]
    public async Task<ActionResult<SavingDto>> Create([FromBody] UpsertSavingDto dto, CancellationToken ct)
    {
        var created = await savingService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertSavingDto dto, CancellationToken ct)
        => await savingService.UpdateAsync(id, dto, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await savingService.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpPost("{id:int}/copy-to-next-month")]
    public async Task<ActionResult<SavingDto>> CopyToNextMonth(int id, CancellationToken ct)
    {
        var copy = await savingService.CopyToNextMonthAsync(id, ct);
        return copy is null ? NotFound() : Ok(copy);
    }
}
