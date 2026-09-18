# ShopX — E-Commerce Web API

A clean, practical ASP.NET Core Web API for a mini e-commerce flow: **Product CRUD, Cart logic, Order placement**, plus **SignalR real-time order status updates**.

No Docker, no microservices, no queues — just solid C#, EF Core, DI, validation, and error handling.

## Tech Stack

- ASP.NET Core Web API (.NET 10), C#
- Entity Framework Core 10 (Code-First) + SQL Server
- SignalR for live order updates
- FluentValidation for input validation
- Swagger / OpenAPI (Swashbuckle)

## Architecture (3-Layer)

```text
ShopX/
├── ShopX.slnx
└── src/
    ├── ShopX.Api/            # Controllers, Hubs, Middleware, Program.cs, appsettings.json
    ├── ShopX.Core/           # Entities, DTOs, Interfaces, Services (business logic), Validators
    └── ShopX.Infrastructure/ # ShopXDbContext, Migrations, Seed data
```

- **DI:** `IShopXDbContext` (Core) → `ShopXDbContext` (Infrastructure); services `IProductService`, `ICartService`, `IOrderService` registered as scoped in `Program.cs`.
- **Error handling:** `ExceptionHandlingMiddleware` maps `NotFoundException` → 404, `BadRequestException` / `ValidationException` → 400, else 500 (RFC-style problem JSON).
- **Validation:** FluentValidation auto-validation (`AddFluentValidationAutoValidation`).

## Features

- `GET/POST/PUT/DELETE /api/products` — product catalog
- `GET /api/cart/{userId}`, `POST /api/cart`, `PUT /api/cart/{id}?userId=`, `DELETE ...` — cart per `UserId` (demo string, no auth for simplicity)
- `POST /api/orders` (`{ "userId": "demo-user" }`) — creates order from cart, decrements stock, clears cart
- `PATCH /api/orders/{id}/status` — updates status and broadcasts via SignalR
- **SignalR hub** `GET /hubs/orders`:
  - Client calls `JoinOrder(orderId)` → joins group `order-{id}`
  - Server pushes `OrderStatusUpdated` `{ id, status }` on place + status change

## Prerequisites

- .NET 10 SDK
- SQL Server (LocalDB works): `Server=(localdb)\mssqllocaldb`
- EF Core CLI: `dotnet tool install -g dotnet-ef`

## How to Run

1. Update the connection string if needed in `src/ShopX.Api/appsettings.json`:
   ```json
   "ConnectionStrings": { "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ShopXDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True" }
   ```
2. Apply migrations + run:
   ```bash
   cd ShopX
   dotnet ef database update --project src/ShopX.Infrastructure --startup-project src/ShopX.Api
   dotnet run --project src/ShopX.Api
   ```
3. Open Swagger: `http://localhost:5062/swagger`
4. Seed data: 4 demo products are seeded via `HasData` (headphones, keyboard, monitor, hub).

### Quick smoke test

```bash
# Products
curl http://localhost:5062/api/products
# Add to cart
curl -X POST http://localhost:5062/api/cart -H "Content-Type: application/json" -d "{\"userId\":\"demo-user\",\"productId\":1,\"quantity\":2}"
# Place order
curl -X POST http://localhost:5062/api/orders -H "Content-Type: application/json" -d "{\"userId\":\"demo-user\"}"
# Update status (also pushes SignalR event)
curl -X PATCH http://localhost:5062/api/orders/1/status -H "Content-Type: application/json" -d "{\"status\":2}"
```

SignalR (JS client): connect to `http://localhost:5062/hubs/orders`, invoke `JoinOrder("1")`, listen for `OrderStatusUpdated`.

## Update Database Migrations

```bash
cd ShopX
# After changing entities / DbContext:
dotnet ef migrations add <Name> --project src/ShopX.Infrastructure --startup-project src/ShopX.Api --output-dir Migrations
dotnet ef database update --project src/ShopX.Infrastructure --startup-project src/ShopX.Api
# To revert last migration (if not applied):
dotnet ef migrations remove --project src/ShopX.Infrastructure --startup-project src/ShopX.Api
```
