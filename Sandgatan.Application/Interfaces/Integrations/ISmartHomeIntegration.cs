namespace Sandgatan.Application.Interfaces.Integrations;

/// <summary>
/// Future integration point for smart-home platforms (e.g. Philips Hue, Plejd).
/// Not implemented yet — see README "Framtida integrationsplan".
/// </summary>
public interface ISmartHomeIntegration
{
    Task<IReadOnlyList<SmartHomeDeviceState>> GetDeviceStatesAsync(CancellationToken ct = default);
}

public record SmartHomeDeviceState(string DeviceId, string Name, bool IsOn, double? Brightness);
