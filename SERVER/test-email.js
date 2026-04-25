import pkg from 'nodemailer';
const { createTransport } = pkg;
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const testEmail = async () => {
  try {
    console.log('📧 Testing email configuration...\n');
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('SendGrid Enabled:', Boolean(process.env.SENDGRID_API_KEY));

    console.log('\n📨 Sending test email...');

    if (process.env.SENDGRID_API_KEY) {
      const [response] = await sgMail.send({
        to: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM,
        subject: '✅ Test Email - File Sharing App',
        html: `
          <h1>Email Configuration Test</h1>
          <p>If you received this email, your SendGrid configuration is working correctly!</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        `,
      });

      console.log('✅ Email sent successfully via SendGrid!');
      console.log('Status Code:', response.statusCode);
    } else {
      console.log('🔌 Creating SMTP transporter...');

      const transporter = createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      console.log('✅ Transporter created');

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_USER,
        subject: '✅ Test Email - File Sharing App',
        html: `
          <h1>Email Configuration Test</h1>
          <p>If you received this email, your email configuration is working correctly!</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        `,
      });

      console.log('✅ Email sent successfully via SMTP!');
      console.log('Message ID:', info.messageId);
    }

    console.log('\n🎉 Email configuration is working!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Email test failed!');
    console.error('Error:', error.message);
    console.error('\nCommon issues:');
    console.error('1. SendGrid sender not verified');
    console.error('2. Invalid SendGrid API key');
    console.error('3. `EMAIL_FROM` does not match a verified sender');
    console.error('4. SMTP fallback misconfigured (if SendGrid is disabled)');
    process.exit(1);
  }
};

testEmail();
