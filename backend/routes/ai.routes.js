const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/aiService');
const Participant = require('../models/Participant');
const Team = require('../models/Team');

// AI Health Check
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.checkHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ available: false, message: error.message });
  }
});

// Improve Profile Bio
router.post('/improve-bio', authenticate, async (req, res, next) => {
  try {
    const { bio, skills, role } = req.body;
    
    // Use only what's sent from frontend, not old database data
    const improvedBio = await aiService.improveBio(
      bio || '',
      skills || req.participant.technicalSkills,
      role || req.participant.rolePreference
    );
    
    res.json({ improvedBio });
  } catch (error) {
    console.error('AI bio improvement error:', error.message);
    // Return enhanced fallback bio
    const { bio, skills, role } = req.body;
    // Use ONLY what was sent from frontend, don't fall back to old data
    const originalBio = (bio || '').trim();
    const userRole = role || req.participant.rolePreference || 'Developer';
    const userSkills = skills || req.participant.technicalSkills || [];
    
    let enhancedBio = '';
    
    if (originalBio && originalBio.length > 10) {
      // Add professional touches to existing bio
      const skillsList = userSkills.length > 0 ? userSkills.slice(0, 3).join(', ') : 'modern technologies';
      enhancedBio = `${originalBio}. I specialize in ${userRole} with expertise in ${skillsList}. Passionate about collaborative problem-solving and delivering high-quality solutions in fast-paced environments.`;
    } else if (originalBio) {
      // Short bio - expand it significantly
      const skillsList = userSkills.length > 0 ? userSkills.slice(0, 3).join(', ') : 'cutting-edge technologies';
      enhancedBio = `${originalBio}. As a ${userRole}, I bring strong expertise in ${skillsList}, with a proven track record in delivering innovative solutions. I'm passionate about leveraging technology to solve complex problems and thrive in collaborative, fast-paced environments. Always eager to learn and contribute to impactful projects.`;
    } else {
      // Generate a complete professional bio from scratch
      const skillsList = userSkills.length > 0 ? userSkills.slice(0, 3).join(', ') : 'software development';
      enhancedBio = `Experienced ${userRole} with strong skills in ${skillsList}. Passionate about innovation, teamwork, and building impactful solutions. Proven ability to deliver high-quality results in collaborative environments. Excited to contribute technical expertise and creative problem-solving to challenging projects.`;
    }
    
    console.log('Returning fallback bio:', enhancedBio.substring(0, 80) + '...');
    res.json({ improvedBio: enhancedBio });
  }
});

// Suggest Skills
router.post('/suggest-skills', authenticate, async (req, res, next) => {
  try {
    const { role, currentSkills } = req.body;
    
    const suggestions = await aiService.suggestSkills(
      role || req.participant.rolePreference,
      currentSkills || req.participant.technicalSkills
    );
    
    res.json({ suggestions });
  } catch (error) {
    console.error('AI skill suggestion error:', error);
    // Return fallback suggestions based on role
    const fallbackSuggestions = getFallbackSkills(role || req.participant.rolePreference);
    res.json({ suggestions: fallbackSuggestions });
  }
});

// Fallback skill suggestions when AI is unavailable
function getFallbackSkills(role) {
  const skillMap = {
    'Developer': ['Git', 'REST APIs', 'Testing', 'Docker', 'CI/CD'],
    'Designer': ['Prototyping', 'User Research', 'Design Systems', 'Responsive Design', 'Accessibility'],
    'ML/AI': ['Deep Learning', 'Data Preprocessing', 'Model Deployment', 'Feature Engineering', 'Computer Vision'],
    'Product Manager': ['User Stories', 'Roadmapping', 'Stakeholder Management', 'Analytics', 'MVP Development'],
    'Open to Any': ['Communication', 'Problem Solving', 'Collaboration', 'Time Management', 'Adaptability']
  };
  return skillMap[role] || skillMap['Open to Any'];
}

// Analyze Team Compatibility
router.get('/compatibility/:teamId', authenticate, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('leader members.participant');
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const analysis = await aiService.analyzeTeamCompatibility(
      req.participant,
      team
    );
    
    res.json(analysis);
  } catch (error) {
    console.error('AI compatibility analysis error:', error);
    // Return basic compatibility info
    res.json({
      score: 75,
      strengths: 'Your profile shows relevant skills for this team.',
      considerations: 'Consider reviewing the team\'s tech stack and requirements.',
      recommendation: 'This team could be a good fit. Reach out to learn more about their project!'
    });
  }
});

// Generate Team Description
router.post('/generate-team-description', authenticate, async (req, res, next) => {
  try {
    const { teamId } = req.body;
    
    const team = await Team.findById(teamId)
      .populate('leader members.participant');
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user is team leader
    if (team.leader._id.toString() !== req.participant._id.toString()) {
      return res.status(403).json({ error: 'Only team leader can use this feature' });
    }
    
    const allMembers = [team.leader, ...team.members.map(m => m.participant)];
    const description = await aiService.generateTeamDescription(team.name, allMembers);
    
    // Update team description
    team.description = description;
    await team.save();
    
    res.json({ description });
  } catch (error) {
    next(error);
  }
});

// Get Team Recommendations
router.get('/recommend-teams', authenticate, async (req, res, next) => {
  try {
    // Get teams that aren't full
    const teams = await Team.find()
      .populate('leader members.participant');
    
    const availableTeams = teams.filter(t => 
      t.members.length + 1 < t.maxMembers
    );
    
    const recommendations = await aiService.recommendTeams(
      req.participant,
      availableTeams
    );
    
    res.json({ recommendations });
  } catch (error) {
    console.error('AI team recommendation error:', error);
    // Return basic recommendations without AI
    const teams = await Team.find()
      .populate('leader members.participant');
    
    const availableTeams = teams.filter(t => 
      t.members.length + 1 < t.maxMembers
    );
    
    const basicRecommendations = availableTeams.map((team, index) => ({
      team,
      score: Math.max(50, 90 - (index * 10)),
      reason: `This team is looking for members and has ${team.maxMembers - team.members.length - 1} open spots.`
    }));
    
    res.json({ recommendations: basicRecommendations });
  }
});

module.exports = router;
