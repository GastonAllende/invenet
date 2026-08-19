using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Invenet.Api.Modules.Shared.Contracts;

namespace Invenet.Api.Modules.Auth;

/// <summary>
/// Authentication and Authorization module.
/// Validates JWTs issued by Supabase Auth; user management, sessions, and
/// email flows are handled entirely by Supabase (frontend talks to it directly).
/// </summary>
public class AuthModule : IModule
{
  public IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
  {
    var projectUrl = configuration["Supabase:Url"];
    var authority = $"{projectUrl}/auth/v1";

    services.AddAuthentication(options =>
        {
          options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
          options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
          options.Authority = authority;
          options.MapInboundClaims = false;
          options.TokenValidationParameters = new TokenValidationParameters
          {
            ValidateIssuer = true,
            ValidIssuer = authority,
            // TODO: flip on once confirmed against a real issued token (see plan notes)
            ValidateAudience = false,
            ValidateLifetime = true,
            NameClaimType = "sub",
          };
        });

    services.AddAuthorization();

    return services;
  }

  public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
  {
    return endpoints;
  }
}
