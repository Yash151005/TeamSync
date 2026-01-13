const Participant = require('../models/Participant');
const Team = require('../models/Team');

// Run this periodically (e.g., via cron job or scheduler)
class AutomationService {
  // Auto-boost solo participants
  static async boostSoloParticipants() {
    try {
      await Participant.autoBoostSoloParticipants();
      console.log('✅ Auto-boosted solo participants');
    } catch (error) {
      console.error('❌ Error boosting solo participants:', error);
    }
  }

  // Expire old invites
  static async expireInvites() {
    try {
      await Team.expireOldInvites();
      console.log('✅ Expired old invites');
    } catch (error) {
      console.error('❌ Error expiring invites:', error);
    }
  }

  // Lock profiles after deadline
  static async lockProfilesAfterDeadline() {
    try {
      const deadline = new Date(process.env.TEAM_FORMATION_DEADLINE);
      
      if (new Date() > deadline) {
        await Participant.updateMany(
          { profileLocked: false },
          { $set: { profileLocked: true } }
        );
        console.log('✅ Locked all profiles after deadline');
      }
    } catch (error) {
      console.error('❌ Error locking profiles:', error);
    }
  }

  // Auto-disable availability after hackathon
  static async disableAvailabilityAfterEvent() {
    try {
      const hackathonEnd = new Date(process.env.HACKATHON_END_DATE);
      
      if (new Date() > hackathonEnd) {
        await Participant.updateMany(
          { 'availability.status': 'Available' },
          { $set: { 'availability.status': 'Not Available' } }
        );
        console.log('✅ Disabled availability after hackathon end');
      }
    } catch (error) {
      console.error('❌ Error disabling availability:', error);
    }
  }

  // Run all automations
  static async runAll() {
    console.log('🤖 Running automation tasks...');
    await this.boostSoloParticipants();
    await this.expireInvites();
    await this.lockProfilesAfterDeadline();
    await this.disableAvailabilityAfterEvent();
    console.log('✅ All automation tasks completed');
  }
}

module.exports = AutomationService;

// If running this file directly
if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  dotenv.config();

  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('📊 Connected to MongoDB');
      await AutomationService.runAll();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
