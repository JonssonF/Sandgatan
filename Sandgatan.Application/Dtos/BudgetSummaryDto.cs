namespace Sandgatan.Application.Dtos;

/// <summary>Aggregated totals for a single budget month. All math happens server-side.</summary>
public class BudgetSummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }

    public decimal TotalIncome { get; set; }
    public decimal TotalFixedExpenses { get; set; }
    public decimal TotalVariableExpenses { get; set; }

    /// <summary>Sum of everyday purchases ("vardagsköp") logged this month.</summary>
    public decimal TotalPurchases { get; set; }

    /// <summary>The month's everyday-purchase budget (possibly inherited from an earlier month); null if never set.</summary>
    public decimal? SpendingBudget { get; set; }

    /// <summary>What everyday purchases contribute to TotalExpenses: the budget, or the actual sum once it is exceeded.</summary>
    public decimal PlannedPurchases { get; set; }

    /// <summary>Fixed + variable expenses + <see cref="PlannedPurchases"/>.</summary>
    public decimal TotalExpenses { get; set; }
    public decimal TotalSavings { get; set; }

    /// <summary>Total of all expenses in loan categories (already included in TotalExpenses).</summary>
    public decimal TotalLoans { get; set; }

    /// <summary>Sum of remaining debt on loans that have a balance entered.</summary>
    public decimal TotalLoanBalance { get; set; }

    /// <summary>Sum of interest entered on loans. Loans with only a total contribute nothing here.</summary>
    public decimal TotalLoanInterest { get; set; }

    /// <summary>Sum of amortization entered on loans. Loans with only a total contribute nothing here.</summary>
    public decimal TotalLoanAmortization { get; set; }

    public decimal RemainingAfterExpenses { get; set; }
    public decimal RemainingAfterSavings { get; set; }

    public decimal SavingsRatePercent { get; set; }
    public decimal ExpenseRatePercent { get; set; }
}
