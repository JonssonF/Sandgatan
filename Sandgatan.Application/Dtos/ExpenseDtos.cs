using System.ComponentModel.DataAnnotations;
using Sandgatan.Domain.Enums;

namespace Sandgatan.Application.Dtos;

public class ExpenseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal? InterestAmount { get; set; }
    public decimal? AmortizationAmount { get; set; }
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

    /// <summary>An explicit total wins; otherwise the total is interest + amortization.</summary>
    public decimal ResolveTotal() => Amount ?? (InterestAmount ?? 0) + (AmortizationAmount ?? 0);

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Amount is null && InterestAmount is null && AmortizationAmount is null)
        {
            yield return new ValidationResult(
                "Ange ett belopp, eller ränta och/eller amortering.",
                [nameof(Amount)]);
        }
    }
}
