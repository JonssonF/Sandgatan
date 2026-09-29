namespace Sandgatan.Application.Interfaces.Repositories;

public interface IInitializedMonthRepository
{
    Task<bool> IsInitializedAsync(int year, int month, CancellationToken ct = default);
    Task MarkInitializedAsync(int year, int month, CancellationToken ct = default);
}
