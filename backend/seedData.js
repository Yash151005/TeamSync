const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Participant = require('./models/Participant');
const Team = require('./models/Team');

dotenv.config();

const dummyParticipants = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@gmail.com',
    rolePreference: 'Developer',
    technicalSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'GraphQL'],
    interests: ['Web Development', 'AI', 'Open Source'],
    softSkills: ['Leadership', 'Team Coordination', 'Documentation'],
    experienceLevel: 'Advanced',
    bio: 'Full-stack developer with 5 years of experience. Passionate about building scalable web applications and mentoring junior developers.',
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    githubUrl: 'https://github.com/sarahjohnson',
    portfolioUrl: 'https://sarahjohnson.dev'
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@gmail.com',
    rolePreference: 'ML/AI',
    technicalSkills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas'],
    interests: ['Machine Learning', 'Computer Vision', 'Healthcare'],
    softSkills: ['Research', 'Documentation', 'Pitching'],
    experienceLevel: 'Expert',
    bio: 'AI researcher and engineer specializing in computer vision. Previously worked on medical imaging projects at Stanford.',
    linkedinUrl: 'https://linkedin.com/in/michaelchen',
    githubUrl: 'https://github.com/mchen',
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@gmail.com',
    rolePreference: 'Designer',
    technicalSkills: ['Figma', 'Adobe XD', 'Illustrator', 'Photoshop', 'Prototyping'],
    interests: ['UI/UX', 'Product Design', 'Accessibility'],
    softSkills: ['UI/UX Thinking', 'Team Coordination', 'Pitching'],
    experienceLevel: 'Advanced',
    bio: 'Product designer focused on creating intuitive and accessible user experiences. Love bringing ideas to life through design.',
    linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
    portfolioUrl: 'https://emilyrodriguez.design'
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@gmail.com',
    rolePreference: 'Product Manager',
    technicalSkills: ['Agile', 'Jira', 'Product Strategy', 'User Research', 'Analytics'],
    interests: ['Product Management', 'Startups', 'FinTech'],
    softSkills: ['Leadership', 'Pitching', 'Team Coordination'],
    experienceLevel: 'Advanced',
    bio: 'Product manager with experience launching multiple successful products. Skilled at bridging technical and business needs.',
    linkedinUrl: 'https://linkedin.com/in/jameswilson'
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@gmail.com',
    rolePreference: 'Developer',
    technicalSkills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'],
    interests: ['Backend Development', 'Cloud Computing', 'DevOps'],
    softSkills: ['Documentation', 'Research', 'Team Coordination'],
    experienceLevel: 'Intermediate',
    bio: 'Backend developer passionate about building robust APIs and scalable infrastructure. Always eager to learn new technologies.',
    githubUrl: 'https://github.com/priyapatel'
  },
  {
    name: 'David Kim',
    email: 'david.kim@gmail.com',
    rolePreference: 'Developer',
    technicalSkills: ['JavaScript', 'Vue.js', 'React', 'CSS', 'Tailwind'],
    interests: ['Frontend Development', 'Animation', 'Web Performance'],
    softSkills: ['UI/UX Thinking', 'Documentation'],
    experienceLevel: 'Intermediate',
    bio: 'Frontend developer who loves creating beautiful and performant web interfaces. Detail-oriented and user-focused.',
    githubUrl: 'https://github.com/davidkim',
    portfolioUrl: 'https://davidkim.io'
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@gmail.com',
    rolePreference: 'Designer',
    technicalSkills: ['Sketch', 'Figma', 'InVision', 'User Testing', 'Wireframing'],
    interests: ['Mobile Design', 'Design Systems', 'Branding'],
    softSkills: ['UI/UX Thinking', 'Pitching', 'Research'],
    experienceLevel: 'Advanced',
    bio: 'UX designer with a background in psychology. Focused on user research and creating data-driven design solutions.',
    linkedinUrl: 'https://linkedin.com/in/lisaanderson',
    portfolioUrl: 'https://lisaanderson.com'
  },
  {
    name: 'Alex Martinez',
    email: 'alex.martinez@gmail.com',
    rolePreference: 'Developer',
    technicalSkills: ['Java', 'Spring Boot', 'Kubernetes', 'Microservices', 'Redis'],
    interests: ['System Design', 'Distributed Systems', 'Gaming'],
    softSkills: ['Leadership', 'Team Coordination'],
    experienceLevel: 'Expert',
    bio: 'Senior software engineer specializing in distributed systems. Enjoy solving complex architectural challenges.',
    linkedinUrl: 'https://linkedin.com/in/alexmartinez',
    githubUrl: 'https://github.com/alexmartinez'
  },
  {
    name: 'Rachel Green',
    email: 'rachel.green@gmail.com',
    rolePreference: 'ML/AI',
    technicalSkills: ['Python', 'R', 'Data Visualization', 'Statistics', 'SQL'],
    interests: ['Data Science', 'Predictive Analytics', 'EdTech'],
    softSkills: ['Research', 'Documentation', 'Pitching'],
    experienceLevel: 'Intermediate',
    bio: 'Data scientist passionate about using machine learning to solve real-world problems. Background in education technology.',
    linkedinUrl: 'https://linkedin.com/in/rachelgreen',
    githubUrl: 'https://github.com/rachelgreen'
  },
  {
    name: 'Tom Harris',
    email: 'tom.harris@gmail.com',
    rolePreference: 'Open to Any',
    technicalSkills: ['JavaScript', 'Python', 'Git', 'REST APIs', 'Testing'],
    interests: ['Web Development', 'Mobile Apps', 'Sustainability'],
    softSkills: ['Team Coordination', 'Documentation'],
    experienceLevel: 'Beginner',
    bio: 'Computer science student eager to learn and contribute. Excited about hackathons and collaborative projects.',
    githubUrl: 'https://github.com/tomharris'
  },
  {
    name: 'Nina Sharma',
    email: 'nina.sharma@gmail.com',
    rolePreference: 'Product Manager',
    technicalSkills: ['Product Analytics', 'A/B Testing', 'Market Research', 'Roadmapping', 'SQL'],
    interests: ['SaaS', 'E-commerce', 'Growth Hacking'],
    softSkills: ['Leadership', 'Pitching', 'Research'],
    experienceLevel: 'Advanced',
    bio: 'Growth-focused product manager with experience scaling products from 0 to 1. Love data-driven decision making.',
    linkedinUrl: 'https://linkedin.com/in/ninasharma'
  },
  {
    name: 'Chris Taylor',
    email: 'chris.taylor@gmail.com',
    rolePreference: 'Developer',
    technicalSkills: ['Swift', 'iOS', 'SwiftUI', 'Firebase', 'CoreData'],
    interests: ['Mobile Development', 'iOS', 'Health Tech'],
    softSkills: ['UI/UX Thinking', 'Documentation'],
    experienceLevel: 'Intermediate',
    bio: 'iOS developer focused on creating delightful mobile experiences. Interested in health and fitness applications.',
    githubUrl: 'https://github.com/christaylor',
    portfolioUrl: 'https://christaylor.app'
  },
  {
    name: 'Jessica Lee',
    email: 'jessica.lee@gmail.com',
    rolePreference: 'Designer',
    technicalSkills: ['UI Design', 'Brand Design', 'Motion Graphics', 'After Effects', 'Cinema 4D'],
    interests: ['Animation', 'Brand Identity', 'Storytelling'],
    softSkills: ['UI/UX Thinking', 'Pitching', 'Leadership'],
    experienceLevel: 'Advanced',
    bio: 'Creative designer specializing in motion graphics and brand identity. Passionate about visual storytelling.',
    linkedinUrl: 'https://linkedin.com/in/jessicalee',
    portfolioUrl: 'https://jessicalee.studio'
  },
  {
    name: 'Robert Brown',
    email: 'robert.brown@gmail.com',
    rolePreference: 'Developer',
    technicalSkills: ['C++', 'Rust', 'WebAssembly', 'Performance Optimization', 'Embedded Systems'],
    interests: ['Systems Programming', 'Robotics', 'IoT'],
    softSkills: ['Research', 'Documentation'],
    experienceLevel: 'Expert',
    bio: 'Systems programmer with expertise in low-level programming and performance optimization. Robotics enthusiast.',
    githubUrl: 'https://github.com/robertbrown'
  },
  {
    name: 'Sophia White',
    email: 'sophia.white@gmail.com',
    rolePreference: 'ML/AI',
    technicalSkills: ['NLP', 'Transformers', 'BERT', 'spaCy', 'HuggingFace'],
    interests: ['Natural Language Processing', 'ChatBots', 'Content Generation'],
    softSkills: ['Research', 'Documentation', 'Pitching'],
    experienceLevel: 'Advanced',
    bio: 'NLP engineer working on conversational AI and content generation. Excited about large language models.',
    linkedinUrl: 'https://linkedin.com/in/sophiawhite',
    githubUrl: 'https://github.com/sophiawhite'
  }
];

