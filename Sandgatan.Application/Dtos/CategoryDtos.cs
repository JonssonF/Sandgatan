using System.ComponentModel.DataAnnotations;
using Sandgatan.Domain.Enums;

namespace Sandgatan.Application.Dtos;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public bool IsLoan { get; set; }
    public CategoryType Type { get; set; }
}

public class UpsertCategoryDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Color { get; set; }

    [MaxLength(50)]
    public string? Icon { get; set; }

    public bool IsLoan { get; set; }

    /// <summary>Only used on create — a category never changes type afterwards.</summary>
    public CategoryType Type { get; set; }
}
