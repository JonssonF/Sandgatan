using Sandgatan.Application.Dtos;

namespace Sandgatan.Application.Interfaces.Services;

public interface IExpenseService
{
    Task<List<ExpenseDto>> GetByMonthAsync(int year, int month, CancellationToken ct = default);
    Task<ExpenseDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ExpenseDto> CreateAsync(UpsertExpenseDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(int id, UpsertExpenseDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<ExpenseDto?> CopyToNextMonthAsync(int id, CancellationToken ct = default);
}
