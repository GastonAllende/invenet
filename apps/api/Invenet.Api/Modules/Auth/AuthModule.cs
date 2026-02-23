using Invenet.Api.Modules.Auth.Domain;
using Invenet.Api.Modules.Auth.Infrastructure.Email;
using Invenet.Api.Modules.Shared.Contracts;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Invenet.Api.Modules.Shared.Infrastructure.Data;

namespace Invenet.Api.Modules.Auth;

/// <summary>
/// Authentication and Authorization module.
/// Handles user registration, login, email confirmation, password reset, and JWT token management.
/// </summary>
public class AuthModule : IModule
{
  public IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
  {
    // Register email service
    services.AddScoped<IEmailService, EmailService>();

    // Configure Identity
    services.AddIdentityCore<ApplicationUser>(options =>
        {
          options.User.RequireUniqueEmail = true;
          options.SignIn.RequireConfirmedEmail = true;
          options.Password.RequireDigit = true;
          options.Password.RequireLowercase = true;
          options.Password.RequireUppercase = true;
          options.Password.RequireNonAlphanumeric = true;
          options.Password.RequiredLength = 10;
        })
        .AddRoles<IdentityRole<Guid>>()
        .AddEntityFrameworkStores<ModularDbContext>()
        .AddSignInManager()
        .AddDefaultTokenProviders();

    // Configure JWT Authentication
    services.AddAuthentication(options =>
        {
          options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
          options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
          var jwtKey = configuration["Jwt:Key"];
          var issuer = configuration["Jwt:Issuer"];
          var audience = configuration["Jwt:Audience"];

          if (!string.IsNullOrWhiteSpace(jwtKey))
          {
            options.TokenValidationParameters = new TokenValidationParameters
            {
              ValidateIssuerSigningKey = true,
              IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
              ValidateIssuer = true,
              ValidIssuer = issuer,
              ValidateAudience = true,
              ValidAudience = audience,
              ValidateLifetime = true,
              ClockSkew = TimeSpan.FromSeconds(30)
            };
          }
        });

    services.AddAuthorization();

    return services;
  }

  public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
  {
    // Endpoints are mapped via the AuthController
    return endpoints;
  }
}
