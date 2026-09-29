namespace Sandgatan.Domain.Entities;

/// <summary>A user-defined expense category.</summary>
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? Icon { get; set; }

    /// <summary>Loan categories get optional interest/amortization fields on expenses.</summary>
    public bool IsLoan { get; set; }

    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
