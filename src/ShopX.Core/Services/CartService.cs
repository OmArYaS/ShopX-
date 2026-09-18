using Microsoft.EntityFrameworkCore;
using ShopX.Core.Data;
using ShopX.Core.Dtos;
using ShopX.Core.Entities;
using ShopX.Core.Exceptions;
using ShopX.Core.Interfaces;

namespace ShopX.Core.Services;

public class CartService(IShopXDbContext db) : ICartService
{
    public async Task<List<CartItemDto>> GetCartAsync(string userId, CancellationToken ct = default) =>
        await db.CartItems.AsNoTracking()
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .Select(c => new CartItemDto(
                c.Id, c.UserId, c.ProductId,
                c.Product!.Name, c.Product.Price,
                c.Quantity, c.Product.Price * c.Quantity))
            .ToListAsync(ct);

    public async Task<CartItemDto> AddToCartAsync(AddToCartDto dto, CancellationToken ct = default)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId, ct)
            ?? throw new NotFoundException($"Product {dto.ProductId} not found.");

        if (product.Stock < dto.Quantity)
            throw new BadRequestException($"Only {product.Stock} units of '{product.Name}' in stock.");

        var existing = await db.CartItems
            .FirstOrDefaultAsync(c => c.UserId == dto.UserId && c.ProductId == dto.ProductId, ct);

        if (existing is not null)
        {
            var newQty = existing.Quantity + dto.Quantity;
            if (product.Stock < newQty)
                throw new BadRequestException($"Only {product.Stock} units of '{product.Name}' in stock.");
            existing.Quantity = newQty;
        }
        else
        {
            existing = new CartItem { UserId = dto.UserId, ProductId = dto.ProductId, Quantity = dto.Quantity };
            db.CartItems.Add(existing);
        }

        await db.SaveChangesAsync(ct);
        return new CartItemDto(existing.Id, existing.UserId, product.Id, product.Name, product.Price, existing.Quantity, product.Price * existing.Quantity);
    }

    public async Task<CartItemDto> UpdateQuantityAsync(int cartItemId, string userId, int quantity, CancellationToken ct = default)
    {
        if (quantity <= 0) throw new BadRequestException("Quantity must be greater than 0.");

        var item = await db.CartItems.Include(c => c.Product)
            .FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId, ct)
            ?? throw new NotFoundException("Cart item not found.");

        if (item.Product is null) throw new NotFoundException("Product not found.");
        if (item.Product.Stock < quantity)
            throw new BadRequestException($"Only {item.Product.Stock} units in stock.");

        item.Quantity = quantity;
        await db.SaveChangesAsync(ct);
        return new CartItemDto(item.Id, item.UserId, item.ProductId, item.Product.Name, item.Product.Price, item.Quantity, item.Product.Price * item.Quantity);
    }

    public async Task RemoveFromCartAsync(int cartItemId, string userId, CancellationToken ct = default)
    {
        var item = await db.CartItems.FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId, ct)
            ?? throw new NotFoundException("Cart item not found.");
        db.CartItems.Remove(item);
        await db.SaveChangesAsync(ct);
    }

    public async Task ClearCartAsync(string userId, CancellationToken ct = default)
    {
        var items = await db.CartItems.Where(c => c.UserId == userId).ToListAsync(ct);
        db.CartItems.RemoveRange(items);
        await db.SaveChangesAsync(ct);
    }
}
