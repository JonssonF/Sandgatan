namespace Sandgatan.Domain.Entities;

/// <summary>
/// An everyday purchase ("vardagsköp") logged when it happens: groceries, kids' shoes, a flat tyre.
/// Unlike expenses these are never recurring or carried over; they are measured against the month's spending budget.
/// </summary>
public class Purchase
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    /// <summary>Derived from <see cref="Date"/>; stored for month queries like the other entries.</summary>
    public int Year { get; set; }
    public int Month { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public string? Notes { get; set; }
}
