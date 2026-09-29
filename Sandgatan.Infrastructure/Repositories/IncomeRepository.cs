using Microsoft.EntityFrameworkCore;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Domain.Entities;
using Sandgatan.Infrastructure.Persistence;

namespace Sandgatan.Infrastructure.Repositories;

public class IncomeRepository(SandgatanDbContext db) : IIncomeRepository
{
    public async Task<List<Income>> GetByMonthAsync(int year, int month, CancellationToken ct = default) =>
        await db.Incomes
            .Include(i => i.Category)
            .Where(i => i.Year == year && i.Month == month)
            .OrderBy(i => i.Person).ThenBy(i => i.Name)
            .ToListAsync(ct);

    public Task<Income?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.Incomes.Include(i => i.Category).FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task<Income> AddAsync(Income income, CancellationToken ct = default)
    {
        db.Incomes.Add(income);
        await db.SaveChangesAsync(ct);
        return income;
    }

    public async Task UpdateAsync(Income income, CancellationToken ct = default)
    {
        db.Incomes.Update(income);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Income income, CancellationToken ct = default)
    {
        db.Incomes.Remove(income);
        await db.SaveChangesAsync(ct);
    }
}
