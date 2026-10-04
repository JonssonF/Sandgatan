using Microsoft.EntityFrameworkCore;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Domain.Entities;
using Sandgatan.Infrastructure.Persistence;

namespace Sandgatan.Infrastructure.Repositories;

public class SpendingBudgetRepository(SandgatanDbContext db) : ISpendingBudgetRepository
{
    public Task<SpendingBudget?> GetEffectiveAsync(int year, int month, CancellationToken ct = default) =>
        db.SpendingBudgets
            .Where(b => b.Year < year || (b.Year == year && b.Month <= month))
            .OrderByDescending(b => b.Year).ThenByDescending(b => b.Month)
            .FirstOrDefaultAsync(ct);

    public async Task SetAsync(int year, int month, decimal amount, CancellationToken ct = default)
    {
        var budget = await db.SpendingBudgets.FirstOrDefaultAsync(b => b.Year == year && b.Month == month, ct);
        if (budget is null)
            db.SpendingBudgets.Add(new SpendingBudget { Year = year, Month = month, Amount = amount });
        else
            budget.Amount = amount;
        await db.SaveChangesAsync(ct);
    }
}
