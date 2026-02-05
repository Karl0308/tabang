
using Tabang.Models;
using TabangService.DAL;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using TabangService.DAL.Models;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Hosting;
using TabangService.DAL.Models.AutoMapper;
using System.Text.Json.Serialization;
using System;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(x =>
                x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<TabangContext>();
builder.Services.AddDbContext<TabangAttachmentContext>();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigin", opt => {
        opt.WithOrigins("https://tabang.azurewebsites.net", "https://ticket.gokraken.io/");
        opt.AllowAnyOrigin();
        opt.AllowAnyMethod();
        opt.AllowAnyHeader();
        //opt.AllowCredentials();
        //opt.SetIsOriginAllowed(_ => true);
    });
});
//Authentication
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<TabangContext>()
    .AddDefaultTokenProviders();
// Configure authentication with JWT
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:SecretKey"]);
builder.Services.AddAuthentication(config =>
{
    config.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    config.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})

.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "AuthorizationClaim",Version = "v1"});
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme { 
    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
    Description = "Input Token",
    Name = "Authorization",
    Type = SecuritySchemeType.Http,
    BearerFormat = "JWT",
    Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { 
        {
            new OpenApiSecurityScheme{ 
            Reference = new OpenApiReference{ 
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
            }
            },
            new string[]{ }
        }
    });
});
builder.Services.AddAutoMapper(typeof(MappingProfile));

//Authentication

builder.Services.Configure<IdentityOptions>(options =>
{
    // Default Password settings.
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 0;
    options.Password.RequiredUniqueChars = 0;
});


var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<TabangContext>();
    dbContext.Database.Migrate(); // This applies any pending migrations
}
// Configure the HTTP request pipeline.

if (app.Environment.IsDevelopment())
{ 
    app.UseSwagger();
    app.UseSwaggerUI();
   

}

app.UseCors(opt => {
    opt.AllowAnyOrigin();
    opt.AllowAnyMethod();
    opt.AllowAnyHeader();
    //opt.AllowCredentials();
    //opt.SetIsOriginAllowed(_ => true);
});

app.UseDeveloperExceptionPage();
app.MapControllers(); 
app.MapControllers().RequireAuthorization();
app.UseRouting();
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();
