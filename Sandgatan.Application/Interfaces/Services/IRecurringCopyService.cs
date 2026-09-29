using Sandgatan.Application.Dtos;

namespace Sandgatan.Application.Interfaces.Services;

public class CopyRecurringResultDto
{
    public int IncomesCopied { get; set; }
    public int ExpensesCopied { get; set; }
    public int SavingsCopied { get; set; }
}

/// <summary>
/// Explicit, user-triggered copy of recurring incomes/expenses/savings from the previous
/// month into the target month. Never runs implicitly.
/// </summary>
public interface IRecurringCopyService
{
    Task<CopyRecurringResultDto> CopyRecurringFromPreviousMonthAsync(int year, int month, CancellationToken ct = default);
}
