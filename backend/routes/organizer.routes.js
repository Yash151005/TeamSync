const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const Team = require('../models/Team');
const { authenticate } = require('../middleware/auth');

// Note: In production, add organizer role check
// For MVP, any authenticated user can access (demo purposes)

// Get dashboard overview
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    // Get counts
    const totalParticipants = await Participant.countDocuments();
    const availableParticipants = await Participant.countDocuments({ 
      'availability.status': 'Available',
      teamId: null 
    });
    const totalTeams = await Team.countDocuments();

    // Get solo participants (no team for 3+ days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const soloParticipants = await Participant.find({
      'availability.status': 'Available',
      teamId: null,
      createdAt: { $lt: threeDaysAgo }
    }).select('name rolePreference technicalSkills createdAt');

    // Get skill distribution
    const skillAggregation = await Participant.aggregate([
      { $unwind: '$technicalSkills' },
      { $group: { _id: '$technicalSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Get role distribution
    const roleDistribution = await Participant.aggregate([
      { $group: { _id: '$rolePreference', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get soft skills distribution
    const softSkillsAggregation = await Participant.aggregate([
      { $unwind: '$softSkills' },
      { $group: { _id: '$softSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get experience level distribution
    const experienceDistribution = await Participant.aggregate([
      { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent teams
    const recentTeams = await Team.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('leader', 'name rolePreference')
      .populate('members.participant', 'name rolePreference');

    res.json({
      overview: {
        totalParticipants,
        availableParticipants,
        participantsInTeams: totalParticipants - availableParticipants,
        totalTeams,
        soloParticipantsCount: soloParticipants.length
      },
      distributions: {
        skills: skillAggregation.map(s => ({ skill: s._id, count: s.count })),
        roles: roleDistribution.map(r => ({ role: r._id, count: r.count })),
        softSkills: softSkillsAggregation.map(s => ({ skill: s._id, count: s.count })),
        experience: experienceDistribution.map(e => ({ level: e._id, count: e.count }))
      },
      alerts: {
        soloParticipants: soloParticipants.map(p => ({
          id: p._id,
          name: p.name,
          role: p.rolePreference,
          skills: p.technicalSkills,
          daysSolo: Math.floor((Date.now() - p.createdAt) / (1000 * 60 * 60 * 24))
        }))
      },
      recentTeams: recentTeams.map(t => ({
        id: t._id,
        name: t.name,
        memberCount: t.members.length + 1,
        balanceScore: t.balanceScore,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get unassigned participants
router.get('/unassigned', authenticate, async (req, res, next) => {
  try {
    const unassigned = await Participant.find({
      teamId: null,
      'availability.status': { $ne: 'Not Available' }
    })
    .select('name rolePreference technicalSkills softSkills experienceLevel createdAt visibilityBoost')
    .sort({ 'visibilityBoost.isBoost': -1, createdAt: 1 });

    res.json({
      unassigned: unassigned.map(p => ({
        id: p._id,
        name: p.name,
        role: p.rolePreference,
        skills: p.technicalSkills,
        softSkills: p.softSkills,
        experience: p.experienceLevel,
        daysSolo: Math.floor((Date.now() - p.createdAt) / (1000 * 60 * 60 * 24)),
        boosted: p.visibilityBoost.isBoost
      })),
      total: unassigned.length
    });
  } catch (error) {
    next(error);
  }
});

// Get skill shortages (roles/skills that are underrepresented)
router.get('/skill-distribution', authenticate, async (req, res, next) => {
  try {
    // Get all participants
    const totalParticipants = await Participant.countDocuments();

    // Role distribution
    const roleDistribution = await Participant.aggregate([
      { $group: { _id: '$rolePreference', count: { $sum: 1 } } },
      { $project: { role: '$_id', count: 1, percentage: { $multiply: [{ $divide: ['$count', totalParticipants] }, 100] } } },
      { $sort: { count: -1 } }
    ]);

    // Skill heatmap (top 30 skills)
    const skillHeatmap = await Participant.aggregate([
      { $unwind: '$technicalSkills' },
      { $group: { _id: '$technicalSkills', count: { $sum: 1 } } },
      { $project: { skill: '$_id', count: 1, percentage: { $multiply: [{ $divide: ['$count', totalParticipants] }, 100] } } },
      { $sort: { count: -1 } },
      { $limit: 30 }
    ]);

    // Identify shortages (roles < 15% of total)
    const shortages = roleDistribution.filter(r => r.percentage < 15);

    res.json({
      roleDistribution: roleDistribution.map(r => ({
        role: r.role,
        count: r.count,
        percentage: Math.round(r.percentage * 10) / 10
      })),
      skillHeatmap: skillHeatmap.map(s => ({
        skill: s.skill,
        count: s.count,
        percentage: Math.round(s.percentage * 10) / 10
      })),
      shortages: shortages.map(s => ({
        role: s.role,
        count: s.count,
        percentage: Math.round(s.percentage * 10) / 10
      })),
      totalParticipants
    });
  } catch (error) {
    next(error);
  }
});

// Get team analytics
router.get('/team-analytics', authenticate, async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate('leader', 'name rolePreference')
      .populate('members.participant', 'name rolePreference technicalSkills');

    const analytics = teams.map(team => {
      const allMembers = [team.leader, ...team.members.map(m => m.participant)];
      
      return {
        id: team._id,
        name: team.name,
        memberCount: allMembers.length,
        maxMembers: team.maxMembers,
        isFull: team.isFull(),
        balanceScore: team.balanceScore,
        balanceBreakdown: team.balanceBreakdown,
        roles: allMembers.map(m => m.rolePreference),
        totalSkills: new Set(allMembers.flatMap(m => m.technicalSkills)).size,
        createdAt: team.createdAt
      };
    });

    // Calculate averages
    const avgBalanceScore = analytics.reduce((sum, t) => sum + t.balanceScore, 0) / analytics.length || 0;
    const avgTeamSize = analytics.reduce((sum, t) => sum + t.memberCount, 0) / analytics.length || 0;

    res.json({
      teams: analytics,
      summary: {
        totalTeams: teams.length,
        averageBalanceScore: Math.round(avgBalanceScore),
        averageTeamSize: Math.round(avgTeamSize * 10) / 10,
        fullTeams: analytics.filter(t => t.isFull).length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
