using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Interfaces.Repositories;

public interface IExpenseRepository
{
    Task<List<Expense>> GetByMonthAsync(int year, int month, CancellationToken ct = default);
    Task<Expense?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Expense> AddAsync(Expense expense, CancellationToken ct = default);
    Task UpdateAsync(Expense expense, CancellationToken ct = default);
    Task DeleteAsync(Expense expense, CancellationToken ct = default);
}
