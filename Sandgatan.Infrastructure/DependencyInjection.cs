using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sandgatan.Application.Interfaces.Repositories;
using Sandgatan.Infrastructure.Persistence;
using Sandgatan.Infrastructure.Repositories;

namespace Sandgatan.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? "Data Source=data/sandgatan.db";

        var dataSource = new SqliteConnectionStringBuilder(connectionString).DataSource;
        var directory = Path.GetDirectoryName(Path.GetFullPath(dataSource));
        if (!string.IsNullOrEmpty(directory))
            Directory.CreateDirectory(directory);

        services.AddDbContext<SandgatanDbContext>(options => options.UseSqlite(connectionString));

        services.AddScoped<IIncomeRepository, IncomeRepository>();
        services.AddScoped<IExpenseRepository, ExpenseRepository>();
        services.AddScoped<ISavingRepository, SavingRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IInitializedMonthRepository, InitializedMonthRepository>();
        services.AddScoped<IPurchaseRepository, PurchaseRepository>();
        services.AddScoped<ISpendingBudgetRepository, SpendingBudgetRepository>();

        return services;
    }
}
