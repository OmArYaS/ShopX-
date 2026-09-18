using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ShopX.Api.Hubs;
using ShopX.Core.Dtos;
using ShopX.Core.Interfaces;

namespace ShopX.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class OrdersController(IOrderService orders, IHubContext<OrderHub> hub) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetAll(CancellationToken ct) =>
        Ok(await orders.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetById(int id, CancellationToken ct) =>
        Ok(await orders.GetByIdAsync(id, ct));

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<OrderDto>>> GetByUser(string userId, CancellationToken ct) =>
        Ok(await orders.GetByUserAsync(userId, ct));

    [HttpPost]
    public async Task<ActionResult<OrderDto>> PlaceOrder([FromBody] CreateOrderDto dto, CancellationToken ct)
    {
        var order = await orders.PlaceOrderAsync(dto.UserId, ct);
        await hub.Clients.Group($"order-{order.Id}")
            .SendAsync("OrderStatusUpdated", new { order.Id, Status = order.Status }, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto, CancellationToken ct)
    {
        var order = await orders.UpdateStatusAsync(id, dto.Status, ct);
        // Real-time push to all clients watching this order
        await hub.Clients.Group($"order-{order.Id}")
            .SendAsync("OrderStatusUpdated", new { order.Id, Status = order.Status }, ct);
        return Ok(order);
    }
}
