using SendGrid;
using SendGrid.Helpers.Mail;

namespace Invenet.Api.Modules.Auth.Infrastructure.Email;

/// <summary>
/// Email service implementation using SendGrid.
/// </summary>
public sealed class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly IWebHostEnvironment _environment;

    public EmailService(
        IConfiguration configuration,
        ILogger<EmailService> logger,
        IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _logger = logger;
        _environment = environment;
    }

    public async Task SendEmailConfirmationAsync(string toEmail, string confirmationLink)
    {
        var templatePath = Path.Combine(_environment.ContentRootPath, "EmailTemplates", "EmailConfirmation.html");
        var htmlContent = await File.ReadAllTextAsync(templatePath);
        htmlContent = htmlContent.Replace("{{confirmationLink}}", confirmationLink);

        await SendEmailAsync(
            toEmail,
            "Confirm your email",
            htmlContent
        );
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        var templatePath = Path.Combine(_environment.ContentRootPath, "EmailTemplates", "PasswordReset.html");
        var htmlContent = await File.ReadAllTextAsync(templatePath);
        htmlContent = htmlContent.Replace("{{resetLink}}", resetLink);

        await SendEmailAsync(
            toEmail,
            "Reset your password",
            htmlContent
        );
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
    {
        var apiKey = _configuration["SendGrid:ApiKey"];
        var fromEmail = _configuration["SendGrid:FromEmail"];
        var fromName = _configuration["SendGrid:FromName"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("SendGrid API key not configured. Email not sent to {Email}", toEmail);
            return;
        }

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(toEmail);
        var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);

        var response = await client.SendEmailAsync(msg);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Body.ReadAsStringAsync();
            _logger.LogError("Failed to send email to {Email}. Status: {Status}, Body: {Body}",
                toEmail, response.StatusCode, body);
        }
        else
        {
            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
        }
    }
}
