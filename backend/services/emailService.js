const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Check if email credentials are provided for real sending
    const isProd = process.env.NODE_ENV === 'production';
    const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

    if (hasCredentials) {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      this.useFakeEmail = false;
      console.log('📧 Email service initialized for real delivery');
    } else {
      // Use fake SMTP for testing (emails won't actually send)
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
        ignoreTLS: true,
        tls: {
          rejectUnauthorized: false
        }
      });
      
      // Log to console instead of sending real emails
      this.useFakeEmail = true;
      console.log('📧 Email service in testing mode (OTP will show in console)');
    }
  }

  async sendOTP(email, otp) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'TeamSync - Your OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 TeamSync</h1>
              <p>Smart Team Discovery for Hackathons</p>
            </div>
            <div class="content">
              <h2>Your OTP Code</h2>
              <p>Hello! Use this code to sign in to TeamSync:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p><strong>Important:</strong></p>
              <ul>
                <li>This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes</li>
                <li>Don't share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
              <p>Ready to find your perfect team? 🎯</p>
            </div>
            <div class="footer">
              <p>© 2026 TeamSync - Hackathon Team Discovery Platform</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      // For testing: just log the OTP to console instead of sending email
      if (this.useFakeEmail) {
        console.log('\n📧 ===== FAKE EMAIL (Testing Mode) =====');
        console.log(`To: ${email}`);
        console.log(`Subject: TeamSync - Your OTP Code`);
        console.log(`OTP: ${otp}`);
        console.log(`Expires in: ${process.env.OTP_EXPIRY_MINUTES || 10} minutes`);
        console.log('========================================\n');
        return { success: true };
      }
      
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTeamInvite(email, teamName, inviterName, message) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `TeamSync - Team Invite from ${teamName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .invite-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Team Invite!</h1>
            </div>
            <div class="content">
              <h2>You've been invited to join a team!</h2>
              <div class="invite-box">
                <p><strong>Team:</strong> ${teamName}</p>
                <p><strong>Invited by:</strong> ${inviterName}</p>
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
              </div>
              <p>Log in to TeamSync to accept or decline this invitation.</p>
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Invitation</a>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">This invitation expires in 48 hours.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      // For testing: just log the invite to console instead of sending email
      if (this.useFakeEmail) {
        console.log('\n📧 ===== FAKE EMAIL (Testing Mode) =====');
        console.log(`To: ${email}`);
        console.log(`Subject: TeamSync - Team Invite from ${teamName}`);
        console.log(`Team: ${teamName}`);
        console.log(`Invited by: ${inviterName}`);
        if (message) console.log(`Message: ${message}`);
        console.log('========================================\n');
        return { success: true };
      }
      
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
