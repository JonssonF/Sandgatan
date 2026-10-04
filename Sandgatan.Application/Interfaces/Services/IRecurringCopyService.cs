using Sandgatan.Application.Dtos;

namespace Sandgatan.Application.Interfaces.Services;

public class CopyRecurringResultDto
{
    public int IncomesCopied { get; set; }
    public int ExpensesCopied { get; set; }
    public int SavingsCopied { get; set; }
}

/// <summary>Which entries to copy. A null list means all entries of that kind.</summary>
public class CopyToNextMonthRequestDto
{
    public List<int>? IncomeIds { get; set; }
    public List<int>? ExpenseIds { get; set; }
    public List<int>? SavingIds { get; set; }
}

/// <summary>Copies recurring incomes/expenses/savings from the previous month into a target month.</summary>
public interface IRecurringCopyService
{
    /// <summary>Explicit, user-triggered copy (Settings → "Kopiera återkommande poster hit").</summary>
    Task<CopyRecurringResultDto> CopyRecurringFromPreviousMonthAsync(int year, int month, CancellationToken ct = default);

    /// <summary>
    /// Copies the selected entries (recurring or not; all if <paramref name="selection"/> is null) from the
    /// given month into the following month. Entries whose name already exists in the target month are
    /// skipped so nothing is duplicated; loans are rolled forward.
    /// </summary>
    Task<CopyRecurringResultDto> CopyToNextMonthAsync(int year, int month, CopyToNextMonthRequestDto? selection, CancellationToken ct = default);

    /// <summary>
    /// Automatic carry-over when a month is opened in the app. Runs at most once per month
    /// (tracked in <c>InitializedMonths</c>) so deleted entries are never re-added, only for
    /// months up to next month (browsing far ahead does nothing), and never into a month that
    /// already has entries.
    /// </summary>
    Task<CopyRecurringResultDto> EnsureMonthInitializedAsync(int year, int month, DateOnly today, CancellationToken ct = default);
}
