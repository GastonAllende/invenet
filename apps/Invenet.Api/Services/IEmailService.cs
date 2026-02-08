namespace Invenet.Api.Services;

/// <summary>
/// Service for sending emails
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email asynchronously
    /// </summary>
    /// <param name="to">Recipient email address</param>
    /// <param name="subject">Email subject</param>
    /// <param name="htmlBody">HTML body of the email</param>
    /// <returns>True if email was sent successfully, false otherwise</returns>
    Task<bool> SendEmailAsync(string to, string subject, string htmlBody);
}
