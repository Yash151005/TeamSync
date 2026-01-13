const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Team = require('../models/Team');
const Participant = require('../models/Participant');
const { authenticate, isTeamLeader } = require('../middleware/auth');
const { apiLimiter, inviteLimiter } = require('../middleware/rateLimiter');
const emailService = require('../services/emailService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all teams
router.get('/', authenticate, apiLimiter, async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate('leader', 'name rolePreference technicalSkills')
      .populate('members.participant', 'name rolePreference technicalSkills')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ teams });
  } catch (error) {
    next(error);
  }
});

// Get team by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader')
      .populate('members.participant')
      .populate('pendingInvites.participant', 'name email rolePreference')
      .populate('joinRequests.participant', 'name email rolePreference technicalSkills softSkills linkedinUrl githubUrl portfolioUrl');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ team });
  } catch (error) {
    next(error);
  }
});

// Create team
router.post('/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Team name is required'),
    body('maxMembers').isInt({ min: 2, max: 6 }).withMessage('Max members must be between 2-6')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, description, lookingFor, maxMembers } = req.body;

      // Check if user is already in a team
      if (req.participant.teamId) {
        return res.status(400).json({ error: 'You are already in a team' });
      }

      const team = new Team({
        name,
        description,
        leader: req.participant._id,
        lookingFor: lookingFor || [],
        maxMembers: maxMembers || 4
      });

      await team.save();

      // Update participant
      await Participant.findByIdAndUpdate(req.participant._id, {
        teamId: team._id,
        'availability.status': 'In Team'
      });

      // Calculate initial balance score
      await team.calculateBalanceScore();
      await team.save();

      await team.populate('leader');

      res.status(201).json({
        message: 'Team created successfully',
        team
      });
    } catch (error) {
      next(error);
    }
  }
);

// Send team invite
router.post('/:id/invite',
  authenticate,
  isTeamLeader,
  inviteLimiter,
  [
    body('participantId').notEmpty().withMessage('Participant ID is required'),
    body('role').optional().isString(),
    body('message').optional().isString().isLength({ max: 500 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { participantId, role, message } = req.body;
      const team = req.team;

      // Check if team is full
      if (team.isFull()) {
        return res.status(400).json({ error: 'Team is already full' });
      }

      // Check if participant exists and is available
      const participant = await Participant.findById(participantId);
      if (!participant) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      if (participant.teamId) {
        return res.status(400).json({ error: 'Participant is already in a team' });
      }

      if (participant.availability.status !== 'Available') {
        return res.status(400).json({ error: 'Participant is not available' });
      }

      // Check if invite already exists
      const existingInvite = team.pendingInvites.find(
        inv => inv.participant.toString() === participantId && inv.status === 'Pending'
      );

      if (existingInvite) {
        return res.status(400).json({ error: 'Invite already sent to this participant' });
      }

      // Create invite
      const invite = {
        participant: participantId,
        role: role || participant.rolePreference,
        message: message || '',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        status: 'Pending'
      };

      team.pendingInvites.push(invite);
      await team.save();

      // Update participant stats
      participant.invitesReceived += 1;
      await participant.save();

      // Send email notification
      await emailService.sendTeamInvite(
        participant.email,
        team.name,
        req.participant.name,
        message
      );

      res.json({
        message: 'Invite sent successfully',
        invite
      });
    } catch (error) {
      next(error);
    }
  }
);

// Accept team invite
router.post('/:id/accept/:inviteId', authenticate, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if team is full
    if (team.isFull()) {
      return res.status(400).json({ error: 'Team is already full' });
    }

    // Find invite
    const invite = team.pendingInvites.id(req.params.inviteId);
    
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (invite.participant.toString() !== req.participant._id.toString()) {
      return res.status(403).json({ error: 'This invite is not for you' });
    }

    if (invite.status !== 'Pending') {
      return res.status(400).json({ error: 'Invite is no longer valid' });
    }

    if (new Date() > invite.expiresAt) {
      invite.status = 'Expired';
      await team.save();
      return res.status(400).json({ error: 'Invite has expired' });
    }

    // Check if user is already in a team
    if (req.participant.teamId) {
      return res.status(400).json({ error: 'You are already in a team' });
    }

    // Accept invite
    invite.status = 'Accepted';
    
    team.members.push({
      participant: req.participant._id,
      role: invite.role
    });

    await team.save();

    // Update participant
    await Participant.findByIdAndUpdate(req.participant._id, {
      teamId: team._id,
      'availability.status': 'In Team'
    });

    // Recalculate balance score
    await team.calculateBalanceScore();
    await team.save();

    await team.populate('leader members.participant');

    res.json({
      message: 'Invite accepted successfully',
      team
    });
  } catch (error) {
    next(error);
  }
});

