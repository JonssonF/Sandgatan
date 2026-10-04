using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Application.Interfaces.Services;
using Sandgatan.Domain.Enums;

namespace Sandgatan.Application.Services;

public class BudgetSummaryService(
    IIncomeRepository incomeRepository,
    IExpenseRepository expenseRepository,
    ISavingRepository savingRepository,
    IPurchaseRepository purchaseRepository,
    ISpendingBudgetRepository spendingBudgetRepository) : IBudgetSummaryService
{
    public async Task<BudgetSummaryDto> GetSummaryAsync(int year, int month, CancellationToken ct = default)
    {
        var incomes = await incomeRepository.GetByMonthAsync(year, month, ct);
        var expenses = await expenseRepository.GetByMonthAsync(year, month, ct);
        var savings = await savingRepository.GetByMonthAsync(year, month, ct);
        var purchases = await purchaseRepository.GetByMonthAsync(year, month, ct);
        var spendingBudget = (await spendingBudgetRepository.GetEffectiveAsync(year, month, ct))?.Amount;

        var totalIncome = incomes.Sum(i => i.Amount);
        var totalFixedExpenses = expenses.Where(e => e.ExpenseType == ExpenseType.Fixed).Sum(e => e.Amount);
        var totalVariableExpenses = expenses.Where(e => e.ExpenseType == ExpenseType.Variable).Sum(e => e.Amount);
        var totalPurchases = purchases.Sum(p => p.Amount);
        // The budget is what's planned; once purchases exceed it, the actual amount counts.
        var plannedPurchases = Math.Max(spendingBudget ?? 0, totalPurchases);
        var totalExpenses = totalFixedExpenses + totalVariableExpenses + plannedPurchases;
        var totalSavings = savings.Sum(s => s.Amount);

        var loans = expenses.Where(e => e.Category?.IsLoan == true).ToList();
        var totalLoans = loans.Sum(e => e.Amount);
        var totalLoanInterest = loans.Sum(e => e.InterestAmount ?? 0);
        var totalLoanAmortization = loans.Sum(e => e.AmortizationAmount ?? 0);
        var totalLoanBalance = loans.Sum(e => e.LoanBalance ?? 0);

        var remainingAfterExpenses = totalIncome - totalExpenses;
        var remainingAfterSavings = remainingAfterExpenses - totalSavings;

        var savingsRate = totalIncome == 0 ? 0 : Math.Round(totalSavings / totalIncome * 100, 1);
        var expenseRate = totalIncome == 0 ? 0 : Math.Round(totalExpenses / totalIncome * 100, 1);

        return new BudgetSummaryDto
        {
            Year = year,
            Month = month,
            TotalIncome = totalIncome,
            TotalFixedExpenses = totalFixedExpenses,
            TotalVariableExpenses = totalVariableExpenses,
            TotalPurchases = totalPurchases,
            SpendingBudget = spendingBudget,
            PlannedPurchases = plannedPurchases,
            TotalExpenses = totalExpenses,
            TotalSavings = totalSavings,
            TotalLoans = totalLoans,
            TotalLoanBalance = totalLoanBalance,
            TotalLoanInterest = totalLoanInterest,
            TotalLoanAmortization = totalLoanAmortization,
            RemainingAfterExpenses = remainingAfterExpenses,
            RemainingAfterSavings = remainingAfterSavings,
            SavingsRatePercent = savingsRate,
            ExpenseRatePercent = expenseRate
        };
    }
}
