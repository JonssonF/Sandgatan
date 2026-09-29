using Sandgatan.Application.Dtos;

namespace Sandgatan.Application.Interfaces.Services;

public interface ISavingService
{
    Task<List<SavingDto>> GetByMonthAsync(int year, int month, CancellationToken ct = default);
    Task<SavingDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<SavingDto> CreateAsync(UpsertSavingDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(int id, UpsertSavingDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<SavingDto?> CopyToNextMonthAsync(int id, CancellationToken ct = default);
}
