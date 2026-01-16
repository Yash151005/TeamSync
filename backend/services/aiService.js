const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE');

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  // Generate smart team compatibility analysis
  async analyzeTeamCompatibility(participant, team) {
    try {
      const prompt = `Analyze team compatibility:

Participant Profile:
- Role: ${participant.rolePreference}
- Technical Skills: ${participant.technicalSkills.join(', ')}
- Soft Skills: ${participant.softSkills.join(', ')}
- Experience: ${participant.experienceLevel}
- Bio: ${participant.bio || 'Not provided'}

Team Profile:
- Name: ${team.name}
- Current Size: ${team.members.length + 1}/${team.maxMembers}
- Balance Score: ${team.balanceScore}/100

Provide a brief compatibility analysis (2-3 sentences) and a compatibility score (0-100).
Format: {"score": number, "analysis": "text"}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallback if parsing fails
      }
      
      return {
        score: 75,
        analysis: text.trim()
      };
    } catch (error) {
      console.error('AI compatibility analysis error:', error);
      return {
        score: 70,
        analysis: 'AI analysis temporarily unavailable. Manual review recommended.'
      };
    }
  }

  // Improve participant profile bio
  async improveBio(currentBio, skills, role) {
    try {
      const prompt = `Improve this hackathon participant profile bio. Make it engaging and professional:

Current Bio: ${currentBio || 'No bio yet'}
Role: ${role}
Skills: ${skills.join(', ')}

Generate an improved bio (max 100 words) that highlights their strengths for team formation.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('AI bio improvement error:', error);
      // Throw error so route handler can provide better fallback
      throw error;
    }
  }

  // Suggest missing skills based on role
  async suggestSkills(role, currentSkills) {
    try {
      const prompt = `For a hackathon participant with role "${role}" who has these skills: ${currentSkills.join(', ')}.

Suggest 3-5 complementary technical skills they should consider adding. Return only skill names, comma-separated.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const skills = response.text().trim().split(',').map(s => s.trim());
      return skills.slice(0, 5);
    } catch (error) {
      console.error('AI skill suggestion error:', error);
      // Throw error so route handler provides fallback
      throw error;
    }
  }

  // Generate team description
  async generateTeamDescription(teamName, members) {
    try {
      const memberSummary = members.map(m => 
        `${m.rolePreference} with ${m.technicalSkills.slice(0, 3).join(', ')}`
      ).join('; ');

      const prompt = `Generate a compelling team description for a hackathon team:

Team Name: ${teamName}
Members: ${memberSummary}

Create a brief, exciting description (2-3 sentences) that showcases the team's strengths.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('AI team description error:', error);
      return `${teamName} - A diverse team ready to innovate and build amazing solutions.`;
    }
  }

  // Smart team recommendations
  async recommendTeams(participant, availableTeams) {
    try {
      const teamsInfo = availableTeams.slice(0, 5).map(t => ({
        id: t._id,
        name: t.name,
        size: t.members.length + 1,
        maxMembers: t.maxMembers,
        balanceScore: t.balanceScore
      }));

      const prompt = `Recommend the best team for this participant:

Participant:
- Role: ${participant.rolePreference}
- Skills: ${participant.technicalSkills.join(', ')}
- Experience: ${participant.experienceLevel}

Available Teams:
${JSON.stringify(teamsInfo, null, 2)}

Rank the teams by compatibility and provide a compatibility score (0-100) and explain briefly why each matches.
Format: [{"teamId": "id", "score": number, "reason": "text"}]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallback
      }
      
      return availableTeams.slice(0, 3).map(t => ({
        teamId: t._id,
        score: 75,
        reason: 'Compatible team looking for diverse skills.'
      }));
    } catch (error) {
      console.error('AI team recommendation error:', error);
      return [];
    }
  }

  // Check if AI is available
  async checkHealth() {
    try {
      const result = await this.model.generateContent('Hello');
      return { available: true, message: 'AI service operational' };
    } catch (error) {
      return { available: false, message: error.message };
    }
  }
}

module.exports = new AIService();
