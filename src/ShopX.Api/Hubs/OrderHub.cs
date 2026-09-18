using Microsoft.AspNetCore.SignalR;

namespace ShopX.Api.Hubs;

// Real-time order status updates.
// Client flow: connect to /hubs/orders, call JoinOrder(orderId),
// server broadcasts "OrderStatusUpdated" to group $"order-{orderId}".
public class OrderHub : Hub
{
    public async Task JoinOrder(string orderId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"order-{orderId}");
        await Clients.Caller.SendAsync("JoinedOrder", orderId);
    }

    public async Task LeaveOrder(string orderId) =>
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"order-{orderId}");
}
