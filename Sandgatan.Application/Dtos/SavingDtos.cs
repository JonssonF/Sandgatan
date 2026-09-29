using System.ComponentModel.DataAnnotations;

namespace Sandgatan.Application.Dtos;

public class SavingDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Person { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public bool IsRecurring { get; set; }
    public string SavingsType { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class UpsertSavingDto
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Range(0, 100_000_000)]
    public decimal Amount { get; set; }

    [MaxLength(100)]
    public string? Person { get; set; }

    [Range(1, 12)]
    public int Month { get; set; }

    [Range(2000, 2100)]
    public int Year { get; set; }

    public bool IsRecurring { get; set; }

    [Required, MaxLength(100)]
    public string SavingsType { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
