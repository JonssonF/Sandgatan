using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Application.Interfaces.Services;
using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Services;

public class PurchaseService(IPurchaseRepository repository, ISpendingBudgetRepository budgetRepository) : IPurchaseService
{
    public async Task<List<PurchaseDto>> GetByMonthAsync(int year, int month, CancellationToken ct = default)
    {
        var purchases = await repository.GetByMonthAsync(year, month, ct);
        return purchases.Select(ToDto).ToList();
    }

    public async Task<PurchaseDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var purchase = await repository.GetByIdAsync(id, ct);
        return purchase is null ? null : ToDto(purchase);
    }

    public async Task<PurchaseDto> CreateAsync(UpsertPurchaseDto dto, CancellationToken ct = default)
    {
        var purchase = new Purchase();
        Apply(purchase, dto);
        purchase = await repository.AddAsync(purchase, ct);
        var saved = await repository.GetByIdAsync(purchase.Id, ct);
        return ToDto(saved!);
    }

    public async Task<bool> UpdateAsync(int id, UpsertPurchaseDto dto, CancellationToken ct = default)
    {
        var purchase = await repository.GetByIdAsync(id, ct);
        if (purchase is null) return false;

        Apply(purchase, dto);
        await repository.UpdateAsync(purchase, ct);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var purchase = await repository.GetByIdAsync(id, ct);
        if (purchase is null) return false;

        await repository.DeleteAsync(purchase, ct);
        return true;
    }

    public async Task<SpendingBudgetDto> GetBudgetAsync(int year, int month, CancellationToken ct = default)
    {
        var budget = await budgetRepository.GetEffectiveAsync(year, month, ct);
        return new SpendingBudgetDto
        {
            Year = year,
            Month = month,
            Amount = budget?.Amount,
            IsInherited = budget is not null && (budget.Year != year || budget.Month != month)
        };
    }

    public async Task<SpendingBudgetDto> SetBudgetAsync(int year, int month, decimal amount, CancellationToken ct = default)
    {
        await budgetRepository.SetAsync(year, month, amount, ct);
        return new SpendingBudgetDto { Year = year, Month = month, Amount = amount, IsInherited = false };
    }

    private static void Apply(Purchase purchase, UpsertPurchaseDto dto)
    {
        purchase.Name = dto.Name;
        purchase.Amount = dto.Amount;
        purchase.Date = dto.Date;
        purchase.Year = dto.Date.Year;
        purchase.Month = dto.Date.Month;
        purchase.CategoryId = dto.CategoryId;
        purchase.Notes = dto.Notes;
    }

    private static PurchaseDto ToDto(Purchase purchase) => new()
    {
        Id = purchase.Id,
        Name = purchase.Name,
        Amount = purchase.Amount,
        Date = purchase.Date,
        Year = purchase.Year,
        Month = purchase.Month,
        CategoryId = purchase.CategoryId,
        CategoryName = purchase.Category?.Name ?? string.Empty,
        CategoryColor = purchase.Category?.Color,
        Notes = purchase.Notes
    };
}
