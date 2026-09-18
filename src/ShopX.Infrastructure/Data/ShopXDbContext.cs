using Microsoft.EntityFrameworkCore;
using ShopX.Core.Data;
using ShopX.Core.Entities;

namespace ShopX.Infrastructure.Data;

public class ShopXDbContext(DbContextOptions<ShopXDbContext> options) : DbContext(options), IShopXDbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(e =>
        {
            e.Property(p => p.Name).IsRequired().HasMaxLength(200);
            e.Property(p => p.Description).HasMaxLength(1000);
            e.Property(p => p.Price).HasPrecision(18, 2);
            e.HasIndex(p => p.Name);
        });

        modelBuilder.Entity<CartItem>(e =>
        {
            e.Property(c => c.UserId).IsRequired().HasMaxLength(100);
            e.HasOne(c => c.Product).WithMany().HasForeignKey(c => c.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(c => new { c.UserId, c.ProductId }).IsUnique();
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.Property(o => o.UserId).IsRequired().HasMaxLength(100);
            e.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(o => o.TotalAmount).HasPrecision(18, 2);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.Property(i => i.UnitPrice).HasPrecision(18, 2);
            e.HasOne(i => i.Order).WithMany(o => o.Items).HasForeignKey(i => i.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        // Seed data
        var seedTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Wireless Headphones", Description = "Noise-cancelling over-ear headphones", Price = 129.99m, Stock = 50, CreatedAt = seedTime },
            new Product { Id = 2, Name = "Mechanical Keyboard", Description = "RGB hot-swappable mechanical keyboard", Price = 89.50m, Stock = 100, CreatedAt = seedTime },
            new Product { Id = 3, Name = "4K Monitor 27\"", Description = "27-inch 4K UHD IPS display", Price = 329.00m, Stock = 25, CreatedAt = seedTime },
            new Product { Id = 4, Name = "USB-C Hub", Description = "7-in-1 USB-C docking hub", Price = 39.99m, Stock = 200, CreatedAt = seedTime }
        );
    }
}
