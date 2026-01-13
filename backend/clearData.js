const mongoose = require('mongoose');
const Participant = require('./models/Participant');
const Team = require('./models/Team');
const Session = require('./models/Session');

const clearAllData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teamsync');
    
    console.log('Connected to database...');
    
    // Delete all data
    const participantsDeleted = await Participant.deleteMany({});
    const teamsDeleted = await Team.deleteMany({});
    const sessionsDeleted = await Session.deleteMany({});
    
    console.log('\n✅ All data cleared successfully!');
    console.log(`- Participants deleted: ${participantsDeleted.deletedCount}`);
    console.log(`- Teams deleted: ${teamsDeleted.deletedCount}`);
    console.log(`- Sessions deleted: ${sessionsDeleted.deletedCount}`);
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearAllData();
