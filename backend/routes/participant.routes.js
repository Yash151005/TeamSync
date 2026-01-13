const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Participant = require('../models/Participant');
const Team = require('../models/Team');
const { authenticate, canEditProfile } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all participants (discovery)
router.get('/', authenticate, apiLimiter, async (req, res, next) => {
  try {
    const {
      search,
      rolePreference,
      technicalSkills,
      softSkills,
      experienceLevel,
      availability
    } = req.query;

    let query = {};

    // Only show available participants by default, unless 'all' is specified
    if (availability === 'all') {
      // Show all participants regardless of status
    } else if (availability) {
      query['availability.status'] = availability;
    } else {
      // Default: show Available and Not Available, but not "In Team"
      query['availability.status'] = { $in: ['Available', 'Not Available'] };
    }

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (rolePreference) {
      query.rolePreference = rolePreference;
    }

    if (technicalSkills) {
      const skillsArray = technicalSkills.split(',');
      query.technicalSkills = { $in: skillsArray };
    }

    if (softSkills) {
      const softSkillsArray = softSkills.split(',');
      query.softSkills = { $in: softSkillsArray };
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Execute query with sorting
    let participants = await Participant.find(query)
      .select('-email') // Hide email for privacy
      .sort({ 
        'visibilityBoost.isBoost': -1, // Boosted first
        createdAt: -1 
      })
      .limit(50);

    res.json({ participants, total: participants.length });
  } catch (error) {
    next(error);
  }
});

// Get participant by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const participant = await Participant.findById(req.params.id)
      .select('-email')
      .populate('teamId', 'name members');

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Increment profile views
    participant.profileViews += 1;
    await participant.save();

    res.json({ participant });
  } catch (error) {
    next(error);
  }
});

// Create/Update participant profile
router.put('/profile',
  authenticate,
  canEditProfile,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('rolePreference').isIn(['Developer', 'Designer', 'ML/AI', 'Product Manager', 'Open to Any']),
    body('technicalSkills').isArray().withMessage('Technical skills must be an array'),
    body('experienceLevel').isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        name,
        rolePreference,
        technicalSkills,
        interests,
        softSkills,
        experienceLevel,
        bio,
        linkedinUrl,
        githubUrl,
        portfolioUrl
      } = req.body;

      const participant = await Participant.findByIdAndUpdate(
        req.participant._id,
        {
          name,
          rolePreference,
          technicalSkills,
          interests: interests || [],
          softSkills: softSkills || [],
          experienceLevel,
          bio,
          linkedinUrl,
          githubUrl,
          portfolioUrl,
          lastActive: new Date()
        },
        { new: true, runValidators: true }
      );

      res.json({ 
        message: 'Profile updated successfully',
        participant 
      });
    } catch (error) {
      next(error);
    }
  }
);

// Toggle availability status
router.patch('/availability', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Available', 'Not Available'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const participant = await Participant.findByIdAndUpdate(
      req.participant._id,
      {
        'availability.status': status,
        'availability.lastUpdated': new Date()
      },
      { new: true }
    );

    res.json({ 
      message: 'Availability updated',
      availability: participant.availability 
    });
  } catch (error) {
    next(error);
  }
});

// Get skill gap analysis between participant and team
router.get('/:id/skill-gap/:teamId', authenticate, async (req, res, next) => {
  try {
    const participant = await Participant.findById(req.params.id);
    const team = await Team.findById(req.params.teamId)
      .populate('leader')
      .populate('members.participant');

    if (!participant || !team) {
      return res.status(404).json({ error: 'Participant or team not found' });
    }

    // Get all team member skills
    const teamMembers = [team.leader, ...team.members.map(m => m.participant)];
    const teamSkills = new Set();
    const teamRoles = new Set();
    const teamSoftSkills = new Set();

    teamMembers.forEach(member => {
      member.technicalSkills.forEach(skill => teamSkills.add(skill));
      teamRoles.add(member.rolePreference);
      member.softSkills.forEach(skill => teamSoftSkills.add(skill));
    });

    // Analyze participant skills
    const participantSkills = new Set(participant.technicalSkills);
    const participantSoftSkills = new Set(participant.softSkills);

    const matchingSkills = [...participantSkills].filter(skill => teamSkills.has(skill));
    const newSkills = [...participantSkills].filter(skill => !teamSkills.has(skill));
    const matchingSoftSkills = [...participantSoftSkills].filter(skill => teamSoftSkills.has(skill));
    const newSoftSkills = [...participantSoftSkills].filter(skill => !teamSoftSkills.has(skill));

    const roleMatch = teamRoles.has(participant.rolePreference);

    // Calculate compatibility score
    const compatibilityScore = Math.round(
      (newSkills.length * 10) + // New skills are valuable
      (matchingSkills.length * 5) + // Some overlap is good
      (newSoftSkills.length * 8) +
      (roleMatch ? 0 : 15) // Role diversity bonus
    );

    res.json({
      compatibility: {
        score: Math.min(compatibilityScore, 100),
        matchingSkills,
        newSkills,
        matchingSoftSkills,
        newSoftSkills,
        roleMatch,
        recommendation: compatibilityScore > 50 ? 'High compatibility' : compatibilityScore > 25 ? 'Good fit' : 'Some overlap'
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
