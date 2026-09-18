using ShopX.Core.Enums;

namespace ShopX.Core.Dtos;

public record CreateOrderDto(string UserId);
public record UpdateOrderStatusDto(OrderStatus Status);
public record OrderItemDto(int ProductId, string ProductName, int Quantity, decimal UnitPrice);
public record OrderDto(int Id, string UserId, string Status, decimal TotalAmount, DateTime CreatedAt, List<OrderItemDto> Items);
