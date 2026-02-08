using Invenet.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Invenet.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<ApplicationUser>(builder =>
        {
            builder.Property(user => user.CreatedAt)
                .HasDefaultValueSql("now()")
                .IsRequired();
            builder.Property(user => user.UpdatedAt)
                .HasDefaultValueSql("now()")
                .IsRequired();
            builder.Property(user => user.LastLoginAt);
        });

        modelBuilder.Entity<RefreshToken>(builder =>
        {
            builder.ToTable("refresh_tokens");
            builder.HasKey(token => token.Id);

            builder.Property(token => token.TokenHash)
                .HasMaxLength(256)
                .IsRequired();
            builder.Property(token => token.TokenFamily)
                .IsRequired();
            builder.Property(token => token.CreatedAt)
                .HasDefaultValueSql("now()")
                .IsRequired();
            builder.Property(token => token.ExpiresAt)
                .IsRequired();
            builder.Property(token => token.CreatedByIp)
                .HasMaxLength(64);
            builder.Property(token => token.RevokedByIp)
                .HasMaxLength(64);

            builder.HasIndex(token => token.TokenHash)
                .IsUnique();
            builder.HasIndex(token => token.UserId);
            builder.HasIndex(token => token.TokenFamily);

            builder.HasOne(token => token.User)
                .WithMany(user => user.RefreshTokens)
                .HasForeignKey(token => token.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
