using Sandgatan.Domain.Enums;

namespace Sandgatan.Domain.Entities;

/// <summary>An expense entry, fixed or variable, tied to a category and month.</summary>
public class Expense
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>Effective total. For loans without an explicit total this is Interest + Amortization.</summary>
    public decimal Amount { get; set; }
    public decimal? InterestAmount { get; set; }
    public decimal? AmortizationAmount { get; set; }
    /// <summary>Remaining debt at the start of the month (loans only). With a rate, interest is calculated.</summary>
    public decimal? LoanBalance { get; set; }
    /// <summary>Annual interest rate in percent, e.g. 3.45 (loans only).</summary>
    public decimal? InterestRatePercent { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public ExpenseType ExpenseType { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public bool IsRecurring { get; set; }
    public int? DueDay { get; set; }
    public string? Notes { get; set; }
}
