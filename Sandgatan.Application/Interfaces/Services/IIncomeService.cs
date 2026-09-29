using Sandgatan.Application.Dtos;

namespace Sandgatan.Application.Interfaces.Services;

public interface IIncomeService
{
    Task<List<IncomeDto>> GetByMonthAsync(int year, int month, CancellationToken ct = default);
    Task<IncomeDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IncomeDto> CreateAsync(UpsertIncomeDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(int id, UpsertIncomeDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<IncomeDto?> CopyToNextMonthAsync(int id, CancellationToken ct = default);
}
