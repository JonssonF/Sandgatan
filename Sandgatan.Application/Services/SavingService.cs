using Sandgatan.Application.Common;
using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Application.Interfaces.Services;
using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Services;

public class SavingService(ISavingRepository repository) : ISavingService
{
    public async Task<List<SavingDto>> GetByMonthAsync(int year, int month, CancellationToken ct = default)
    {
        var savings = await repository.GetByMonthAsync(year, month, ct);
        return savings.Select(ToDto).ToList();
    }

    public async Task<SavingDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var saving = await repository.GetByIdAsync(id, ct);
        return saving is null ? null : ToDto(saving);
    }

    public async Task<SavingDto> CreateAsync(UpsertSavingDto dto, CancellationToken ct = default)
    {
        var saving = new Saving
        {
            Name = dto.Name,
            Amount = dto.Amount,
            Person = dto.Person,
            Month = dto.Month,
            Year = dto.Year,
            IsRecurring = dto.IsRecurring,
            SavingsType = dto.SavingsType,
            Notes = dto.Notes
        };
        saving = await repository.AddAsync(saving, ct);
        return ToDto(saving);
    }

    public async Task<bool> UpdateAsync(int id, UpsertSavingDto dto, CancellationToken ct = default)
    {
        var saving = await repository.GetByIdAsync(id, ct);
        if (saving is null) return false;

        saving.Name = dto.Name;
        saving.Amount = dto.Amount;
        saving.Person = dto.Person;
        saving.Month = dto.Month;
        saving.Year = dto.Year;
        saving.IsRecurring = dto.IsRecurring;
        saving.SavingsType = dto.SavingsType;
        saving.Notes = dto.Notes;

        await repository.UpdateAsync(saving, ct);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var saving = await repository.GetByIdAsync(id, ct);
        if (saving is null) return false;

        await repository.DeleteAsync(saving, ct);
        return true;
    }

    public async Task<SavingDto?> CopyToNextMonthAsync(int id, CancellationToken ct = default)
    {
        var saving = await repository.GetByIdAsync(id, ct);
        if (saving is null) return null;

        var (year, month) = MonthMath.Next(saving.Year, saving.Month);
        var copy = new Saving
        {
            Name = saving.Name,
            Amount = saving.Amount,
            Person = saving.Person,
            Month = month,
            Year = year,
            IsRecurring = saving.IsRecurring,
            SavingsType = saving.SavingsType,
            Notes = saving.Notes
        };
        copy = await repository.AddAsync(copy, ct);
        return ToDto(copy);
    }

    private static SavingDto ToDto(Saving saving) => new()
    {
        Id = saving.Id,
        Name = saving.Name,
        Amount = saving.Amount,
        Person = saving.Person,
        Month = saving.Month,
        Year = saving.Year,
        IsRecurring = saving.IsRecurring,
        SavingsType = saving.SavingsType,
        Notes = saving.Notes
    };
}
