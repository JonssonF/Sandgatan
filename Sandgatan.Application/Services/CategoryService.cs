using Sandgatan.Application.Dtos;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Application.Interfaces.Services;
using Sandgatan.Domain.Entities;

namespace Sandgatan.Application.Services;

public class CategoryService(ICategoryRepository repository) : ICategoryService
{
    public async Task<List<CategoryDto>> GetAllAsync(CancellationToken ct = default)
    {
        var categories = await repository.GetAllAsync(ct);
        return categories.Select(ToDto).ToList();
    }

    public async Task<CategoryDto> CreateAsync(UpsertCategoryDto dto, CancellationToken ct = default)
    {
        var category = new Category
        {
            Name = dto.Name,
            Color = dto.Color,
            Icon = dto.Icon,
            IsLoan = dto.Type == Domain.Enums.CategoryType.Expense && dto.IsLoan,
            Type = dto.Type
        };
        category = await repository.AddAsync(category, ct);
        return ToDto(category);
    }

    public async Task<bool> UpdateAsync(int id, UpsertCategoryDto dto, CancellationToken ct = default)
    {
        var category = await repository.GetByIdAsync(id, ct);
        if (category is null) return false;

        category.Name = dto.Name;
        category.Color = dto.Color;
        category.Icon = dto.Icon;
        category.IsLoan = category.Type == Domain.Enums.CategoryType.Expense && dto.IsLoan;

        await repository.UpdateAsync(category, ct);
        return true;
    }

    public async Task<DeleteCategoryResult> DeleteAsync(int id, CancellationToken ct = default)
    {
        var category = await repository.GetByIdAsync(id, ct);
        if (category is null) return DeleteCategoryResult.NotFound;

        if (await repository.IsInUseAsync(id, ct))
            return DeleteCategoryResult.InUse;

        await repository.DeleteAsync(category, ct);
        return DeleteCategoryResult.Deleted;
    }

    private static CategoryDto ToDto(Category category) => new()
    {
        Id = category.Id,
        Name = category.Name,
        Color = category.Color,
        Icon = category.Icon,
        IsLoan = category.IsLoan,
        Type = category.Type
    };
}
