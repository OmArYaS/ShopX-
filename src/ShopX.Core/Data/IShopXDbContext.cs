using Microsoft.EntityFrameworkCore;
using ShopX.Core.Entities;

namespace ShopX.Core.Data;

public interface IShopXDbContext
{
    DbSet<Product> Products { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
