# TeamSync - Google AI Integration Guide

## 🤖 AI-Powered Features

TeamSync now includes intelligent AI features powered by Google's Gemini Pro model to enhance team formation and profile optimization.

### Features

1. **AI Bio Enhancement** ✨
   - Automatically improve your profile bio
   - Get professional, compelling descriptions
   - Access via Profile page "Enhance with AI" button

2. **Smart Skill Suggestions** 🎯
   - Get personalized skill recommendations based on your role
   - Discover complementary skills to add to your profile
   - Access via Profile page "AI Suggest" button

3. **Team Compatibility Analysis** 📊
   - Deep analysis of how well you match with teams
   - See strengths, considerations, and recommendations
   - Score-based compatibility matching (0-100%)

4. **AI-Powered Team Recommendations** 🚀
   - Personalized team suggestions based on your profile
   - Ranked by compatibility score
   - Detailed reasoning for each recommendation
   - Access via "AI Match" in navigation

5. **Auto-Generate Team Descriptions** 📝
   - Team leaders can generate compelling team descriptions
   - Based on team name and member profiles

## Setup Instructions

### 1. Get Your Google AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables

Add your API key to `backend/.env`:

```env
GEMINI_API_KEY=your-actual-api-key-here
```

⚠️ **Important**: Replace `your-actual-api-key-here` with your real API key from Google AI Studio.

### 3. Start the Application

```bash
# Backend
cd backend
npm start

# Frontend (in another terminal)
cd frontend
npm run dev
```

## API Endpoints

### AI Routes (`/api/ai`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai/health` | GET | Check if AI service is available |
| `/ai/improve-bio` | POST | Get AI-enhanced bio |
| `/ai/suggest-skills` | POST | Get skill suggestions |
| `/ai/compatibility/:teamId` | GET | Analyze compatibility with a team |
| `/ai/recommend-teams` | GET | Get personalized team recommendations |
| `/ai/generate-team-description` | POST | Generate team description (leaders only) |

## Usage Examples

### Profile Enhancement

1. Go to **Profile** page
2. Fill in your bio, skills, and role
3. Click **"Enhance with AI"** button on bio field
4. AI will generate an improved version of your bio
5. Click **"AI Suggest"** to get skill recommendations

### Finding Teams

1. Navigate to **AI Match** (purple sparkle icon in nav)
2. View your personalized team recommendations
3. Click **"Deep Analysis"** on any team for detailed compatibility report
4. Review strengths, considerations, and AI recommendations
5. Click **"View Team Details"** to join a team

### Team Leader Features

1. Go to your team's detail page
2. Use AI to generate compelling team descriptions
3. Attract better team members with AI-enhanced content

## Technical Details

### AI Service (`backend/services/aiService.js`)

The AI service uses Google's Gemini Pro model with the following configurations:

- **Model**: `gemini-pro`
- **Temperature**: 0.7 (balanced creativity/accuracy)
- **Max Tokens**: 1000
- **Safety Settings**: Default (HARM_BLOCK_THRESHOLD_HIGH)

### Methods

```javascript
// Analyze team compatibility
await aiService.analyzeTeamCompatibility(participant, team);

// Improve bio
await aiService.improveBio(currentBio, skills, role);

// Suggest skills
await aiService.suggestSkills(role, currentSkills);

// Generate team description
await aiService.generateTeamDescription(teamName, members);

// Recommend teams
await aiService.recommendTeams(participant, availableTeams);

// Health check
await aiService.checkHealth();
```

## Rate Limits

Google AI Studio free tier includes:
- 60 requests per minute
- 1,500 requests per day

For production use, consider upgrading to Google Cloud's Vertex AI for higher limits.

## Troubleshooting

### "AI service unavailable" error

1. Check that `GEMINI_API_KEY` is set in `.env`
2. Verify API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Check network connectivity
4. Ensure you haven't exceeded rate limits

### AI responses are slow

- First request may take 2-3 seconds (model initialization)
- Subsequent requests are faster (~1 second)
- Consider implementing caching for frequently requested data

### Generic responses

- Complete your profile with more details
- Add specific technical skills
- Write a detailed bio for better context
- More profile data = better AI recommendations

## Best Practices

1. **Profile Completeness**: Fill out all profile fields for best AI results
2. **Skill Diversity**: Add 3-5 relevant technical skills
3. **Bio Quality**: Write at least 2-3 sentences about yourself
4. **Regular Updates**: Update profile as you learn new skills
5. **Multiple Analyses**: Compare AI recommendations with multiple teams

## Security Notes

- API keys are stored server-side only
- Never expose API keys in frontend code
- API keys are excluded from git via `.gitignore`
- Use environment variables for all sensitive data

## Future Enhancements

Potential AI features for future releases:

- [ ] AI-powered skill gap analysis for teams
- [ ] Automated team matching suggestions
- [ ] AI chat assistant for team questions
- [ ] Sentiment analysis of team communications
- [ ] Predictive team success scores
- [ ] AI-generated hackathon project ideas

## Support

For issues or questions:
1. Check API key configuration
2. Review console logs in browser/terminal
3. Test AI health endpoint: `GET /api/ai/health`
4. Verify Google AI Studio status

---

Made with ❤️ using Google Gemini AI
