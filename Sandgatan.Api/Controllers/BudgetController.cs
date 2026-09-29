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
}
