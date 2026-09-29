namespace Sandgatan.Application.Interfaces.Integrations;

/// <summary>
/// Future integration point for bank/loan data (e.g. an Open Banking/PSD2 provider).
/// Not implemented yet — see README "Framtida integrationsplan".
/// </summary>
public interface IBankIntegration
{
    Task<IReadOnlyList<BankTransaction>> GetRecentTransactionsAsync(CancellationToken ct = default);
}

public record BankTransaction(string Description, decimal Amount, DateOnly Date, string AccountName);
