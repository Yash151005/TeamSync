const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Check if email credentials are provided for real sending
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
      // DON'T create a transporter for fake emails - just log to console
      this.transporter = null;
      this.useFakeEmail = true;
      console.log('📧 Email service in testing mode (OTP will show in console only)');
      console.log('⚠️  No EMAIL_USER or EMAIL_PASSWORD found - emails will be logged only');
    }
  }

  async sendOTP(email, otp) {
    // For testing: just log the OTP to console instead of sending email
    if (this.useFakeEmail) {
      console.log('\n📧 ===== FAKE EMAIL (Testing Mode) =====');
      console.log(`To: ${email}`);
      console.log(`Subject: TeamSync - Your OTP Code`);
      console.log(`OTP: ${otp}`);
      console.log(`Expires in: ${process.env.OTP_EXPIRY_MINUTES || 10} minutes`);
      console.log('========================================\n');
      return { success: true, message: 'OTP logged to console (testing mode)' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'TeamSync - Your OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1a202c;
              background: #f7fafc;
              padding: 20px;
            }
            .email-wrapper { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 48px 40px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
              background-size: 30px 30px;
              animation: drift 20s linear infinite;
            }
            @keyframes drift {
              from { transform: translate(0, 0); }
              to { transform: translate(30px, 30px); }
            }
            .logo-container {
              position: relative;
              z-index: 1;
            }
            .logo {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 80px;
              height: 80px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 20px;
              backdrop-filter: blur(10px);
              margin-bottom: 16px;
              font-size: 40px;
            }
            .header h1 { 
              color: white; 
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
            }
            .header p { 
              color: rgba(255, 255, 255, 0.9);
              font-size: 16px;
              position: relative;
              z-index: 1;
            }
            .content { 
              padding: 48px 40px;
            }
            .content h2 {
              color: #2d3748;
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 16px;
            }
            .content p {
              color: #4a5568;
              font-size: 16px;
              margin-bottom: 24px;
            }
            .otp-container {
              background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 32px;
              text-align: center;
              margin: 32px 0;
              position: relative;
              overflow: hidden;
            }
            .otp-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            }
            .otp-label {
              color: #718096;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
            }
            .otp-code { 
              font-size: 48px;
              font-weight: 800;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              letter-spacing: 12px;
              font-family: 'Courier New', monospace;
            }
            .info-box {
              background: #fff5f5;
              border-left: 4px solid #fc8181;
              padding: 20px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .info-box strong {
              color: #c53030;
              display: block;
              margin-bottom: 12px;
              font-size: 14px;
            }
            .info-box ul {
              list-style: none;
              padding: 0;
            }
            .info-box li {
              color: #742a2a;
              padding: 8px 0;
              padding-left: 28px;
              position: relative;
              font-size: 14px;
            }
            .info-box li::before {
              content: '✓';
              position: absolute;
              left: 0;
              color: #fc8181;
              font-weight: bold;
            }
            .cta-text {
              color: #667eea;
              font-weight: 600;
              font-size: 18px;
              text-align: center;
              margin-top: 32px;
            }
            .footer { 
              background: #f7fafc;
              padding: 32px 40px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer p {
              color: #718096;
              font-size: 13px;
              margin: 8px 0;
            }
            .footer .copyright {
              font-weight: 600;
              color: #4a5568;
            }
            @media only screen and (max-width: 600px) {
              .content, .header, .footer { 
                padding: 32px 24px; 
              }
              .otp-code { 
                font-size: 36px; 
                letter-spacing: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="logo-container">
                <div class="logo">🚀</div>
                <h1>TeamSync</h1>
                <p>Smart Team Discovery for Hackathons</p>
              </div>
            </div>
            <div class="content">
              <h2>Your Verification Code</h2>
              <p>Hello! We've received a request to sign in to your TeamSync account. Use the verification code below to complete your sign-in:</p>
              
              <div class="otp-container">
                <div class="otp-label">Your OTP Code</div>
                <div class="otp-code">${otp}</div>
              </div>

              <div class="info-box">
                <strong>⚠️ Important Security Information</strong>
                <ul>
                  <li>This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes</li>
                  <li>Never share this code with anyone, including TeamSync staff</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>

              <p class="cta-text">Ready to find your perfect team? 🎯</p>
            </div>
            <div class="footer">
              <p class="copyright">© 2026 TeamSync - Hackathon Team Discovery Platform</p>
              <p>This is an automated email, please do not reply.</p>
              <p style="margin-top: 16px; font-size: 11px;">Having trouble? Contact us at support@teamsync.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTeamInvite(email, teamName, inviterName, message) {
    // For testing: just log the invite to console instead of sending email
    if (this.useFakeEmail) {
      console.log('\n📧 ===== FAKE EMAIL (Testing Mode) =====');
      console.log(`To: ${email}`);
      console.log(`Subject: TeamSync - Team Invite from ${teamName}`);
      console.log(`Team: ${teamName}`);
      console.log(`Invited by: ${inviterName}`);
      if (message) console.log(`Message: ${message}`);
      console.log('========================================\n');
      return { success: true, message: 'Invite logged to console (testing mode)' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `TeamSync - Team Invite from ${teamName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1a202c;
              background: #f7fafc;
              padding: 20px;
            }
            .email-wrapper { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 48px 40px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
              background-size: 30px 30px;
              animation: drift 20s linear infinite;
            }
            @keyframes drift {
              from { transform: translate(0, 0); }
              to { transform: translate(30px, 30px); }
            }
            .celebration {
              font-size: 64px;
              margin-bottom: 16px;
              position: relative;
              z-index: 1;
              animation: bounce 1s ease-in-out;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            .header h1 { 
              color: white; 
              font-size: 32px;
              font-weight: 700;
              position: relative;
              z-index: 1;
            }
            .content { 
              padding: 48px 40px;
            }
            .content h2 {
              color: #2d3748;
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 16px;
            }
            .content > p {
              color: #4a5568;
              font-size: 16px;
              margin-bottom: 24px;
            }
            .invite-card {
              background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 32px;
              margin: 32px 0;
              position: relative;
              overflow: hidden;
            }
            .invite-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              bottom: 0;
              width: 4px;
              background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
            }
            .invite-detail {
              margin: 16px 0;
              padding: 12px 0;
            }
            .invite-detail strong {
              color: #667eea;
              display: block;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 6px;
              font-weight: 700;
            }
            .invite-detail .value {
              color: #2d3748;
              font-size: 18px;
              font-weight: 600;
            }
            .message-box {
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin-top: 16px;
              color: #4a5568;
              font-style: italic;
              line-height: 1.8;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button { 
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              padding: 16px 48px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.4);
              transition: all 0.3s ease;
            }
            .button:hover {
              box-shadow: 0 20px 25px -5px rgba(102, 126, 234, 0.4);
              transform: translateY(-2px);
            }
            .expiry-notice {
              background: #fffaf0;
              border: 1px solid #feb2b2;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
              color: #c05621;
              font-size: 14px;
              margin-top: 24px;
            }
            .expiry-notice strong {
              display: block;
              margin-bottom: 4px;
            }
            .footer { 
              background: #f7fafc;
              padding: 32px 40px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer p {
              color: #718096;
              font-size: 13px;
              margin: 8px 0;
            }
            .footer .copyright {
              font-weight: 600;
              color: #4a5568;
            }
            @media only screen and (max-width: 600px) {
              .content, .header, .footer { 
                padding: 32px 24px; 
              }
              .button {
                padding: 14px 32px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="celebration">🎉</div>
              <h1>You're Invited!</h1>
            </div>
            <div class="content">
              <h2>Join an Awesome Team</h2>
              <p>Great news! You've been invited to join a team on TeamSync. Here are the details:</p>
              
              <div class="invite-card">
                <div class="invite-detail">
                  <strong>Team Name</strong>
                  <div class="value">${teamName}</div>
                </div>
                <div class="invite-detail">
                  <strong>Invited By</strong>
                  <div class="value">${inviterName}</div>
                </div>
                ${message ? `
                <div class="invite-detail">
                  <strong>Personal Message</strong>
                  <div class="message-box">"${message}"</div>
                </div>
                ` : ''}
              </div>

              <p>This team is excited to work with you! Log in to TeamSync to accept or decline this invitation.</p>

              <div class="button-container">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Invitation →</a>
              </div>

              <div class="expiry-notice">
                <strong>⏰ Time Sensitive</strong>
                This invitation expires in 48 hours
              </div>
            </div>
            <div class="footer">
              <p class="copyright">© 2026 TeamSync - Hackathon Team Discovery Platform</p>
              <p>This is an automated email, please do not reply.</p>
              <p style="margin-top: 16px; font-size: 11px;">Having trouble? Contact us at support@teamsync.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();