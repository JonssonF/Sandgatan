using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Interfaces.Repositories;

public interface IIncomeRepository
{
    Task<List<Income>> GetByMonthAsync(int year, int month, CancellationToken ct = default);
    Task<Income?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Income> AddAsync(Income income, CancellationToken ct = default);
    Task UpdateAsync(Income income, CancellationToken ct = default);
    Task DeleteAsync(Income income, CancellationToken ct = default);
}
