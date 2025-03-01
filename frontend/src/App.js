import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPassword, setSenderPassword] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null); // Renamed from pdfFile to attachmentFile
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to send to the backend
    const data = {
      sender_email: senderEmail,
      sender_password: senderPassword, // Send the password directly
      recipient_emails: recipientEmails.split(',').map(email => email.trim()),
      subject,
      body,
    };

    // If an attachment is selected, convert it to base64 and add it to the data
    if (attachmentFile) {
      const reader = new FileReader();
      reader.readAsDataURL(attachmentFile);
      reader.onload = () => {
        const fileBase64 = reader.result.split(',')[1]; // Remove the data URL prefix
        data.attachment_file_base64 = fileBase64;
        data.attachment_file_name = attachmentFile.name;

        sendDataToBackend(data);
      };
    } else {
      sendDataToBackend(data);
    }
  };

  const sendDataToBackend = async (data) => {
    try {
      // Send the data to the backend
      const response = await fetch('https://newemail.onrender.com/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
      } else {
        setMessage(result.error);
      }
    } catch (error) {
      setMessage('Failed to send emails.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h1 className="card-title text-center">Send Email</h1>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Sender Email Field */}
                <div className="mb-3">
                  <label htmlFor="senderEmail" className="form-label">
                    Sender Email:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="senderEmail"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Sender Password Field */}
                <div className="mb-3">
                  <label htmlFor="senderPassword" className="form-label">
                    App Password:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="senderPassword"
                    value={senderPassword}
                    onChange={(e) => setSenderPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Recipient Emails Field */}
                <div className="mb-3">
                  <label htmlFor="recipientEmails" className="form-label">
                    Recipient Emails (comma-separated):
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="recipientEmails"
                    value={recipientEmails}
                    onChange={(e) => setRecipientEmails(e.target.value)}
                    required
                  />
                </div>

                {/* Subject Field */}
                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">
                    Subject:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                {/* Body Field */}
                <div className="mb-3">
                  <label htmlFor="body" className="form-label">
                    Body:
                  </label>
                  <textarea
                    className="form-control"
                    id="body"
                    rows="5"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  />
                </div>

                {/* Attachment File Field */}
                <div className="mb-3">
                  <label htmlFor="attachmentFile" className="form-label">
                    Attach File (optional):
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="attachmentFile"
                    onChange={(e) => setAttachmentFile(e.target.files[0])}
                  />
                </div>

                {/* Submit Button */}
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Send Email
                  </button>
                </div>
              </form>

              {/* Display Message */}
              {message && (
                <div className="mt-3 alert alert-info">
                  {message}
                </div>
              )}
              <div>
              <p>Contact me at: <a href="mailto:avanish121299@gmail.com">avanish121299@gmail.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;