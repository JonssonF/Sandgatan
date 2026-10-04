using Microsoft.EntityFrameworkCore;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Domain.Entities;
using Sandgatan.Infrastructure.Persistence;

namespace Sandgatan.Infrastructure.Repositories;

public class CategoryRepository(SandgatanDbContext db) : ICategoryRepository
{
    public async Task<List<Category>> GetAllAsync(CancellationToken ct = default) =>
        await db.Categories.OrderBy(c => c.Name).ToListAsync(ct);

    public Task<Category?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<bool> IsInUseAsync(int id, CancellationToken ct = default) =>
        await db.Expenses.AnyAsync(e => e.CategoryId == id, ct)
        || await db.Incomes.AnyAsync(i => i.CategoryId == id, ct)
        || await db.Purchases.AnyAsync(p => p.CategoryId == id, ct);

    public async Task<Category> AddAsync(Category category, CancellationToken ct = default)
    {
        db.Categories.Add(category);
        await db.SaveChangesAsync(ct);
        return category;
    }

    public async Task UpdateAsync(Category category, CancellationToken ct = default)
    {
        db.Categories.Update(category);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Category category, CancellationToken ct = default)
    {
        db.Categories.Remove(category);
        await db.SaveChangesAsync(ct);
    }
}
