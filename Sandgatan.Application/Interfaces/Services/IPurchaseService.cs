using Sandgatan.Application.Dtos;

namespace Sandgatan.Application.Interfaces.Services;

public interface IPurchaseService
{
    Task<List<PurchaseDto>> GetByMonthAsync(int year, int month, CancellationToken ct = default);
    Task<PurchaseDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PurchaseDto> CreateAsync(UpsertPurchaseDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(int id, UpsertPurchaseDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<SpendingBudgetDto> GetBudgetAsync(int year, int month, CancellationToken ct = default);
    Task<SpendingBudgetDto> SetBudgetAsync(int year, int month, decimal amount, CancellationToken ct = default);
}
