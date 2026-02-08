using SendGrid;
using SendGrid.Helpers.Mail;

namespace Invenet.Api.Services;

/// <summary>
/// SendGrid email service implementation
/// </summary>
public sealed class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string? _apiKey;
    private readonly string? _fromEmail;
    private readonly string? _fromName;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        _apiKey = configuration["SendGrid:ApiKey"];
        _fromEmail = configuration["SendGrid:FromEmail"];
        _fromName = configuration["SendGrid:FromName"] ?? "Invenet";
    }

    /// <inheritdoc />
    public async Task<bool> SendEmailAsync(string to, string subject, string htmlBody)
    {
        // In development, if SendGrid is not configured, log to console instead
        if (string.IsNullOrWhiteSpace(_apiKey) || string.IsNullOrWhiteSpace(_fromEmail))
        {
            _logger.LogWarning(
                "SendGrid not configured. Email would be sent to {To} with subject: {Subject}",
                to,
                subject);
            _logger.LogInformation("Email body:\n{Body}", htmlBody);
            return true; // Return true in dev to allow testing without SendGrid
        }

        try
        {
            var client = new SendGridClient(_apiKey);
            var from = new EmailAddress(_fromEmail, _fromName);
            var toAddress = new EmailAddress(to);
            var msg = MailHelper.CreateSingleEmail(from, toAddress, subject, null, htmlBody);

            var response = await client.SendEmailAsync(msg);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email sent successfully to {To}", to);
                return true;
            }

            var responseBody = await response.Body.ReadAsStringAsync();
            _logger.LogError(
                "Failed to send email to {To}. Status: {Status}, Response: {Response}",
                to,
                response.StatusCode,
                responseBody);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending email to {To}", to);
            return false;
        }
    }
}
