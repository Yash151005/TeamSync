const otpService = require('../services/otpService');

// Middleware to check if user is authenticated
const authenticate = async (req, res, next) => {
  try {
    // Get session token from cookie or header
    const sessionToken = req.cookies.sessionToken || req.headers['x-session-token'];

    if (!sessionToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate session
    const result = await otpService.validateSession(sessionToken);

    if (!result.valid) {
      return res.status(401).json({ error: result.error });
    }

    // Attach participant to request
    req.participant = result.participant;
    req.sessionToken = sessionToken;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user is team leader
const isTeamLeader = async (req, res, next) => {
  try {
    const Team = require('../models/Team');
    const teamId = req.params.id || req.params.teamId;
    
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.leader.toString() !== req.participant._id.toString()) {
      return res.status(403).json({ error: 'Only team leader can perform this action' });
    }

    req.team = team;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

// Middleware to check if profile can be edited
const canEditProfile = (req, res, next) => {
  if (req.participant.profileLocked) {
    return res.status(403).json({ 
      error: 'Profile editing is locked',
      reason: 'Team formation deadline has passed'
    });
  }

  const deadline = new Date(process.env.TEAM_FORMATION_DEADLINE);
  if (new Date() > deadline) {
    return res.status(403).json({ 
      error: 'Profile editing is locked',
      reason: 'Team formation deadline has passed'
    });
  }

  next();
};

module.exports = {
  authenticate,
  isTeamLeader,
  canEditProfile
};
