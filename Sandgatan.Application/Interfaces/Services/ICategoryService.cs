using Sandgatan.Application.Dtos;

namespace Sandgatan.Application.Interfaces.Services;

public enum DeleteCategoryResult
{
    Deleted,
    NotFound,
    InUse
}

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(CancellationToken ct = default);
    Task<CategoryDto> CreateAsync(UpsertCategoryDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(int id, UpsertCategoryDto dto, CancellationToken ct = default);
    Task<DeleteCategoryResult> DeleteAsync(int id, CancellationToken ct = default);
}
