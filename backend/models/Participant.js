const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Profile Information
  rolePreference: {
    type: String,
    enum: ['Developer', 'Designer', 'ML/AI', 'Product Manager', 'Open to Any'],
    default: 'Open to Any'
  },
  technicalSkills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  softSkills: [{
    type: String,
    enum: ['Pitching', 'Documentation', 'Leadership', 'UI/UX Thinking', 'Team Coordination', 'Research'],
    trim: true
  }],
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  linkedinUrl: {
    type: String,
    trim: true
  },
  githubUrl: {
    type: String,
    trim: true
  },
  portfolioUrl: {
    type: String,
    trim: true
  },
  // Availability
  availability: {
    status: {
      type: String,
      enum: ['Available', 'Not Available', 'In Team'],
      default: 'Available'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Team Information
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  // Visibility Boost
  visibilityBoost: {
    isBoost: {
      type: Boolean,
      default: false
    },
    boostReason: String,
    boostDate: Date
  },
  // Stats
  profileViews: {
    type: Number,
    default: 0
  },
  invitesReceived: {
    type: Number,
    default: 0
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  profileLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for fast searching
participantSchema.index({ technicalSkills: 1 });
participantSchema.index({ rolePreference: 1 });
participantSchema.index({ 'availability.status': 1 });
participantSchema.index({ teamId: 1 });

// Method to check if profile can be edited
participantSchema.methods.canEdit = function() {
  if (this.profileLocked) return false;
  
  const deadline = new Date(process.env.TEAM_FORMATION_DEADLINE);
  return new Date() < deadline;
};

// Static method to auto-boost solo participants
participantSchema.statics.autoBoostSoloParticipants = async function() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  
  await this.updateMany(
    {
      'availability.status': 'Available',
      teamId: null,
      createdAt: { $lt: threeDaysAgo },
      'visibilityBoost.isBoost': false
    },
    {
      $set: {
        'visibilityBoost.isBoost': true,
        'visibilityBoost.boostReason': 'Solo for 3+ days',
        'visibilityBoost.boostDate': new Date()
      }
    }
  );
};

module.exports = mongoose.model('Participant', participantSchema);
