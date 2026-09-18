using ShopX.Core.Dtos;
using ShopX.Core.Enums;

namespace ShopX.Core.Interfaces;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync(CancellationToken ct = default);
    Task<ProductDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ProductDto> CreateAsync(ProductCreateDto dto, CancellationToken ct = default);
    Task<ProductDto> UpdateAsync(int id, ProductUpdateDto dto, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}

public interface ICartService
{
    Task<List<CartItemDto>> GetCartAsync(string userId, CancellationToken ct = default);
    Task<CartItemDto> AddToCartAsync(AddToCartDto dto, CancellationToken ct = default);
    Task<CartItemDto> UpdateQuantityAsync(int cartItemId, string userId, int quantity, CancellationToken ct = default);
    Task RemoveFromCartAsync(int cartItemId, string userId, CancellationToken ct = default);
    Task ClearCartAsync(string userId, CancellationToken ct = default);
}

public interface IOrderService
{
    Task<List<OrderDto>> GetAllAsync(CancellationToken ct = default);
    Task<List<OrderDto>> GetByUserAsync(string userId, CancellationToken ct = default);
    Task<OrderDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<OrderDto> PlaceOrderAsync(string userId, CancellationToken ct = default);
    Task<OrderDto> UpdateStatusAsync(int id, OrderStatus status, CancellationToken ct = default);
}
