namespace Sandgatan.Domain.Entities;

/// <summary>A savings/investment contribution for a month, optionally tied to a person.</summary>
public class Saving
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
