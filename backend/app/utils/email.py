import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

_logger = logging.getLogger(__name__)

def send_verification_email(to_email: str, token: str, user_name: str) -> bool:
    """
    Sends an email with an account verification link.
    If SMTP settings are not configured, logs the verification link to the console instead.
    """
    verification_link = f"{settings.FRONTEND_URL}/verify?token={token}"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Verify your QuikrClone Account</h2>
          <p>Hi {user_name},</p>
          <p>Thank you for registering. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_link}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 14px;">{verification_link}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af;">If you did not create an account, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
    """

    # Fallback if SMTP is not configured
    if not settings.SMTP_HOST:
        _logger.warning("SMTP_HOST not configured. Email not sent. Printing verification link below:")
        _logger.info("=====================================================")
        _logger.info(f"Verification Link for {to_email}:")
        _logger.info(verification_link)
        _logger.info("=====================================================")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Verify your QuikrClone Account"
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        _logger.info("Sending verification email to %s via %s", to_email, settings.SMTP_HOST)
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
        
        return True
    except Exception as e:
        _logger.exception("Failed to send verification email to %s: %s", to_email, str(e))
        return False
