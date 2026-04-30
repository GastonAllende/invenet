using Resend;

namespace Invenet.Api.Modules.Auth.Infrastructure.Email;

/// <summary>
/// Email service implementation using the official Resend .NET SDK.
/// </summary>
public sealed class EmailService
{
  private readonly IResend _resend;
  private readonly IConfiguration _configuration;
  private readonly ILogger<EmailService> _logger;
  private readonly IWebHostEnvironment _environment;

  public EmailService(
      IResend resend,
      IConfiguration configuration,
      ILogger<EmailService> logger,
      IWebHostEnvironment environment)
  {
    _resend = resend;
    _configuration = configuration;
    _logger = logger;
    _environment = environment;
  }

  public async Task SendEmailConfirmationAsync(string toEmail, string confirmationLink)
  {
    var templatePath = Path.Combine(_environment.ContentRootPath, "EmailTemplates", "EmailConfirmation.html");
    var htmlContent = await File.ReadAllTextAsync(templatePath);
    htmlContent = htmlContent.Replace("{{CONFIRMATION_LINK}}", confirmationLink);

    await SendEmailAsync(toEmail, "Confirm your email", htmlContent);
  }

  public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
  {
    var templatePath = Path.Combine(_environment.ContentRootPath, "EmailTemplates", "PasswordReset.html");
    var htmlContent = await File.ReadAllTextAsync(templatePath);
    htmlContent = htmlContent.Replace("{{RESET_LINK}}", resetLink);

    await SendEmailAsync(toEmail, "Reset your password", htmlContent);
  }

  private async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
  {
    var apiKey = _configuration["Resend:ApiKey"];
    var fromEmail = _configuration["Resend:FromEmail"];
    var fromName = _configuration["Resend:FromName"];

    if (string.IsNullOrWhiteSpace(apiKey) || apiKey.StartsWith("SET_VIA"))
    {
      _logger.LogWarning("Resend API key not configured. Email not sent to {Email}", toEmail);
      if (_environment.IsDevelopment())
      {
        _logger.LogInformation("[DEV EMAIL] To: {Email} | Subject: {Subject}\n{Content}", toEmail, subject, htmlContent);
      }
      return;
    }

    var from = string.IsNullOrWhiteSpace(fromName)
        ? fromEmail!
        : $"{fromName} <{fromEmail}>";

    var message = new EmailMessage
    {
      From = from,
      Subject = subject,
      HtmlBody = htmlContent
    };
    message.To.Add(toEmail);

    try
    {
      await _resend.EmailSendAsync(message);
      _logger.LogInformation("Email sent successfully to {Email}", toEmail);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
    }
  }
}
