using Sandgatan.Domain.Enums;

namespace Sandgatan.Domain.Entities;

/// <summary>A user-defined category for expenses or incomes.</summary>
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public CategoryType Type { get; set; }

    /// <summary>Loan categories get optional interest/amortization fields on expenses.</summary>
    public bool IsLoan { get; set; }

    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<Income> Incomes { get; set; } = new List<Income>();
}
