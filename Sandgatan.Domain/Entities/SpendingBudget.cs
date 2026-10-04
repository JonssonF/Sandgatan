namespace Sandgatan.Domain.Entities;

/// <summary>
/// The monthly allowance for everyday purchases. A month without its own row uses the latest earlier month's
/// amount, so the budget follows along automatically until it is changed.
/// </summary>
public class SpendingBudget
{
    public int Id { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Amount { get; set; }
}
