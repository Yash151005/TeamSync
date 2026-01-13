# TeamSync - Test Accounts

## 🔐 Login Instructions
Use any email below to login. The OTP will be displayed in the backend console (fake SMTP).

---

## 👥 Team Leaders

### Sarah Johnson - HealthTech Innovators Leader
- **Email:** sarah.johnson@gmail.com
- **Role:** Developer
- **Team:** HealthTech Innovators (3/5 members)
- **Skills:** React, Node.js, MongoDB, TypeScript, GraphQL
- **Experience:** Advanced
- **Team Focus:** Building AI-powered health monitoring app

### Emily Rodriguez - EcoTrack Leader
- **Email:** emily.rodriguez@gmail.com
- **Role:** Designer
- **Team:** EcoTrack (3/4 members)
- **Skills:** Figma, Adobe XD, Illustrator, Photoshop, Prototyping
- **Experience:** Advanced
- **Team Focus:** Sustainability tracking platform with gamification

### James Wilson - FinSmart AI Leader
- **Email:** james.wilson@gmail.com
- **Role:** Product Manager
- **Team:** FinSmart AI (3/5 members)
- **Skills:** Agile, Jira, Product Strategy, User Research, Analytics
- **Experience:** Advanced
- **Team Focus:** AI personal finance assistant

### Lisa Anderson - EduConnect Leader
- **Email:** lisa.anderson@gmail.com
- **Role:** Designer
- **Team:** EduConnect (2/4 members)
- **Skills:** Sketch, Figma, InVision, User Testing, Wireframing
- **Experience:** Advanced
- **Team Focus:** Peer-to-peer learning platform

### Alex Martinez - GameForge Studio Leader
- **Email:** alex.martinez@gmail.com
- **Role:** Developer
- **Team:** GameForge Studio (3/6 members)
- **Skills:** Java, Spring Boot, Kubernetes, Microservices, Redis
- **Experience:** Expert
- **Team Focus:** Indie multiplayer puzzle game

### Sophia White - VoiceBot Pro Leader
- **Email:** sophia.white@gmail.com
- **Role:** ML/AI
- **Team:** VoiceBot Pro (2/4 members)
- **Skills:** NLP, Transformers, BERT, spaCy, HuggingFace
- **Experience:** Advanced
- **Team Focus:** Next-gen voice assistants with multilingual support

---

## 👤 Team Members (Already in Teams)

### Michael Chen
- **Email:** michael.chen@gmail.com
- **Role:** ML/AI
- **Team:** HealthTech Innovators
- **Skills:** Python, TensorFlow, PyTorch, Scikit-learn, Pandas
- **Experience:** Expert

### Chris Taylor
- **Email:** chris.taylor@gmail.com
- **Role:** Developer
- **Team:** HealthTech Innovators
- **Skills:** Swift, iOS, SwiftUI, Firebase, CoreData
- **Experience:** Intermediate

### David Kim
- **Email:** david.kim@gmail.com
- **Role:** Developer
- **Team:** EcoTrack
- **Skills:** JavaScript, Vue.js, React, CSS, Tailwind
- **Experience:** Intermediate

### Tom Harris
- **Email:** tom.harris@gmail.com
- **Role:** Open to Any
- **Team:** EcoTrack
- **Skills:** JavaScript, Python, Git, REST APIs, Testing
- **Experience:** Beginner

### Priya Patel
- **Email:** priya.patel@gmail.com
- **Role:** Developer
- **Team:** FinSmart AI
- **Skills:** Python, Django, PostgreSQL, Docker, AWS
- **Experience:** Intermediate

### Rachel Green
- **Email:** rachel.green@gmail.com
- **Role:** ML/AI
- **Team:** FinSmart AI & EduConnect (duplicate for testing)
- **Skills:** Python, R, Data Visualization, Statistics, SQL
- **Experience:** Intermediate

### Robert Brown
- **Email:** robert.brown@gmail.com
- **Role:** Developer
- **Team:** GameForge Studio
- **Skills:** C++, Rust, WebAssembly, Performance Optimization
- **Experience:** Expert

### Jessica Lee
- **Email:** jessica.lee@gmail.com
- **Role:** Designer
- **Team:** GameForge Studio
- **Skills:** UI Design, Brand Design, Motion Graphics, After Effects
- **Experience:** Advanced

### Nina Sharma
- **Email:** nina.sharma@gmail.com
- **Role:** Product Manager
- **Team:** VoiceBot Pro
- **Skills:** Product Analytics, A/B Testing, Market Research, SQL
- **Experience:** Advanced

---

## 🆓 Available Participants (Not in Teams)

These accounts are perfect for testing the AI recommendation system and join requests:

### 1. **Nina Sharma** (Available for testing - not in team in seeded data)
Actually in VoiceBot Pro - check others

---

## 🎯 Testing Scenarios

### Scenario 1: Team Leader Experience
1. Login as **sarah.johnson@gmail.com** (HealthTech Innovators leader)
2. View your team dashboard
3. See join requests (if any)
4. Use AI to generate team description
5. Manage team members and meeting links

### Scenario 2: Finding Teams (AI Recommendations)
1. Login with any available participant (not in team)
2. Complete your profile if needed
3. Go to **AI Match** page
4. View AI-powered team recommendations
5. Click "Deep Analysis" on any team
6. See compatibility scores and detailed analysis

### Scenario 3: Profile Enhancement
1. Login with any account
2. Go to **Profile** page
3. Add/edit your bio
4. Click **"Enhance with AI"** button
5. Click **"AI Suggest"** for skill recommendations

### Scenario 4: Team Discovery
1. Login as any participant
2. Go to **Discovery** page to find other participants
3. Go to **Teams** page to browse all teams
4. Click on a team to view details
5. Send join request to teams with open spots

### Scenario 5: Join Request Workflow
1. Login as a non-team member
2. Find a team with open spots
3. Send a join request with a message
4. Login as the team leader
5. View and approve/reject the request

---

## 📊 Database Statistics

- **Total Participants:** 15
- **Total Teams:** 6
- **Team Capacity:** 
  - HealthTech Innovators: 3/5 (2 spots open)
  - EcoTrack: 3/4 (1 spot open)
  - FinSmart AI: 3/5 (2 spots open)
  - EduConnect: 2/4 (2 spots open)
  - GameForge Studio: 3/6 (3 spots open)
  - VoiceBot Pro: 2/4 (2 spots open)

---

## 🔄 Resetting Database

To clear all data and reseed:

```bash
cd backend
node clearData.js    # Clear all data
node seedData.js     # Create new dummy data
```

---

## 💡 Tips

1. **OTP Access:** Check the backend console for OTP codes when logging in
2. **Multiple Logins:** Use different browsers/incognito for multiple simultaneous logins
3. **Team Leaders:** Have special permissions to manage join requests and generate team descriptions
4. **AI Features:** Require GEMINI_API_KEY to be set in .env file
5. **Profile Completion:** More complete profiles = better AI recommendations

---

## 🌟 Feature Highlights to Test

✅ Email authentication with OTP (fake SMTP)  
✅ Profile management with social links  
✅ Team creation and management  
✅ Join request system  
✅ Google Meet integration  
✅ AI-powered bio enhancement  
✅ AI skill suggestions  
✅ AI team recommendations  
✅ Compatibility analysis  
✅ Team member discovery  
✅ Real-time dashboard updates  

---

**Happy Testing! 🚀**
