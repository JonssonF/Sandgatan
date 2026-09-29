namespace Sandgatan.Domain.Entities;

/// <summary>An income entry for a specific household member and month.</summary>
public class Income
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Person { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public Category? Category { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public bool IsRecurring { get; set; }
    public string? Notes { get; set; }
}
