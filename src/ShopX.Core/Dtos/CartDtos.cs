namespace ShopX.Core.Dtos;

public record AddToCartDto(string UserId, int ProductId, int Quantity);
public record UpdateCartItemDto(int Quantity);
public record CartItemDto(int Id, string UserId, int ProductId, string ProductName, decimal UnitPrice, int Quantity, decimal LineTotal);
