using Microsoft.AspNetCore.Mvc;
using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Services;

namespace Sandgatan.Api.Controllers;

[ApiController]
[Route("api/budget")]
public class BudgetController(IBudgetSummaryService summaryService, IRecurringCopyService recurringCopyService) : ControllerBase
{
    [HttpGet("{year:int}/{month:int}/summary")]
    public async Task<ActionResult<BudgetSummaryDto>> GetSummary(int year, int month, CancellationToken ct)
        => Ok(await summaryService.GetSummaryAsync(year, month, ct));

    [HttpPost("{year:int}/{month:int}/copy-recurring")]
    public async Task<ActionResult<CopyRecurringResultDto>> CopyRecurring(int year, int month, CancellationToken ct)
        => Ok(await recurringCopyService.CopyRecurringFromPreviousMonthAsync(year, month, ct));

    /// <summary>Copies the selected (or, without a body, all) entries from this month to the next. Names that already exist there are skipped.</summary>
    [HttpPost("{year:int}/{month:int}/copy-to-next-month")]
    public async Task<ActionResult<CopyRecurringResultDto>> CopyToNextMonth(int year, int month, [FromBody] CopyToNextMonthRequestDto? selection, CancellationToken ct)
        => Ok(await recurringCopyService.CopyToNextMonthAsync(year, month, selection, ct));

    /// <summary>Called by the frontend whenever a month is opened — carries recurring entries over automatically.</summary>
    [HttpPost("{year:int}/{month:int}/ensure-initialized")]
    public async Task<ActionResult<CopyRecurringResultDto>> EnsureInitialized(int year, int month, CancellationToken ct)
        => Ok(await recurringCopyService.EnsureMonthInitializedAsync(year, month, DateOnly.FromDateTime(DateTime.Today), ct));
}
