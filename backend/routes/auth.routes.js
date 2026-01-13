const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const { otpLimiter, loginLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Send OTP
router.post('/send-otp',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email } = req.body;

      // Create OTP
      const otp = await otpService.createOTP(email);

      // Send email
      const emailResult = await emailService.sendOTP(email, otp);

      if (!emailResult.success) {
        return res.status(500).json({ error: 'Failed to send OTP email' });
      }

      res.json({ 
        message: 'OTP sent successfully',
        email,
        expiresIn: `${process.env.OTP_EXPIRY_MINUTES || 10} minutes`
      });
    } catch (error) {
      next(error);
    }
  }
);

// Verify OTP and create session
router.post('/verify-otp',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      // Verify OTP
      const verifyResult = await otpService.verifyOTP(email, otp);

      if (!verifyResult.success) {
        return res.status(400).json({ 
          error: verifyResult.error,
          attemptsLeft: verifyResult.attemptsLeft
        });
      }

      // Create session
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;
      const { participant, session } = await otpService.createSession(
        email, 
        verifyResult.sessionToken,
        userAgent,
        ipAddress
      );

      // Set secure cookie
      res.cookie('sessionToken', verifyResult.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        message: 'Login successful',
        participant: {
          _id: participant._id,
          id: participant._id,
          email: participant.email,
          name: participant.name,
          rolePreference: participant.rolePreference,
          technicalSkills: participant.technicalSkills,
          softSkills: participant.softSkills,
          interests: participant.interests,
          experienceLevel: participant.experienceLevel,
          bio: participant.bio,
          linkedinUrl: participant.linkedinUrl,
          githubUrl: participant.githubUrl,
          portfolioUrl: participant.portfolioUrl,
          availability: participant.availability,
          teamId: participant.teamId,
          profileViews: participant.profileViews,
          invitesReceived: participant.invitesReceived,
          hasCompletedProfile: participant.name !== email.split('@')[0]
        },
        sessionToken: verifyResult.sessionToken
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({
    participant: {
      _id: req.participant._id,
      id: req.participant._id,
      email: req.participant.email,
      name: req.participant.name,
      rolePreference: req.participant.rolePreference,
      technicalSkills: req.participant.technicalSkills,
      softSkills: req.participant.softSkills,
      interests: req.participant.interests,
      experienceLevel: req.participant.experienceLevel,
      bio: req.participant.bio,
      linkedinUrl: req.participant.linkedinUrl,
      githubUrl: req.participant.githubUrl,
      portfolioUrl: req.participant.portfolioUrl,
      availability: req.participant.availability,
      teamId: req.participant.teamId,
      profileViews: req.participant.profileViews,
      invitesReceived: req.participant.invitesReceived
    }
  });
});

// Logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await otpService.deleteSession(req.sessionToken);
    
    res.clearCookie('sessionToken');
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
