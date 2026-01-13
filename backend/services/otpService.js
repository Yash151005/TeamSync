const crypto = require('crypto');
const OTP = require('../models/OTP');
const Session = require('../models/Session');
const Participant = require('../models/Participant');

class OTPService {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate secure session token
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create and store OTP
  async createOTP(email) {
    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    const otp = this.generateOTP();
    
    const otpDoc = new OTP({
      email,
      otp,
      attempts: 0
    });

    await otpDoc.save();
    return otp;
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    const otpDoc = await OTP.findOne({ email, verified: false });

    if (!otpDoc) {
      return { success: false, error: 'OTP not found or expired' };
    }

    // Check max attempts
    if (otpDoc.attempts >= parseInt(process.env.MAX_OTP_ATTEMPTS || 3)) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return { success: false, error: 'Maximum attempts exceeded' };
    }

    // Check if OTP matches
    if (otpDoc.otp !== otp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return { success: false, error: 'Invalid OTP', attemptsLeft: 3 - otpDoc.attempts };
    }

    // OTP is valid
    otpDoc.verified = true;
    const sessionToken = this.generateSessionToken();
    otpDoc.sessionToken = sessionToken;
    await otpDoc.save();

    return { success: true, sessionToken };
  }

  // Create session
  async createSession(email, sessionToken, userAgent, ipAddress) {
    // Find or create participant
    let participant = await Participant.findOne({ email });
    
    if (!participant) {
      participant = new Participant({
        email,
        name: email.split('@')[0], // Temporary name
        availability: {
          status: 'Available'
        }
      });
      await participant.save();
    }

    // Delete any existing sessions for this participant
    await Session.deleteMany({ participant: participant._id });

    // Create new session
    const session = new Session({
      sessionToken,
      participant: participant._id,
      email,
      userAgent,
      ipAddress
    });

    await session.save();

    return { participant, session };
  }

  // Validate session
  async validateSession(sessionToken) {
    const session = await Session.findOne({ sessionToken }).populate('participant');

    if (!session) {
      return { valid: false, error: 'Invalid session' };
    }

    // Update last active
    session.lastActive = new Date();
    await session.save();

    return { valid: true, participant: session.participant };
  }

  // Delete session (logout)
  async deleteSession(sessionToken) {
    await Session.deleteOne({ sessionToken });
    return { success: true };
  }

  // Clean up expired OTPs (can be called via cron job)
  async cleanupExpiredOTPs() {
    await OTP.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) } // 10 minutes
    });
  }
}

module.exports = new OTPService();
