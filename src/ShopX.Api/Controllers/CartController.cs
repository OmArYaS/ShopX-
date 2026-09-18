using Microsoft.AspNetCore.Mvc;
using ShopX.Core.Dtos;
using ShopX.Core.Interfaces;

namespace ShopX.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CartController(ICartService cart) : ControllerBase
{
    [HttpGet("{userId}")]
    public async Task<ActionResult<List<CartItemDto>>> GetCart(string userId, CancellationToken ct) =>
        Ok(await cart.GetCartAsync(userId, ct));

    [HttpPost]
    public async Task<ActionResult<CartItemDto>> Add([FromBody] AddToCartDto dto, CancellationToken ct) =>
        Ok(await cart.AddToCartAsync(dto, ct));

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CartItemDto>> UpdateQuantity(
        int id, [FromQuery] string userId, [FromBody] UpdateCartItemDto dto, CancellationToken ct) =>
        Ok(await cart.UpdateQuantityAsync(id, userId, dto.Quantity, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remove(int id, [FromQuery] string userId, CancellationToken ct)
    {
        await cart.RemoveFromCartAsync(id, userId, ct);
        return NoContent();
    }

    [HttpDelete("clear/{userId}")]
    public async Task<IActionResult> Clear(string userId, CancellationToken ct)
    {
        await cart.ClearCartAsync(userId, ct);
        return NoContent();
    }
}
