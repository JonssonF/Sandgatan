namespace Sandgatan.Application.Interfaces.Integrations;

/// <summary>
/// Future integration point for electricity/energy providers (e.g. Varberg Energi, Svea Solar).
/// Not implemented yet — see README "Framtida integrationsplan".
/// </summary>
public interface IEnergyIntegration
{
    Task<IReadOnlyList<EnergyUsage>> GetRecentUsageAsync(CancellationToken ct = default);
}

public record EnergyUsage(DateOnly Date, decimal ConsumptionKwh, decimal? CostSek);
