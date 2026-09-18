using System.Net;
using System.Text.Json;
using FluentValidation;
using ShopX.Core.Exceptions;

namespace ShopX.Api.Middlewares;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await WriteProblemAsync(context, ex);
        }
    }

    private static Task WriteProblemAsync(HttpContext context, Exception ex)
    {
        var (status, title) = ex switch
        {
            NotFoundException => (HttpStatusCode.NotFound, "Not Found"),
            BadRequestException => (HttpStatusCode.BadRequest, "Bad Request"),
            ValidationException => (HttpStatusCode.BadRequest, "Validation Failed"),
            _ => (HttpStatusCode.InternalServerError, "Internal Server Error")
        };

        object? errors = ex is ValidationException vex
            ? vex.Errors.Select(e => new { e.PropertyName, e.ErrorMessage })
            : null;

        var problem = new
        {
            title,
            status = (int)status,
            detail = ex.Message,
            errors,
            traceId = context.TraceIdentifier
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)status;
        return context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}
