using Arribatec.Nexus.Client.Extensions;
using Arribatec.Nexus.Client.TaskExecution;
using FKarribatecofficerpg.Api.Repositories;

var builder = WebApplication.CreateBuilder(args);


// Add COMPLETE Nexus architecture in ONE call
builder.AddArribatecNexus(
    applicationName: "FKarribatecofficerpgApp",
    productShortName: "FKarribatecofficerpg",
    options =>
    {
        options.Loki = new LokiOptions
        {
            Url = "http://localhost:3100",
            WriteToConsole = true
        };
    });

// Register game repository
builder.Services.AddScoped<IGameStateRepository, GameStateRepository>();
builder.Services.AddScoped<IQuizQuestionRepository, QuizQuestionRepository>();

// Register HttpClient factory for LLM API calls
builder.Services.AddHttpClient();

builder.Services.AddControllers(options =>
{
    // Disable automatic 400 responses for model validation
    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
})
    .AddJsonOptions(options =>
    {
        // Use camelCase property names to match frontend JavaScript conventions
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        // Allow reading property names regardless of case
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();


// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // Log all incoming request details for debugging
    app.Use(async (context, next) =>
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var path = context.Request.Path.Value;
        
        if (path?.Contains("gamestate", StringComparison.OrdinalIgnoreCase) == true)
        {
            logger.LogInformation("=== REQUEST DEBUG ===");
            logger.LogInformation("Path: {Path}", path);
            logger.LogInformation("Method: {Method}", context.Request.Method);
            logger.LogInformation("Content-Type: {ContentType}", context.Request.ContentType);
            logger.LogInformation("Content-Length: {ContentLength}", context.Request.ContentLength);
            
            // Read and log the request body
            context.Request.EnableBuffering();
            var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
            context.Request.Body.Position = 0; // Reset for model binding
            
            if (!string.IsNullOrEmpty(body))
            {
                logger.LogInformation("Body: {Body}", body.Length > 500 ? body.Substring(0, 500) + "..." : body);
            }
            else
            {
                logger.LogWarning("Body is EMPTY!");
            }
            logger.LogInformation("=== END REQUEST DEBUG ===");
        }
        
        await next();
    });
}

// CRITICAL: Correct middleware order for v2.2.0
app.UseCors();                  // 2. CORS
app.UseAuthentication();        // 3. Validate JWT token
app.UseArribatecNexus();  // ← Then context middleware
app.UseAuthorization();         // 5. Check roles/policies
app.MapControllers();

app.Lifetime.ApplicationStarted.Register(() =>
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    var urls = app.Urls.FirstOrDefault() ?? "http://localhost:7439";
    var port = new Uri(urls).Port;
    
    var swaggerUrl = $"http://localhost:{port}/swagger";
    var apiUrl = $"http://localhost:{port}/api";
    
    // Box inner width is 56 chars (between ║ and ║)
    // Emojis display as 2 chars wide but count as 1, so pad to 56 to compensate
    var swaggerLine = $"  🌐 Swagger:  {swaggerUrl}".PadRight(56);
    var apiLine = $"  🚀 API:      {apiUrl}".PadRight(56);
    
    logger.LogInformation("");
    logger.LogInformation("╔════════════════════════════════════════════════════════╗");
    logger.LogInformation("║                                                        ║");
    logger.LogInformation("║   ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗          ║");
    logger.LogInformation("║   ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝          ║");
    logger.LogInformation("║   ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗          ║");
    logger.LogInformation("║   ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║          ║");
    logger.LogInformation("║   ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║          ║");
    logger.LogInformation("║   ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝          ║");
    logger.LogInformation("║                                                        ║");
    logger.LogInformation("║            ✨ API is ready! ✨                         ║");
    logger.LogInformation("║                                                        ║");
    logger.LogInformation("╠════════════════════════════════════════════════════════╣");
    logger.LogInformation($"║{swaggerLine}║");
    logger.LogInformation($"║{apiLine}║");
    logger.LogInformation("╚════════════════════════════════════════════════════════╝");
    logger.LogInformation("");
});

app.Run();
