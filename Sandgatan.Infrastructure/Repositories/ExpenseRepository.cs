using Microsoft.EntityFrameworkCore;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Domain.Entities;
using Sandgatan.Infrastructure.Persistence;

namespace Sandgatan.Infrastructure.Repositories;

public class ExpenseRepository(SandgatanDbContext db) : IExpenseRepository
{
    public async Task<List<Expense>> GetByMonthAsync(int year, int month, CancellationToken ct = default) =>
        await db.Expenses
            .Include(e => e.Category)
            .Where(e => e.Year == year && e.Month == month)
            .OrderBy(e => e.Category!.Name).ThenBy(e => e.Name)
            .ToListAsync(ct);

    public Task<Expense?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.Expenses.Include(e => e.Category).FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<Expense> AddAsync(Expense expense, CancellationToken ct = default)
    {
        db.Expenses.Add(expense);
        await db.SaveChangesAsync(ct);
        return expense;
    }

    public async Task UpdateAsync(Expense expense, CancellationToken ct = default)
    {
        db.Expenses.Update(expense);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Expense expense, CancellationToken ct = default)
    {
        db.Expenses.Remove(expense);
        await db.SaveChangesAsync(ct);
    }
}
