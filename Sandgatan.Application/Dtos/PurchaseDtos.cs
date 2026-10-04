using System.ComponentModel.DataAnnotations;

namespace Sandgatan.Application.Dtos;

public class PurchaseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? CategoryColor { get; set; }
    public string? Notes { get; set; }
}

public class UpsertPurchaseDto
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Range(0, 100_000_000)]
    public decimal Amount { get; set; }

    /// <summary>The purchase date; the entry's year and month are taken from it.</summary>
    public DateOnly Date { get; set; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}

/// <summary>The month's everyday-purchase budget. <see cref="IsInherited"/> is true when it comes from an earlier month.</summary>
public class SpendingBudgetDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal? Amount { get; set; }
    public bool IsInherited { get; set; }
}

public class SetSpendingBudgetDto
{
    [Range(0, 100_000_000)]
    public decimal Amount { get; set; }
}
