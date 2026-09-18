using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using ShopX.Api.Hubs;
using ShopX.Api.Middlewares;
using ShopX.Core.Data;
using ShopX.Core.Interfaces;
using ShopX.Core.Services;
using ShopX.Core.Validators;
using ShopX.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Database (SQL Server, Code-First)
builder.Services.AddDbContext<ShopXDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IShopXDbContext>(sp => sp.GetRequiredService<ShopXDbContext>());

// Business services (DI)
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// Validation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<ProductCreateValidator>();

// API + Swagger + SignalR
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "ShopX API", Version = "v1", Description = "E-Commerce demo: Products, Cart, Orders + SignalR order updates" });
});
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(p => p.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true)));

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();
app.MapHub<OrderHub>("/hubs/orders");

app.Run();
