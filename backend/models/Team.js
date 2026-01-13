const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },
  members: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant'
    },
    role: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Team Stats
  balanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  balanceBreakdown: {
    roleDiversity: Number,
    skillSpread: Number,
    softSkillCoverage: Number
  },
  // Requirements
  lookingFor: [{
    role: String,
    skills: [String],
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    }
  }],
  maxMembers: {
    type: Number,
    default: 4,
    min: 2,
    max: 6
  },
  // Invites
  pendingInvites: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant'
    },
    role: String,
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'Expired'],
      default: 'Pending'
    }
  }],
  // Join Requests
  joinRequests: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant'
    },
    message: String,
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  }],
  // Team Card Data
  teamCard: {
    generated: {
      type: Boolean,
      default: false
    },
    lastGenerated: Date,
    summary: String
  },
  // Google Meet Integration
  meetingLink: {
    type: String,
    trim: true
  },
  // Status
  isComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for queries
teamSchema.index({ leader: 1 });
teamSchema.index({ 'members.participant': 1 });

// Method to calculate balance score
teamSchema.methods.calculateBalanceScore = async function() {
  await this.populate('members.participant leader');
  
  const allMembers = [this.leader, ...this.members.map(m => m.participant)];
  
  // 1. Role Diversity (0-35 points)
  const roles = new Set(allMembers.map(m => m.rolePreference));
  const roleDiversity = Math.min((roles.size / 4) * 35, 35);
  
  // 2. Skill Spread (0-40 points)
  const allSkills = new Set();
  allMembers.forEach(m => m.technicalSkills.forEach(s => allSkills.add(s)));
  const skillSpread = Math.min((allSkills.size / 10) * 40, 40);
  
  // 3. Soft Skill Coverage (0-25 points)
  const softSkills = new Set();
  allMembers.forEach(m => m.softSkills.forEach(s => softSkills.add(s)));
  const softSkillCoverage = Math.min((softSkills.size / 6) * 25, 25);
  
  const totalScore = Math.round(roleDiversity + skillSpread + softSkillCoverage);
  
  this.balanceScore = totalScore;
  this.balanceBreakdown = {
    roleDiversity: Math.round(roleDiversity),
    skillSpread: Math.round(skillSpread),
    softSkillCoverage: Math.round(softSkillCoverage)
  };
  
  return totalScore;
};

// Method to check if team is full
teamSchema.methods.isFull = function() {
  return this.members.length + 1 >= this.maxMembers; // +1 for leader
};

// Static method to expire old invites
teamSchema.statics.expireOldInvites = async function() {
  await this.updateMany(
    {
      'pendingInvites.expiresAt': { $lt: new Date() },
      'pendingInvites.status': 'Pending'
    },
    {
      $set: {
        'pendingInvites.$[elem].status': 'Expired'
      }
    },
    {
      arrayFilters: [{ 'elem.status': 'Pending', 'elem.expiresAt': { $lt: new Date() } }]
    }
  );
};

module.exports = mongoose.model('Team', teamSchema);