// Decline team invite
router.post('/:id/decline/:inviteId', authenticate, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const invite = team.pendingInvites.id(req.params.inviteId);
    
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (invite.participant.toString() !== req.participant._id.toString()) {
      return res.status(403).json({ error: 'This invite is not for you' });
    }

    invite.status = 'Declined';
    await team.save();

    res.json({ message: 'Invite declined' });
  } catch (error) {
    next(error);
  }
});

// Get team balance score
router.get('/:id/balance-score', authenticate, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const score = await team.calculateBalanceScore();
    await team.save();

    res.json({
      balanceScore: team.balanceScore,
      breakdown: team.balanceBreakdown,
      grade: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement'
    });
  } catch (error) {
    next(error);
  }
});

// Generate team card
router.get('/:id/card', authenticate, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader')
      .populate('members.participant');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const allMembers = [team.leader, ...team.members.map(m => m.participant)];

    // Aggregate skills
    const technicalSkills = new Set();
    const softSkills = new Set();
    const roles = new Set();

    allMembers.forEach(member => {
      member.technicalSkills.forEach(skill => technicalSkills.add(skill));
      member.softSkills.forEach(skill => softSkills.add(skill));
      roles.add(member.rolePreference);
    });

    const teamCard = {
      name: team.name,
      description: team.description,
      memberCount: allMembers.length,
      leader: {
        name: team.leader.name,
        role: team.leader.rolePreference
      },
      members: allMembers.slice(1).map(m => ({
        name: m.name,
        role: m.rolePreference
      })),
      skills: {
        technical: Array.from(technicalSkills),
        soft: Array.from(softSkills),
        roles: Array.from(roles)
      },
      balanceScore: team.balanceScore,
      createdAt: team.createdAt
    };

    // Update team card in database
    team.teamCard = {
      generated: true,
      lastGenerated: new Date(),
      summary: `${team.name} - ${allMembers.length} members with ${technicalSkills.size} technical skills`
    };
    await team.save();

    res.json({ teamCard });
  } catch (error) {
    next(error);
  }
});

// Update team (leader only)
router.put('/:id',
  authenticate,
  isTeamLeader,
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().isString()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, description, lookingFor, maxMembers } = req.body;

      const updates = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (lookingFor) updates.lookingFor = lookingFor;
      if (maxMembers) updates.maxMembers = maxMembers;

      const team = await Team.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      ).populate('leader members.participant');

      res.json({
        message: 'Team updated successfully',
        team
      });
    } catch (error) {
      next(error);
    }
  }
);

