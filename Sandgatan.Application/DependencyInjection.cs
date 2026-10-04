using Microsoft.Extensions.DependencyInjection;
using Sandgatan.Application.Interfaces.Services;
using Sandgatan.Application.Services;

namespace Sandgatan.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IIncomeService, IncomeService>();
        services.AddScoped<IExpenseService, ExpenseService>();
        services.AddScoped<ISavingService, SavingService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IBudgetSummaryService, BudgetSummaryService>();
        services.AddScoped<IRecurringCopyService, RecurringCopyService>();
        services.AddScoped<IPurchaseService, PurchaseService>();
        return services;
    }
}
