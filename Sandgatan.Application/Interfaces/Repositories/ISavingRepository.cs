using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Interfaces.Repositories;

public interface ISavingRepository
{
    Task<List<Saving>> GetByMonthAsync(int year, int month, CancellationToken ct = default);
    Task<Saving?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Saving> AddAsync(Saving saving, CancellationToken ct = default);
    Task UpdateAsync(Saving saving, CancellationToken ct = default);
    Task DeleteAsync(Saving saving, CancellationToken ct = default);
}