// Send join request
router.post('/:id/join-request',
  authenticate,
  [
    body('message').optional().isString().isLength({ max: 500 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { message } = req.body;
      const team = await Team.findById(req.params.id);

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      // Check if team is full
      if (team.isFull()) {
        return res.status(400).json({ error: 'Team is already full' });
      }

      // Check if user is already in a team
      if (req.participant.teamId) {
        return res.status(400).json({ error: 'You are already in a team' });
      }

      // Check if user is not available
      if (req.participant.availability.status !== 'Available') {
        return res.status(400).json({ error: 'You must be available to send join requests' });
      }

      // Check if request already exists
      const existingRequest = team.joinRequests.find(
        jr => jr.participant.toString() === req.participant._id.toString() && jr.status === 'Pending'
      );

      if (existingRequest) {
        return res.status(400).json({ error: 'You have already sent a join request to this team' });
      }

      // Create join request
      const joinRequest = {
        participant: req.participant._id,
        message: message || '',
        status: 'Pending'
      };

      team.joinRequests.push(joinRequest);
      await team.save();

      res.json({
        message: 'Join request sent successfully',
        joinRequest
      });
    } catch (error) {
      next(error);
    }
  }
);

// Approve join request (leader only)
router.post('/:id/join-request/:requestId/approve',
  authenticate,
  isTeamLeader,
  async (req, res, next) => {
    try {
      const team = req.team;

      // Check if team is full
      if (team.isFull()) {
        return res.status(400).json({ error: 'Team is already full' });
      }

      // Find request
      const request = team.joinRequests.id(req.params.requestId);

      if (!request) {
        return res.status(404).json({ error: 'Join request not found' });
      }

      if (request.status !== 'Pending') {
        return res.status(400).json({ error: 'This request has already been processed' });
      }

      // Get participant
      const participant = await Participant.findById(request.participant);

      if (!participant) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      // Check if participant is still available
      if (participant.teamId) {
        request.status = 'Rejected';
        await team.save();
        return res.status(400).json({ error: 'Participant is already in a team' });
      }

      // Check if participant is already a member of this team
      const isAlreadyMember = team.members.some(
        m => m.participant.toString() === participant._id.toString()
      );
      
      if (isAlreadyMember) {
        request.status = 'Approved'; // Mark as approved since they're already in
        await team.save();
        return res.status(400).json({ error: 'Participant is already a member of this team' });
      }

      // Approve request
      request.status = 'Approved';

      team.members.push({
        participant: participant._id,
        role: participant.rolePreference
      });

      await team.save();

      // Update participant
      await Participant.findByIdAndUpdate(participant._id, {
        teamId: team._id,
        'availability.status': 'In Team'
      });

      // Recalculate balance score
      await team.calculateBalanceScore();
      await team.save();

      await team.populate('leader members.participant joinRequests.participant');

      res.json({
        message: 'Join request approved successfully',
        team
      });
    } catch (error) {
      next(error);
    }
  }
);

// Reject join request (leader only)
router.post('/:id/join-request/:requestId/reject',
  authenticate,
  isTeamLeader,
  async (req, res, next) => {
    try {
      const team = req.team;

      // Find request
      const request = team.joinRequests.id(req.params.requestId);

      if (!request) {
        return res.status(404).json({ error: 'Join request not found' });
      }

      if (request.status !== 'Pending') {
        return res.status(400).json({ error: 'This request has already been processed' });
      }

      request.status = 'Rejected';
      await team.save();

      res.json({ message: 'Join request rejected' });
    } catch (error) {
      next(error);
    }
  }
);

// Leave team
router.post('/:id/leave', authenticate, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is team leader
    if (team.leader.toString() === req.participant._id.toString()) {
      return res.status(400).json({ 
        error: 'Team leader cannot leave. Transfer leadership or delete the team.'
      });
    }

    // Remove member
    team.members = team.members.filter(
      m => m.participant.toString() !== req.participant._id.toString()
    );

    await team.save();

    // Update participant
    await Participant.findByIdAndUpdate(req.participant._id, {
      teamId: null,
      'availability.status': 'Available'
    });

    // Recalculate balance score
    await team.calculateBalanceScore();
    await team.save();

    res.json({ message: 'Left team successfully' });
  } catch (error) {
    next(error);
  }
});

// Update team meeting link (leader only)
router.patch('/:id/meeting-link',
  authenticate,
  isTeamLeader,
  async (req, res, next) => {
    try {
      const { meetingLink } = req.body;
      
      const team = await Team.findByIdAndUpdate(
        req.params.id,
        { meetingLink },
        { new: true }
      );

      res.json({ 
        message: 'Meeting link updated successfully',
        meetingLink: team.meetingLink
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
