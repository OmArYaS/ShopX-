using Microsoft.EntityFrameworkCore;
using ShopX.Core.Data;
using ShopX.Core.Dtos;
using ShopX.Core.Entities;
using ShopX.Core.Enums;
using ShopX.Core.Exceptions;
using ShopX.Core.Interfaces;

namespace ShopX.Core.Services;

public class OrderService(IShopXDbContext db) : IOrderService
{
    public async Task<List<OrderDto>> GetAllAsync(CancellationToken ct = default) =>
        await db.Orders.AsNoTracking()
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => Map(o))
            .ToListAsync(ct);

    public async Task<List<OrderDto>> GetByUserAsync(string userId, CancellationToken ct = default) =>
        await db.Orders.AsNoTracking()
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => Map(o))
            .ToListAsync(ct);

    public async Task<OrderDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var order = await db.Orders.AsNoTracking()
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new NotFoundException($"Order {id} not found.");
        return Map(order);
    }

    public async Task<OrderDto> PlaceOrderAsync(string userId, CancellationToken ct = default)
    {
        var cart = await db.CartItems.Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync(ct);

        if (cart.Count == 0)
            throw new BadRequestException("Cart is empty.");

        foreach (var c in cart)
        {
            if (c.Product is null) throw new NotFoundException($"Product {c.ProductId} not found.");
            if (c.Product.Stock < c.Quantity)
                throw new BadRequestException($"Insufficient stock for '{c.Product.Name}'. Available: {c.Product.Stock}.");
        }

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            Items = cart.Select(c => new OrderItem
            {
                ProductId = c.ProductId,
                Quantity = c.Quantity,
                UnitPrice = c.Product!.Price
            }).ToList()
        };
        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);

        foreach (var c in cart)
            c.Product!.Stock -= c.Quantity;

        db.Orders.Add(order);
        db.CartItems.RemoveRange(cart);
        await db.SaveChangesAsync(ct);

        return await GetByIdAsync(order.Id, ct);
    }

    public async Task<OrderDto> UpdateStatusAsync(int id, OrderStatus status, CancellationToken ct = default)
    {
        var order = await db.Orders.Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new NotFoundException($"Order {id} not found.");

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Map(order);
    }

    private static OrderDto Map(Order o) => new(
        o.Id, o.UserId, o.Status.ToString(), o.TotalAmount, o.CreatedAt,
        o.Items.Select(i => new OrderItemDto(i.ProductId, i.Product?.Name ?? $"Product #{i.ProductId}", i.Quantity, i.UnitPrice)).ToList());
}
