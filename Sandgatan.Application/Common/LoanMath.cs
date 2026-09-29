using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Common;

/// <summary>
/// Loan calculations for expenses in a loan category that have a balance and an annual interest
/// rate. Interest is a simple monthly approximation (balance × rate / 12), rounded to whole kronor.
/// </summary>
public static class LoanMath
{
    public static decimal MonthlyInterest(decimal balance, decimal annualRatePercent) =>
        Math.Round(balance * annualRatePercent / 100m / 12m, 0, MidpointRounding.AwayFromZero);

    /// <summary>
    /// Fills the loan fields of <paramref name="next"/> (the following month's copy of
    /// <paramref name="source"/>): the balance drops by the amortization and interest is
    /// recalculated from the new balance. No-op for expenses without balance + rate.
    /// </summary>
    public static void RollForward(Expense source, Expense next)
    {
        if (source.LoanBalance is not { } balance || source.InterestRatePercent is not { } rate) return;

        var newBalance = Math.Max(0, balance - (source.AmortizationAmount ?? 0));
        var amortization = source.AmortizationAmount is { } a ? Math.Min(a, newBalance) : (decimal?)null;
        var interest = MonthlyInterest(newBalance, rate);

        next.LoanBalance = newBalance;
        next.InterestRatePercent = rate;
        next.AmortizationAmount = amortization;
        next.InterestAmount = interest;
        next.Amount = interest + (amortization ?? 0);
    }
}
