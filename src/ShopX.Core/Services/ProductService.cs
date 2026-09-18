using Microsoft.EntityFrameworkCore;
using ShopX.Core.Data;
using ShopX.Core.Dtos;
using ShopX.Core.Entities;
using ShopX.Core.Exceptions;
using ShopX.Core.Interfaces;

namespace ShopX.Core.Services;

public class ProductService(IShopXDbContext db) : IProductService
{
    public async Task<List<ProductDto>> GetAllAsync(CancellationToken ct = default) =>
        await db.Products.AsNoTracking()
            .OrderBy(p => p.Name)
            .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Price, p.Stock, p.CreatedAt))
            .ToListAsync(ct);

    public async Task<ProductDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var p = await db.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException($"Product {id} not found.");
        return new ProductDto(p.Id, p.Name, p.Description, p.Price, p.Stock, p.CreatedAt);
    }

    public async Task<ProductDto> CreateAsync(ProductCreateDto dto, CancellationToken ct = default)
    {
        var product = new Product
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            Price = dto.Price,
            Stock = dto.Stock,
            CreatedAt = DateTime.UtcNow
        };
        db.Products.Add(product);
        await db.SaveChangesAsync(ct);
        return new ProductDto(product.Id, product.Name, product.Description, product.Price, product.Stock, product.CreatedAt);
    }

    public async Task<ProductDto> UpdateAsync(int id, ProductUpdateDto dto, CancellationToken ct = default)
    {
        var product = await db.Products.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException($"Product {id} not found.");

        product.Name = dto.Name.Trim();
        product.Description = dto.Description?.Trim();
        product.Price = dto.Price;
        product.Stock = dto.Stock;

        await db.SaveChangesAsync(ct);
        return new ProductDto(product.Id, product.Name, product.Description, product.Price, product.Stock, product.CreatedAt);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var product = await db.Products.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException($"Product {id} not found.");
        db.Products.Remove(product);
        await db.SaveChangesAsync(ct);
    }
}
