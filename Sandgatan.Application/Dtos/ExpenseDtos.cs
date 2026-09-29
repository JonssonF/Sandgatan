using System.ComponentModel.DataAnnotations;
using Sandgatan.Application.Common;
using Sandgatan.Domain.Enums;

namespace Sandgatan.Application.Dtos;

public class ExpenseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal? InterestAmount { get; set; }
    public decimal? AmortizationAmount { get; set; }
    public decimal? LoanBalance { get; set; }
    public decimal? InterestRatePercent { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public ExpenseType ExpenseType { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public bool IsRecurring { get; set; }
    public int? DueDay { get; set; }
    public string? Notes { get; set; }
}

public class UpsertExpenseDto : IValidatableObject
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Explicit total. If omitted, the total is InterestAmount + AmortizationAmount.</summary>
    [Range(0, 100_000_000)]
    public decimal? Amount { get; set; }

    [Range(0, 100_000_000)]
    public decimal? InterestAmount { get; set; }

    [Range(0, 100_000_000)]
    public decimal? AmortizationAmount { get; set; }

    /// <summary>Remaining debt. Together with <see cref="InterestRatePercent"/> the interest is calculated.</summary>
    [Range(0, 1_000_000_000)]
    public decimal? LoanBalance { get; set; }

    /// <summary>Annual interest rate in percent.</summary>
    [Range(0, 100)]
    public decimal? InterestRatePercent { get; set; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    public ExpenseType ExpenseType { get; set; }

    [Range(1, 12)]
    public int Month { get; set; }

    [Range(2000, 2100)]
    public int Year { get; set; }

    public bool IsRecurring { get; set; }

    [Range(1, 31)]
    public int? DueDay { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public bool HasLoanCalculation => LoanBalance is not null && InterestRatePercent is not null;

    /// <summary>Calculated from balance and rate when both are given; otherwise the entered interest.</summary>
    public decimal? ResolveInterest() =>
        HasLoanCalculation ? LoanMath.MonthlyInterest(LoanBalance!.Value, InterestRatePercent!.Value) : InterestAmount;

    /// <summary>
    /// Calculated loans are always interest + amortization. Otherwise an explicit total wins,
    /// falling back to interest + amortization.
    /// </summary>
    public decimal ResolveTotal() => HasLoanCalculation
        ? (ResolveInterest() ?? 0) + (AmortizationAmount ?? 0)
        : Amount ?? (InterestAmount ?? 0) + (AmortizationAmount ?? 0);

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if ((LoanBalance is null) != (InterestRatePercent is null))
        {
            yield return new ValidationResult(
                "Ange både total skuld och räntesats för att räntan ska kunna räknas ut.",
                [nameof(LoanBalance), nameof(InterestRatePercent)]);
        }

        if (!HasLoanCalculation && Amount is null && InterestAmount is null && AmortizationAmount is null)
        {
            yield return new ValidationResult(
                "Ange ett belopp, eller ränta och/eller amortering.",
                [nameof(Amount)]);
        }
    }
}
