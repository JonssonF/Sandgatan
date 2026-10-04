using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Interfaces.Repositories;

public interface IPurchaseRepository
{
    Task<List<Purchase>> GetByMonthAsync(int year, int month, CancellationToken ct = default);
    Task<Purchase?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Purchase> AddAsync(Purchase purchase, CancellationToken ct = default);
    Task UpdateAsync(Purchase purchase, CancellationToken ct = default);
    Task DeleteAsync(Purchase purchase, CancellationToken ct = default);
}
