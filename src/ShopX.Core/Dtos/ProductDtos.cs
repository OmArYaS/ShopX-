namespace ShopX.Core.Dtos;

public record ProductDto(int Id, string Name, string? Description, decimal Price, int Stock, DateTime CreatedAt);
public record ProductCreateDto(string Name, string? Description, decimal Price, int Stock);
public record ProductUpdateDto(string Name, string? Description, decimal Price, int Stock);
