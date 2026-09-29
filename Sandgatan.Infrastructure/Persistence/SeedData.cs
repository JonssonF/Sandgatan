using Sandgatan.Domain.Entities;

namespace Sandgatan.Infrastructure.Persistence;

/// <summary>Seeds only the default expense categories — never personal budget amounts.</summary>
public static class SeedData
{
    public static async Task SeedAsync(SandgatanDbContext db)
    {
        if (db.Categories.Any()) return;

        string[] defaultCategories =
        [
            "Boende", "Lån", "El", "Försäkring", "Transport",
            "Barn", "Abonnemang", "Mat", "Sparande", "Övrigt"
        ];

        db.Categories.AddRange(defaultCategories.Select(name => new Category { Name = name, IsLoan = name == "Lån" }));
        await db.SaveChangesAsync();
    }
}
