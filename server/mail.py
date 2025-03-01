from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import base64
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# SMTP server configuration (Gmail)
smtp_server = os.getenv("SMTP_SERVER")  # SMTP server for Gmail
smtp_port = int(os.getenv("SMTP_PORT"))  # Port for Gmail's SMTP server

@app.route('/send-email', methods=['POST'])
def send_email():
    try:
        # Get data from the frontend
        data = request.json
        sender_email = data.get('sender_email')  # Sender email from frontend
        sender_password = data.get('sender_password')  # Password from frontend
        recipient_emails = data.get('recipient_emails', [])
        subject = data.get('subject', '')
        body = data.get('body', '')
        attachment_file_base64 = data.get('attachment_file_base64')  # Optional attachment
        attachment_file_name = data.get('attachment_file_name', 'attachment')  # Default file name

        # Validate sender email and password
        if not sender_email or not sender_password:
            return jsonify({"error": "Sender email and password are required."}), 400

        # Decode the base64 attachment file (if provided)
        attachment_file_bytes = None
        if attachment_file_base64:
            attachment_file_bytes = base64.b64decode(attachment_file_base64)

        # Send emails individually
        for recipient in recipient_emails:
            send_individual_email(sender_email, sender_password, recipient, subject, body, attachment_file_bytes, attachment_file_name)

        return jsonify({"message": "Emails sent successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Function to send email individually with optional attachment
def send_individual_email(sender_email, sender_password, recipient, subject, body, attachment_file_bytes, attachment_file_name):
    try:
        # Create the email
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = recipient  # Send to one recipient at a time
        msg["Subject"] = subject

        # Add the email body
        msg.attach(MIMEText(body, "plain"))

        # Attach the file (if provided)
        if attachment_file_bytes:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment_file_bytes)
            encoders.encode_base64(part)
            part.add_header(
                "Content-Disposition",
                f"attachment; filename= {attachment_file_name}",
            )
            msg.attach(part)  # Attach the file to the email

        # Connect to the SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Secure the connection
        server.login(sender_email, sender_password)  # Log in to the email account

        # Send the email to the recipient
        server.sendmail(sender_email, recipient, msg.as_string())
        print(f"Email sent successfully to {recipient}!")

    except Exception as e:
        print(f"Error sending email to {recipient}: {e}")

    finally:
        server.quit()  # Close the connection


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))  # Get PORT from environment, default to 5000
    app.run(host='0.0.0.0', port=port, debug=False)  # Bind to all network interfaces