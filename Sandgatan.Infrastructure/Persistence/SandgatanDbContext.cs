using Microsoft.EntityFrameworkCore;
using Sandgatan.Domain.Entities;

namespace Sandgatan.Infrastructure.Persistence;

public class SandgatanDbContext(DbContextOptions<SandgatanDbContext> options) : DbContext(options)
{
    public DbSet<Income> Incomes => Set<Income>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Saving> Savings => Set<Saving>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<InitializedMonth> InitializedMonths => Set<InitializedMonth>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Income>(entity =>
        {
            entity.Property(i => i.Name).IsRequired().HasMaxLength(200);
            entity.Property(i => i.Person).IsRequired().HasMaxLength(100);
            entity.Property(i => i.Amount).HasColumnType("decimal(18,2)");
            entity.HasIndex(i => new { i.Year, i.Month });
            entity.HasOne(i => i.Category)
                .WithMany(c => c.Incomes)
                .HasForeignKey(i => i.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.InterestAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.AmortizationAmount).HasColumnType("decimal(18,2)");
            entity.HasIndex(e => new { e.Year, e.Month });
            entity.HasOne(e => e.Category)
                .WithMany(c => c.Expenses)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Saving>(entity =>
        {
            entity.Property(s => s.Name).IsRequired().HasMaxLength(200);
            entity.Property(s => s.Amount).HasColumnType("decimal(18,2)");
            entity.Property(s => s.SavingsType).IsRequired().HasMaxLength(100);
            entity.HasIndex(s => new { s.Year, s.Month });
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            // Same name may exist once per type, e.g. "Övrigt" for both expenses and incomes.
            entity.HasIndex(c => new { c.Type, c.Name }).IsUnique();
        });

        modelBuilder.Entity<InitializedMonth>(entity =>
        {
            entity.HasIndex(m => new { m.Year, m.Month }).IsUnique();
        });
    }
}
