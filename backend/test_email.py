"""
Quick SMTP email test script.
Usage: python test_email.py <recipient_email>
Example: python test_email.py parthmagic123@gmail.com
"""

import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ── SMTP Config (same as .env) ──────────────────────────────────────────
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "parthmagic123@gmail.com"
SMTP_PASSWORD = "odah aeup gpjh xxla"
FROM_NAME = "QuikrClone"


def test_email(to_email: str):
    print(f"\n{'='*60}")
    print(f"📧 SMTP Email Test")
    print(f"{'='*60}")
    print(f"  From:   {FROM_NAME} <{SMTP_USER}>")
    print(f"  To:     {to_email}")
    print(f"  Server: {SMTP_HOST}:{SMTP_PORT}")
    print(f"{'='*60}\n")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "✅ QuikrClone Email Test — It Works!"
    msg["From"] = f"{FROM_NAME} <{SMTP_USER}>"
    msg["To"] = to_email

    html = """
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: #f9fafb; border-radius: 12px; padding: 30px; text-align: center;">
          <h1 style="color: #4f46e5;">✅ Email Test Successful!</h1>
          <p style="color: #374151; font-size: 16px;">
            If you're reading this, your SMTP configuration is working correctly.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            Sent from QuikrClone email test script
          </p>
        </div>
      </body>
    </html>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        print("1️⃣  Connecting to SMTP server...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.set_debuglevel(1)  # Show full SMTP conversation

        print("2️⃣  Sending EHLO...")
        server.ehlo()

        print("3️⃣  Starting TLS...")
        server.starttls()
        server.ehlo()

        print("4️⃣  Logging in...")
        server.login(SMTP_USER, SMTP_PASSWORD)

        print("5️⃣  Sending email...")
        result = server.sendmail(SMTP_USER, to_email, msg.as_string())

        print(f"\n{'='*60}")
        if result:
            print(f"⚠️  Partial failure — rejected recipients: {result}")
        else:
            print(f"✅ EMAIL SENT SUCCESSFULLY to {to_email}")
            print(f"   Check your inbox (and spam/junk folder)!")
        print(f"{'='*60}\n")

        server.quit()
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"\n❌ AUTHENTICATION FAILED: {e}")
        print("   → Check your SMTP_USER and SMTP_PASSWORD (Gmail App Password)")
        return False
    except smtplib.SMTPRecipientsRefused as e:
        print(f"\n❌ RECIPIENT REFUSED: {e}")
        print(f"   → The email address {to_email} was rejected by the server")
        return False
    except smtplib.SMTPException as e:
        print(f"\n❌ SMTP ERROR: {e}")
        return False
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_email.py <recipient_email>")
        print("Example: python test_email.py parthmagic123@gmail.com")
        sys.exit(1)

    recipient = sys.argv[1]
    test_email(recipient)
