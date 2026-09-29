using Sandgatan.Domain.Entities;
using Sandgatan.Domain.Enums;

namespace Sandgatan.Infrastructure.Persistence;

/// <summary>Seeds only the default categories — never personal budget amounts.</summary>
public static class SeedData
{
    public static async Task SeedAsync(SandgatanDbContext db)
    {
        // Each type is seeded independently so existing databases (created before income
        // categories existed) still get the income defaults.
        if (!db.Categories.Any(c => c.Type == CategoryType.Expense))
        {
            string[] expenseCategories =
            [
                "Boende", "Lån", "El", "Försäkring", "Transport",
                "Barn", "Abonnemang", "Mat", "Sparande", "Övrigt"
            ];
            db.Categories.AddRange(expenseCategories.Select(name => new Category
            {
                Name = name,
                Type = CategoryType.Expense,
                IsLoan = name == "Lån"
            }));
        }

        if (!db.Categories.Any(c => c.Type == CategoryType.Income))
        {
            string[] incomeCategories = ["Lön", "Barnbidrag", "VAB", "Föräldrapenning", "Övrigt"];
            db.Categories.AddRange(incomeCategories.Select(name => new Category
            {
                Name = name,
                Type = CategoryType.Income
            }));
        }

        await db.SaveChangesAsync();
    }
}
