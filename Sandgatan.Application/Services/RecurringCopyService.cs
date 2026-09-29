using Sandgatan.Application.Common;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Application.Interfaces.Services;
using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Services;

public class RecurringCopyService(
    IIncomeRepository incomeRepository,
    IExpenseRepository expenseRepository,
    ISavingRepository savingRepository) : IRecurringCopyService
{
    public async Task<CopyRecurringResultDto> CopyRecurringFromPreviousMonthAsync(int year, int month, CancellationToken ct = default)
    {
        var (prevYear, prevMonth) = MonthMath.Previous(year, month);

        var result = new CopyRecurringResultDto
        {
            IncomesCopied = await CopyIncomesAsync(prevYear, prevMonth, year, month, ct),
            ExpensesCopied = await CopyExpensesAsync(prevYear, prevMonth, year, month, ct),
            SavingsCopied = await CopySavingsAsync(prevYear, prevMonth, year, month, ct)
        };
        return result;
    }

    private async Task<int> CopyIncomesAsync(int prevYear, int prevMonth, int year, int month, CancellationToken ct)
    {
        var previous = (await incomeRepository.GetByMonthAsync(prevYear, prevMonth, ct)).Where(i => i.IsRecurring).ToList();
        var existingNames = (await incomeRepository.GetByMonthAsync(year, month, ct)).Select(i => i.Name).ToHashSet();

        var copied = 0;
        foreach (var income in previous.Where(i => !existingNames.Contains(i.Name)))
        {
            await incomeRepository.AddAsync(new Income
            {
                Name = income.Name,
                Amount = income.Amount,
                Person = income.Person,
                Month = month,
                Year = year,
                IsRecurring = income.IsRecurring,
                Notes = income.Notes
            }, ct);
            copied++;
        }
        return copied;
    }

    private async Task<int> CopyExpensesAsync(int prevYear, int prevMonth, int year, int month, CancellationToken ct)
    {
        var previous = (await expenseRepository.GetByMonthAsync(prevYear, prevMonth, ct)).Where(e => e.IsRecurring).ToList();
        var existingNames = (await expenseRepository.GetByMonthAsync(year, month, ct)).Select(e => e.Name).ToHashSet();

        var copied = 0;
        foreach (var expense in previous.Where(e => !existingNames.Contains(e.Name)))
        {
            await expenseRepository.AddAsync(new Expense
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
            }, ct);
            copied++;
        }
        return copied;
    }

    private async Task<int> CopySavingsAsync(int prevYear, int prevMonth, int year, int month, CancellationToken ct)
    {
        var previous = (await savingRepository.GetByMonthAsync(prevYear, prevMonth, ct)).Where(s => s.IsRecurring).ToList();
        var existingNames = (await savingRepository.GetByMonthAsync(year, month, ct)).Select(s => s.Name).ToHashSet();

        var copied = 0;
        foreach (var saving in previous.Where(s => !existingNames.Contains(s.Name)))
        {
            await savingRepository.AddAsync(new Saving
            {
                Name = saving.Name,
                Amount = saving.Amount,
                Person = saving.Person,
                Month = month,
                Year = year,
                IsRecurring = saving.IsRecurring,
                SavingsType = saving.SavingsType,
                Notes = saving.Notes
            }, ct);
            copied++;
        }
        return copied;
    }
}