const dummyTeams = [
  {
    name: 'HealthTech Innovators',
    description: 'Building an AI-powered health monitoring app that predicts potential health issues using wearable data.',
    focusArea: 'Healthcare',
    techStack: ['React Native', 'Python', 'TensorFlow', 'Firebase'],
    lookingFor: [
      { role: 'ML Engineer', skills: ['TensorFlow', 'PyTorch'], priority: 'High' },
      { role: 'Mobile Developer', skills: ['React Native', 'iOS'], priority: 'Medium' }
    ],
    maxMembers: 5,
    leaderEmail: 'sarah.johnson@gmail.com',
    memberEmails: ['michael.chen@gmail.com', 'chris.taylor@gmail.com'],
    meetingLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    name: 'EcoTrack',
    description: 'Sustainability tracking platform helping individuals and businesses reduce their carbon footprint with gamification.',
    focusArea: 'Sustainability',
    techStack: ['Vue.js', 'Node.js', 'PostgreSQL', 'D3.js'],
    lookingFor: [
      { role: 'Full-stack Developer', skills: ['Vue.js', 'Node.js'], priority: 'High' },
      { role: 'Data Visualization Expert', skills: ['D3.js', 'Chart.js'], priority: 'Medium' }
    ],
    maxMembers: 4,
    leaderEmail: 'emily.rodriguez@gmail.com',
    memberEmails: ['david.kim@gmail.com', 'tom.harris@gmail.com'],
    meetingLink: 'https://meet.google.com/eco-track-meet'
  },
  {
    name: 'FinSmart AI',
    description: 'Personal finance assistant using AI to provide smart investment recommendations and budget optimization.',
    focusArea: 'FinTech',
    techStack: ['React', 'Django', 'PostgreSQL', 'Scikit-learn'],
    lookingFor: [
      { role: 'Backend Developer', skills: ['Django', 'Python'], priority: 'High' },
      { role: 'AI Engineer', skills: ['Machine Learning', 'Python'], priority: 'High' }
    ],
    maxMembers: 5,
    leaderEmail: 'james.wilson@gmail.com',
    memberEmails: ['priya.patel@gmail.com', 'rachel.green@gmail.com'],
    meetingLink: 'https://meet.google.com/finsmart-team'
  },
  {
    name: 'EduConnect',
    description: 'Peer-to-peer learning platform connecting students globally with interactive study rooms and AI tutoring.',
    focusArea: 'EdTech',
    techStack: ['Next.js', 'Socket.io', 'MongoDB', 'WebRTC'],
    lookingFor: [
      { role: 'Frontend Developer', skills: ['Next.js', 'React'], priority: 'High' },
      { role: 'Real-time Systems Expert', skills: ['WebRTC', 'Socket.io'], priority: 'Medium' }
    ],
    maxMembers: 4,
    leaderEmail: 'lisa.anderson@gmail.com',
    memberEmails: ['rachel.green@gmail.com']
  },
  {
    name: 'GameForge Studio',
    description: 'Indie game development team creating a multiplayer puzzle game with innovative mechanics.',
    focusArea: 'Gaming',
    techStack: ['Unity', 'C#', 'Photon', 'Blender'],
    lookingFor: [
      { role: 'Game Developer', skills: ['Unity', 'C#'], priority: 'High' },
      { role: '3D Artist', skills: ['Blender', 'Maya'], priority: 'Medium' },
      { role: 'Sound Designer', skills: ['Audio Engineering'], priority: 'Low' }
    ],
    maxMembers: 6,
    leaderEmail: 'alex.martinez@gmail.com',
    memberEmails: ['robert.brown@gmail.com', 'jessica.lee@gmail.com']
  },
  {
    name: 'VoiceBot Pro',
    description: 'Building next-gen voice assistants with multilingual support and context-aware conversations.',
    focusArea: 'AI',
    techStack: ['Python', 'Transformers', 'FastAPI', 'React'],
    lookingFor: [
      { role: 'NLP Engineer', skills: ['NLP', 'Transformers'], priority: 'High' },
      { role: 'Frontend Developer', skills: ['React', 'TypeScript'], priority: 'Medium' }
    ],
    maxMembers: 4,
    leaderEmail: 'sophia.white@gmail.com',
    memberEmails: ['nina.sharma@gmail.com']
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Participant.deleteMany({});
    await Team.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create participants
    console.log('👥 Creating participants...');
    const createdParticipants = await Participant.insertMany(dummyParticipants);
    console.log(`✅ Created ${createdParticipants.length} participants`);

    // Create email to ID mapping
    const emailToId = {};
    createdParticipants.forEach(p => {
      emailToId[p.email] = p._id;
    });

    // Create teams
    console.log('🏢 Creating teams...');
    const teamsToCreate = [];

    for (const teamData of dummyTeams) {
      const leaderId = emailToId[teamData.leaderEmail];
      
      if (!leaderId) {
        console.log(`⚠️  Skipping team ${teamData.name} - leader not found`);
        continue;
      }

      const members = teamData.memberEmails
        .map(email => emailToId[email])
        .filter(id => id)
        .map(participantId => ({
          participant: participantId,
          role: 'Member',
          joinedAt: new Date()
        }));

      teamsToCreate.push({
        name: teamData.name,
        description: teamData.description,
        focusArea: teamData.focusArea,
        techStack: teamData.techStack,
        lookingFor: teamData.lookingFor,
        maxMembers: teamData.maxMembers,
        leader: leaderId,
        members: members,
        meetingLink: teamData.meetingLink,
        joinRequests: []
      });
    }

    const createdTeams = await Team.insertMany(teamsToCreate);
    console.log(`✅ Created ${createdTeams.length} teams`);

    // Update participants with their team IDs
    console.log('🔗 Linking participants to teams...');
    for (const team of createdTeams) {
      // Update leader
      await Participant.findByIdAndUpdate(team.leader, { teamId: team._id });
      
      // Update members
      for (const member of team.members) {
        await Participant.findByIdAndUpdate(member.participant, { teamId: team._id });
      }
    }
    console.log('✅ Participants linked to teams');

    // Print summary
    console.log('\n📊 Database Seeding Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Total Participants: ${createdParticipants.length}`);
    console.log(`✅ Total Teams: ${createdTeams.length}`);
    console.log('\n🏢 Teams Created:');
    createdTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (${team.members.length + 1}/${team.maxMembers} members)`);
    });
    console.log('\n👥 Sample Participants:');
    createdParticipants.slice(0, 5).forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.name} (${p.email}) - ${p.rolePreference}`);
    });
    console.log('═══════════════════════════════════════');
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('💡 You can now login with any of the email addresses above');
    console.log('🔐 Use any email to receive OTP in the console (fake SMTP)\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
seedDatabase();
