namespace Invenet.Api.Modules.Auth.Infrastructure.Email;

/// <summary>
/// Service for sending emails.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email confirmation email.
    /// </summary>
    Task SendEmailConfirmationAsync(string toEmail, string confirmationLink);
    
    /// <summary>
    /// Sends a password reset email.
    /// </summary>
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink);
}
