using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Interfaces.Repositories;

public interface ISpendingBudgetRepository
{
    /// <summary>The budget set for this month, or else the latest earlier month's; null if none has ever been set.</summary>
    Task<SpendingBudget?> GetEffectiveAsync(int year, int month, CancellationToken ct = default);

    /// <summary>Creates or updates the budget row for exactly this month.</summary>
    Task SetAsync(int year, int month, decimal amount, CancellationToken ct = default);
}
