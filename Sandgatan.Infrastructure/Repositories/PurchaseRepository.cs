using Microsoft.EntityFrameworkCore;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Domain.Entities;
using Sandgatan.Infrastructure.Persistence;

namespace Sandgatan.Infrastructure.Repositories;

public class PurchaseRepository(SandgatanDbContext db) : IPurchaseRepository
{
    public async Task<List<Purchase>> GetByMonthAsync(int year, int month, CancellationToken ct = default) =>
        await db.Purchases
            .Include(p => p.Category)
            .Where(p => p.Year == year && p.Month == month)
            .OrderByDescending(p => p.Date).ThenByDescending(p => p.Id)
            .ToListAsync(ct);

    public Task<Purchase?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.Purchases.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Purchase> AddAsync(Purchase purchase, CancellationToken ct = default)
    {
        db.Purchases.Add(purchase);
        await db.SaveChangesAsync(ct);
        return purchase;
    }

    public async Task UpdateAsync(Purchase purchase, CancellationToken ct = default)
    {
        db.Purchases.Update(purchase);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Purchase purchase, CancellationToken ct = default)
    {
        db.Purchases.Remove(purchase);
        await db.SaveChangesAsync(ct);
    }
}
