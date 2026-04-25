import pkg from 'nodemailer';
const { createTransport } = pkg;
import validator from 'email-validator';
import sgMail from '@sendgrid/mail';

let sendGridInitialized = false;

const ensureSendGridInitialized = () => {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();

  if (apiKey && !sendGridInitialized) {
    sgMail.setApiKey(apiKey);
    sendGridInitialized = true;
  }
};

const createTransporter = () => {
  // Fallback to Gmail SMTP (for local development only)
  console.log('⚠️ Using Gmail SMTP (local development only)');
  return createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

export const validateEmails = (emails) => {
  const invalidEmails = [];
  const validEmails = [];

  emails.forEach(email => {
    const trimmedEmail = email.trim().toLowerCase();
    if (validator.validate(trimmedEmail)) {
      validEmails.push(trimmedEmail);
    } else {
      invalidEmails.push(trimmedEmail);
    }
  });

  return { validEmails, invalidEmails };
};

const getFileShareEmailTemplate = (data) => {
  const { 
    senderName, 
    senderEmail, 
    message, 
    downloadLink, 
    filenames, 
    fileSize, 
    expiryTime,
    isProtected 
  } = data;

  const formattedSize = formatBytes(fileSize);
  const expiryDate = new Date(expiryTime).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>File Shared With You</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 3px solid #4F46E5;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #4F46E5;
          margin-bottom: 10px;
        }
        .content {
          padding: 20px 0;
        }
        .sender-info {
          background: #F3F4F6;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .message-box {
          background: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .file-info {
          background: #EFF6FF;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .file-list {
          list-style: none;
          padding: 0;
        }
        .file-list li {
          padding: 5px 0;
          color: #1F2937;
        }
        .download-button {
          display: inline-block;
          background: #4F46E5;
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .download-button:hover {
          background: #4338CA;
        }
        .expiry-warning {
          background: #FEE2E2;
          border-left: 4px solid #EF4444;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
        }
        .pin-notice {
          background: #DBEAFE;
          border-left: 4px solid #3B82F6;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          color: #6B7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📦 File Sharing App</div>
          <p style="color: #6B7280; margin: 0;">Secure File Transfer</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1F2937;">📨 Someone shared a file with you!</h2>
          
          <div class="sender-info">
            <strong>From:</strong> ${senderName} (${senderEmail})
          </div>

          ${message ? `
          <div class="message-box">
            <strong>💬 Message:</strong><br/>
            ${message}
          </div>
          ` : ''}

          <div class="file-info">
            <h3 style="margin-top: 0; color: #1F2937;">📄 File Details:</h3>
            <ul class="file-list">
              ${filenames.map(name => `<li>📎 ${name}</li>`).join('')}
            </ul>
            <p style="margin: 10px 0 0 0;"><strong>Size:</strong> ${formattedSize}</p>
          </div>

          ${isProtected ? `
          <div class="pin-notice">
            <strong>🔒 This file is password protected.</strong><br/>
            You'll need a 4-digit PIN to access it. Please contact the sender if you don't have it.
          </div>
          ` : ''}

          <div style="text-align: center;">
            <a href="${downloadLink}" class="download-button">
              ⬇️ Download File
            </a>
          </div>

          <div class="expiry-warning">
            <strong>⏰ Expires:</strong> ${expiryDate}<br/>
            <small>Download before this file expires!</small>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated email from File Sharing App.</p>
          <p>If you didn't expect this email, you can safely ignore it.</p>
          <p style="margin-top: 15px; font-size: 12px;">
            © ${new Date().getFullYear()} File Sharing App. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getEmailVerificationTemplate = (data) => {
  const { name, verificationLink } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 3px solid #10B981;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #10B981;
          margin-bottom: 10px;
        }
        .content {
          padding: 20px 0;
        }
        .verify-button {
          display: inline-block;
          background: #10B981;
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
        }
        .verify-button:hover {
          background: #059669;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          color: #6B7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✉️ File Sharing App</div>
          <p style="color: #6B7280; margin: 0;">Email Verification</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1F2937;">Welcome, ${name}! 👋</h2>
          <p>Thank you for signing up for File Sharing App. To get started, please verify your email address.</p>
          
          <div style="text-align: center;">
            <a href="${verificationLink}" class="verify-button">
              ✓ Verify Email Address
            </a>
          </div>

          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${verificationLink}" style="color: #4F46E5; word-break: break-all;">${verificationLink}</a>
          </p>
        </div>

        <div class="footer">
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p style="margin-top: 15px; font-size: 12px;">
            © ${new Date().getFullYear()} File Sharing App. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const sendFileShareEmail = async (recipientEmails, fileData) => {
  try {
    console.log('\n📧 =============== FILE SHARE EMAIL ===============');
    console.log(`To: ${recipientEmails.join(', ')}`);
    console.log(`From: ${fileData.senderName} (${fileData.senderEmail})`);
    console.log(`Files: ${fileData.filenames.join(', ')}`);
    console.log(`Size: ${formatBytes(fileData.fileSize)}`);
    console.log(`Download Link: ${fileData.downloadLink}`);
    if (fileData.message) console.log(`Message: ${fileData.message}`);
    if (fileData.isProtected) console.log(`🔒 PIN Protected`);
    console.log('📧 Sending email...');

    // Use SendGrid API if available (production)
    if (process.env.SENDGRID_API_KEY?.trim()) {
      ensureSendGridInitialized();
      console.log('✅ Using SendGrid HTTP API');
      
      const msg = {
        to: recipientEmails,
        from: process.env.EMAIL_FROM,
        subject: `📦 ${fileData.senderName} shared a file with you`,
        html: getFileShareEmailTemplate(fileData),
      };

      const response = await sgMail.send(msg);
      
      console.log('✅ Email sent successfully via SendGrid!');
      console.log(`Response: ${response[0].statusCode}`);
      console.log('📧 ================================================\n');
      
      return { success: true, messageId: response[0].headers['x-message-id'] };
    }

    // Fallback to SMTP (local development)
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmails.join(', '),
      subject: `📦 ${fileData.senderName} shared a file with you`,
      html: getFileShareEmailTemplate(fileData),
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully via SMTP!');
    console.log(`Message ID: ${info.messageId}`);
    console.log('📧 ================================================\n');
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending file share email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email, name, token) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    console.log('\n📧 =============== EMAIL VERIFICATION ===============');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Verification Link: ${verificationLink}`);
    console.log('📧 Sending email...');

    // Use SendGrid API if available (production)
    if (process.env.SENDGRID_API_KEY?.trim()) {
      ensureSendGridInitialized();
      console.log('✅ Using SendGrid HTTP API');
      
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: '✉️ Verify Your Email - File Sharing App',
        html: getEmailVerificationTemplate({ name, verificationLink }),
      };

      const response = await sgMail.send(msg);
      
      console.log('✅ Verification email sent successfully via SendGrid!');
      console.log(`Response: ${response[0].statusCode}`);
      console.log('📧 ================================================\n');
      
      return { success: true, messageId: response[0].headers['x-message-id'] };
    }

    // Fallback to SMTP (local development)
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '✉️ Verify Your Email - File Sharing App',
      html: getEmailVerificationTemplate({ name, verificationLink }),
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Verification email sent successfully via SMTP!');
    console.log(`Message ID: ${info.messageId}`);
    console.log('📧 ================================================\n');
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

export default {
  validateEmails,
  sendFileShareEmail,
  sendVerificationEmail,
};
