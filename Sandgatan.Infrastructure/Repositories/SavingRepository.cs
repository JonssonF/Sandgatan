using Microsoft.EntityFrameworkCore;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Domain.Entities;
using Sandgatan.Infrastructure.Persistence;

namespace Sandgatan.Infrastructure.Repositories;

public class SavingRepository(SandgatanDbContext db) : ISavingRepository
{
    public async Task<List<Saving>> GetByMonthAsync(int year, int month, CancellationToken ct = default) =>
        await db.Savings
            .Where(s => s.Year == year && s.Month == month)
            .OrderBy(s => s.Name)
            .ToListAsync(ct);

    public Task<Saving?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.Savings.FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<Saving> AddAsync(Saving saving, CancellationToken ct = default)
    {
        db.Savings.Add(saving);
        await db.SaveChangesAsync(ct);
        return saving;
    }

    public async Task UpdateAsync(Saving saving, CancellationToken ct = default)
    {
        db.Savings.Update(saving);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Saving saving, CancellationToken ct = default)
    {
        db.Savings.Remove(saving);
        await db.SaveChangesAsync(ct);
    }
}
