using Sandgatan.Application.Common;
using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Application.Interfaces.Services;
using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Services;

public class IncomeService(IIncomeRepository repository) : IIncomeService
{
    public async Task<List<IncomeDto>> GetByMonthAsync(int year, int month, CancellationToken ct = default)
    {
        var incomes = await repository.GetByMonthAsync(year, month, ct);
        return incomes.Select(ToDto).ToList();
    }

    public async Task<IncomeDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var income = await repository.GetByIdAsync(id, ct);
        return income is null ? null : ToDto(income);
    }

    public async Task<IncomeDto> CreateAsync(UpsertIncomeDto dto, CancellationToken ct = default)
    {
        var income = new Income
        {
            Name = dto.Name,
            Amount = dto.Amount,
            Person = dto.Person,
            CategoryId = dto.CategoryId,
            Month = dto.Month,
            Year = dto.Year,
            IsRecurring = dto.IsRecurring,
            Notes = dto.Notes
        };
        income = await repository.AddAsync(income, ct);
        var saved = await repository.GetByIdAsync(income.Id, ct);
        return ToDto(saved!);
    }

    public async Task<bool> UpdateAsync(int id, UpsertIncomeDto dto, CancellationToken ct = default)
    {
        var income = await repository.GetByIdAsync(id, ct);
        if (income is null) return false;

        income.Name = dto.Name;
        income.Amount = dto.Amount;
        income.Person = dto.Person;
        income.CategoryId = dto.CategoryId;
        income.Month = dto.Month;
        income.Year = dto.Year;
        income.IsRecurring = dto.IsRecurring;
        income.Notes = dto.Notes;

        await repository.UpdateAsync(income, ct);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var income = await repository.GetByIdAsync(id, ct);
        if (income is null) return false;

        await repository.DeleteAsync(income, ct);
        return true;
    }

    public async Task<IncomeDto?> CopyToNextMonthAsync(int id, CancellationToken ct = default)
    {
        var income = await repository.GetByIdAsync(id, ct);
        if (income is null) return null;

        var (year, month) = MonthMath.Next(income.Year, income.Month);
        var copy = new Income
        {
            Name = income.Name,
            Amount = income.Amount,
            Person = income.Person,
            CategoryId = income.CategoryId,
            Month = month,
            Year = year,
            IsRecurring = income.IsRecurring,
            Notes = income.Notes
        };
        copy = await repository.AddAsync(copy, ct);
        var saved = await repository.GetByIdAsync(copy.Id, ct);
        return ToDto(saved!);
    }

    private static IncomeDto ToDto(Income income) => new()
    {
        Id = income.Id,
        Name = income.Name,
        Amount = income.Amount,
        Person = income.Person,
        CategoryId = income.CategoryId,
        CategoryName = income.Category?.Name,
        Month = income.Month,
        Year = income.Year,
        IsRecurring = income.IsRecurring,
        Notes = income.Notes
    };
}
