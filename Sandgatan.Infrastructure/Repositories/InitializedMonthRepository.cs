using Microsoft.EntityFrameworkCore;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Domain.Entities;
using Sandgatan.Infrastructure.Persistence;

namespace Sandgatan.Infrastructure.Repositories;

public class InitializedMonthRepository(SandgatanDbContext db) : IInitializedMonthRepository
{
    public Task<bool> IsInitializedAsync(int year, int month, CancellationToken ct = default) =>
        db.InitializedMonths.AnyAsync(m => m.Year == year && m.Month == month, ct);

    public async Task MarkInitializedAsync(int year, int month, CancellationToken ct = default)
    {
        if (await IsInitializedAsync(year, month, ct)) return;
        db.InitializedMonths.Add(new InitializedMonth { Year = year, Month = month, InitializedAt = DateTime.UtcNow });
        await db.SaveChangesAsync(ct);
    }
}
