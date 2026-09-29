using Sandgatan.Application.Dtos;

namespace Sandgatan.Application.Interfaces.Services;

public class CopyRecurringResultDto
{
    public int IncomesCopied { get; set; }
    public int ExpensesCopied { get; set; }
    public int SavingsCopied { get; set; }
}

/// <summary>Copies recurring incomes/expenses/savings from the previous month into a target month.</summary>
public interface IRecurringCopyService
{
    /// <summary>Explicit, user-triggered copy (Settings → "Kopiera återkommande poster hit").</summary>
    Task<CopyRecurringResultDto> CopyRecurringFromPreviousMonthAsync(int year, int month, CancellationToken ct = default);

    /// <summary>
    /// Automatic carry-over when a month is opened in the app. Runs at most once per month
    /// (tracked in <c>InitializedMonths</c>) so deleted entries are never re-added, only for
    /// months up to next month (browsing far ahead does nothing), and never into a month that
    /// already has entries.
    /// </summary>
    Task<CopyRecurringResultDto> EnsureMonthInitializedAsync(int year, int month, DateOnly today, CancellationToken ct = default);
}
