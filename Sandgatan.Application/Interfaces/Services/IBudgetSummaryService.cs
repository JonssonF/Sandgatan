using Sandgatan.Application.Dtos;

namespace Sandgatan.Application.Interfaces.Services;

public interface IBudgetSummaryService
{
    Task<BudgetSummaryDto> GetSummaryAsync(int year, int month, CancellationToken ct = default);
}
