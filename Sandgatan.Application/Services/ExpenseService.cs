using Sandgatan.Application.Common;
using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Application.Interfaces.Services;
using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Services;

public class ExpenseService(IExpenseRepository repository) : IExpenseService
{
    public async Task<List<ExpenseDto>> GetByMonthAsync(int year, int month, CancellationToken ct = default)
    {
        var expenses = await repository.GetByMonthAsync(year, month, ct);
        return expenses.Select(ToDto).ToList();
    }

    public async Task<ExpenseDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var expense = await repository.GetByIdAsync(id, ct);
        return expense is null ? null : ToDto(expense);
    }

    public async Task<ExpenseDto> CreateAsync(UpsertExpenseDto dto, CancellationToken ct = default)
    {
        var expense = new Expense
        {
            Name = dto.Name,
            Amount = dto.ResolveTotal(),
            InterestAmount = dto.ResolveInterest(),
            AmortizationAmount = dto.AmortizationAmount,
            LoanBalance = dto.LoanBalance,
            InterestRatePercent = dto.InterestRatePercent,
            CategoryId = dto.CategoryId,
            ExpenseType = dto.ExpenseType,
            Month = dto.Month,
            Year = dto.Year,
            IsRecurring = dto.IsRecurring,
            DueDay = dto.DueDay,
            Notes = dto.Notes
        };
        expense = await repository.AddAsync(expense, ct);
        var saved = await repository.GetByIdAsync(expense.Id, ct);
        return ToDto(saved!);
    }

    public async Task<bool> UpdateAsync(int id, UpsertExpenseDto dto, CancellationToken ct = default)
    {
        var expense = await repository.GetByIdAsync(id, ct);
        if (expense is null) return false;

        expense.Name = dto.Name;
        expense.Amount = dto.ResolveTotal();
        expense.InterestAmount = dto.ResolveInterest();
        expense.AmortizationAmount = dto.AmortizationAmount;
        expense.LoanBalance = dto.LoanBalance;
        expense.InterestRatePercent = dto.InterestRatePercent;
        expense.CategoryId = dto.CategoryId;
        expense.ExpenseType = dto.ExpenseType;
        expense.Month = dto.Month;
        expense.Year = dto.Year;
        expense.IsRecurring = dto.IsRecurring;
        expense.DueDay = dto.DueDay;
        expense.Notes = dto.Notes;

        await repository.UpdateAsync(expense, ct);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var expense = await repository.GetByIdAsync(id, ct);
        if (expense is null) return false;

        await repository.DeleteAsync(expense, ct);
        return true;
    }

    public async Task<ExpenseDto?> CopyToNextMonthAsync(int id, CancellationToken ct = default)
    {
        var expense = await repository.GetByIdAsync(id, ct);
        if (expense is null) return null;

        var (year, month) = MonthMath.Next(expense.Year, expense.Month);
        var copy = new Expense
        {
            Name = expense.Name,
            Amount = expense.Amount,
            InterestAmount = expense.InterestAmount,
            AmortizationAmount = expense.AmortizationAmount,
            CategoryId = expense.CategoryId,
            ExpenseType = expense.ExpenseType,
            Month = month,
            Year = year,
            IsRecurring = expense.IsRecurring,
            DueDay = expense.DueDay,
            Notes = expense.Notes
        };
        LoanMath.RollForward(expense, copy);
        copy = await repository.AddAsync(copy, ct);
        var saved = await repository.GetByIdAsync(copy.Id, ct);
        return ToDto(saved!);
    }

    private static ExpenseDto ToDto(Expense expense) => new()
    {
        Id = expense.Id,
        Name = expense.Name,
        Amount = expense.Amount,
        InterestAmount = expense.InterestAmount,
        AmortizationAmount = expense.AmortizationAmount,
        LoanBalance = expense.LoanBalance,
        InterestRatePercent = expense.InterestRatePercent,
        CategoryId = expense.CategoryId,
        CategoryName = expense.Category?.Name ?? string.Empty,
        ExpenseType = expense.ExpenseType,
        Month = expense.Month,
        Year = expense.Year,
        IsRecurring = expense.IsRecurring,
        DueDay = expense.DueDay,
        Notes = expense.Notes
    };
}
