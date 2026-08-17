"""
Email utility functions for the Marketa platform.
Handles sending verification, welcome, forgot-password, and password-changed emails
through SMTP (Gmail).
"""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

_logger = logging.getLogger(__name__)


def _get_from_header() -> str:
    """Returns a formatted 'From' header like: Marketa <user@gmail.com>"""
    name = settings.SMTP_FROM_NAME or "Marketa"
    email = settings.SMTP_USER or settings.SMTP_FROM_EMAIL
    return f"{name} <{email}>"


def _send_html_email(to_email: str, subject: str, html_body: str) -> bool:
    """
    Core email sender. All public functions delegate to this.
    Falls back to console logging if SMTP is not configured.
    """
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        _logger.warning("SMTP not configured. Printing email content to console.")
        _logger.info("=" * 60)
        _logger.info("TO: %s | SUBJECT: %s", to_email, subject)
        _logger.info("=" * 60)
        return True  # Return True so the flow continues

    try:
        import uuid as _uuid
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = _get_from_header()
        msg["To"] = to_email
        msg["Reply-To"] = settings.SMTP_USER
        msg["Message-ID"] = f"<{_uuid.uuid4()}@marketa.local>"
        msg.attach(MIMEText(html_body, "html"))

        _logger.info("Sending email to %s via %s:%s", to_email, settings.SMTP_HOST, settings.SMTP_PORT)
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.set_debuglevel(1)  # Log SMTP conversation for debugging
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            result = server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
            _logger.info("SMTP sendmail result (empty = success): %s", result)

        _logger.info("Email sent successfully to %s", to_email)
        return True
    except smtplib.SMTPRecipientsRefused as e:
        _logger.error("Recipient refused by SMTP server: %s", str(e))
        return False
    except smtplib.SMTPException as e:
        _logger.error("SMTP error sending to %s: %s", to_email, str(e))
        return False
    except Exception as e:
        _logger.exception("Failed to send email to %s: %s", to_email, str(e))
        return False


def _email_wrapper(content: str) -> str:
    """Wraps email content in a branded HTML template."""
    return f"""
    <html>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px 40px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Marketa</h1>
            <p style="margin: 5px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Buy & Sell Locally</p>
          </div>
          <!-- Body -->
          <div style="padding: 40px;">
            {content}
          </div>
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #eaeaea;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              &copy; 2026 Marketa. All rights reserved.<br/>
              This is an automated message — please do not reply.
            </p>
          </div>
        </div>
      </body>
    </html>
    """


# ── Public Email Functions ───────────────────────────────────────────────────


def send_verification_email(to_email: str, token: str, user_name: str) -> bool:
    """Sends an email with an account verification link."""
    verification_link = f"{settings.FRONTEND_URL}/verify?token={token}"
    content = f"""
        <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
        <p>Hi <strong>{user_name}</strong>,</p>
        <p>Thank you for registering on Marketa. Please click the button below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="{verification_link}" style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
            ✅ Verify My Email
          </a>
        </div>
        <p style="font-size: 13px; color: #6b7280;">Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4f46e5; font-size: 13px; background: #f3f4f6; padding: 10px; border-radius: 6px;">{verification_link}</p>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 20px;">⏰ This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
    """
    return _send_html_email(to_email, "Verify Your Marketa Account ✅", _email_wrapper(content))


def send_welcome_email(to_email: str, user_name: str) -> bool:
    """Sends a welcome email after successful signup."""
    content = f"""
        <h2 style="color: #1f2937; margin-top: 0;">Welcome to Marketa! 🎉</h2>
        <p>Hi <strong>{user_name}</strong>,</p>
        <p>We're excited to have you join our community! With Marketa, you can:</p>
        <ul style="color: #374151; padding-left: 20px;">
          <li>📦 Post ads to sell your items quickly</li>
          <li>🔍 Browse thousands of listings near you</li>
          <li>💬 Chat directly with buyers and sellers</li>
          <li>❤️ Save your favorite ads for later</li>
        </ul>
        <div style="text-align: center; margin: 35px 0;">
          <a href="{settings.FRONTEND_URL}" style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
            🚀 Start Exploring
          </a>
        </div>
        <p style="font-size: 13px; color: #9ca3af;">Don't forget to verify your email to unlock all features!</p>
    """
    return _send_html_email(to_email, "Welcome to Marketa! 🎉", _email_wrapper(content))


def send_forgot_password_email(to_email: str, token: str, user_name: str) -> bool:
    """Sends a password reset link email."""
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    content = f"""
        <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password 🔐</h2>
        <p>Hi <strong>{user_name}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="{reset_link}" style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
            🔑 Reset Password
          </a>
        </div>
        <p style="font-size: 13px; color: #6b7280;">Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4f46e5; font-size: 13px; background: #f3f4f6; padding: 10px; border-radius: 6px;">{reset_link}</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-top: 20px;">
          <p style="margin: 0; font-size: 13px; color: #991b1b;">⚠️ This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email — your password will remain unchanged.</p>
        </div>
    """
    return _send_html_email(to_email, "Reset Your Marketa Password 🔐", _email_wrapper(content))


def send_password_changed_email(to_email: str, user_name: str) -> bool:
    """Sends a confirmation email after password has been changed."""
    from datetime import datetime, timezone
    changed_at = datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p UTC')
    content = f"""
        <h2 style="color: #1f2937; margin-top: 0;">Password Changed Successfully ✅</h2>
        <p>Hi <strong>{user_name}</strong>,</p>
        <p>Your Marketa account password has been successfully changed.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #166534;">✅ Your password was updated on <strong>{changed_at}</strong>.</p>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-top: 20px;">
          <p style="margin: 0; font-size: 13px; color: #991b1b;">🚨 If you did <strong>not</strong> make this change, please reset your password immediately or contact support.</p>
        </div>
    """
    return _send_html_email(to_email, "Your Password Has Been Changed 🔒", _email_wrapper(content))


def send_delete_account_email(to_email: str, user_name: str, static_code: str) -> bool:
    """Sends a deletion confirmation code."""
    content = f"""
        <h2 style="color: #991b1b; margin-top: 0;">Account Deletion Request ⚠️</h2>
        <p>Hi <strong>{user_name}</strong>,</p>
        <p>We received a request to permanently delete your Marketa account. If you proceed, all your ads, favorites, and profile data will be removed.</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="margin-bottom: 8px; color: #7f1d1d; font-size: 14px;">To confirm your deletion, enter this code on the website:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #dc2626; background: #fff; padding: 10px; display: inline-block; border-radius: 6px; border: 1px dashed #fca5a5;">
                {static_code}
            </div>
        </div>
        <p style="font-size: 13px; color: #6b7280;">If you did not request this, please ignore this email. Your account is safe.</p>
    """
    return _send_html_email(to_email, "Marketa: Account Deletion Code ⚠️", _email_wrapper(content))
