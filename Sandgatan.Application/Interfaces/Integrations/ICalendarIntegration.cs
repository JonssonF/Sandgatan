namespace Sandgatan.Application.Interfaces.Integrations;

/// <summary>
/// Future integration point for a shared family calendar (e.g. Google/Apple).
/// Not implemented yet — see README "Framtida integrationsplan".
/// </summary>
public interface ICalendarIntegration
{
    Task<IReadOnlyList<CalendarEvent>> GetUpcomingEventsAsync(CancellationToken ct = default);
}

public record CalendarEvent(string Title, DateTimeOffset Start, DateTimeOffset End, string? Person);
