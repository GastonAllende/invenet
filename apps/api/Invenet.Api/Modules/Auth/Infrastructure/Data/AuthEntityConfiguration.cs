using Invenet.Api.Modules.Auth.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Invenet.Api.Modules.Auth.Infrastructure.Data;

/// <summary>
/// Entity Framework configuration for Auth module entities.
/// </summary>
public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
  public void Configure(EntityTypeBuilder<ApplicationUser> builder)
  {
    builder.ToTable("AspNetUsers");

    builder.HasKey(u => u.Id);

    builder.Property(u => u.CreatedAt)
        .IsRequired();

    builder.Property(u => u.UpdatedAt)
        .IsRequired();

    builder.HasMany(u => u.RefreshTokens)
        .WithOne(rt => rt.User)
        .HasForeignKey(rt => rt.UserId)
        .OnDelete(DeleteBehavior.Cascade);
  }
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
  public void Configure(EntityTypeBuilder<RefreshToken> builder)
  {
    builder.ToTable("RefreshTokens", schema: "auth");

    builder.HasKey(rt => rt.Id);

    builder.Property(rt => rt.Token)
        .IsRequired()
        .HasMaxLength(500);

    builder.Property(rt => rt.UserId)
        .IsRequired();

    builder.Property(rt => rt.ExpiresAt)
        .IsRequired();

    builder.Property(rt => rt.IsRevoked)
        .IsRequired();

    builder.HasIndex(rt => rt.Token)
        .IsUnique();

    builder.HasIndex(rt => rt.UserId);
  }
}

public class IdentityRoleConfiguration : IEntityTypeConfiguration<IdentityRole<Guid>>
{
  public void Configure(EntityTypeBuilder<IdentityRole<Guid>> builder)
  {
    builder.ToTable("AspNetRoles");
  }
}

public class IdentityUserRoleConfiguration : IEntityTypeConfiguration<IdentityUserRole<Guid>>
{
  public void Configure(EntityTypeBuilder<IdentityUserRole<Guid>> builder)
  {
    builder.ToTable("AspNetUserRoles");
    builder.HasKey(ur => new { ur.UserId, ur.RoleId });
  }
}

public class IdentityUserClaimConfiguration : IEntityTypeConfiguration<IdentityUserClaim<Guid>>
{
  public void Configure(EntityTypeBuilder<IdentityUserClaim<Guid>> builder)
  {
    builder.ToTable("AspNetUserClaims");
  }
}

public class IdentityUserLoginConfiguration : IEntityTypeConfiguration<IdentityUserLogin<Guid>>
{
  public void Configure(EntityTypeBuilder<IdentityUserLogin<Guid>> builder)
  {
    builder.ToTable("AspNetUserLogins");
    builder.HasKey(l => new { l.LoginProvider, l.ProviderKey });
  }
}

public class IdentityRoleClaimConfiguration : IEntityTypeConfiguration<IdentityRoleClaim<Guid>>
{
  public void Configure(EntityTypeBuilder<IdentityRoleClaim<Guid>> builder)
  {
    builder.ToTable("AspNetRoleClaims");
  }
}

public class IdentityUserTokenConfiguration : IEntityTypeConfiguration<IdentityUserToken<Guid>>
{
  public void Configure(EntityTypeBuilder<IdentityUserToken<Guid>> builder)
  {
    builder.ToTable("AspNetUserTokens");
    builder.HasKey(t => new { t.UserId, t.LoginProvider, t.Name });
  }
}
