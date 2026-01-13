# TeamSync – Smart Team Discovery for Hackathons

A lightweight, secure, mobile-first platform that enables hackathon participants to discover compatible teammates through visibility, filtering, and smart recommendations.

## 🎯 Core Features

### Mandatory Features
- **Participant Profile Creation** - Skills, interests, roles, soft skills
- **"Looking for Team" Mode** - One-click availability toggle
- **Discovery & Browsing** - Advanced filtering and search
- **Secure OTP Authentication** - No JWT, session-based security

### 9 Unique Differentiators
1. **Skill-Gap Visual Indicator** - Real-time skill compatibility visualization
2. **Team Balance Score** - Transparent 0-100 scoring system
3. **Soft-Skill Tagging System** - Pitcher, Documenter, Coordinator, etc.
4. **One-Click Team Invites** - Structured invite system with expiry
5. **Smart Visibility Boost** - Auto-boost solo participants
6. **Organizer Dashboard** - Skill distribution and team analytics
7. **Swipe-Style Discovery** - Mobile-first Tinder-like UI
8. **Auto-Generated Team Cards** - Shareable team summaries
9. **Hackathon Lifecycle Automation** - Auto-lock profiles, archive data

## 🛠️ Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: Email + OTP (server-side verification)

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone and Install**
```bash
npm run install-all
```

2. **Configure Environment Variables**

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teamsync
NODE_ENV=development

# Email Configuration (for OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# OTP Configuration
OTP_EXPIRY_MINUTES=10
MAX_OTP_ATTEMPTS=3

# Server
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Run Development Servers**
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Render/Railway)
```bash
cd backend
# Connect to MongoDB Atlas
# Set environment variables
# Deploy from GitHub
```

### Database (MongoDB Atlas)
1. Create cluster at mongodb.com
2. Set up network access
3. Get connection string
4. Update MONGODB_URI

## 📱 Demo Flow (2-3 Minutes)

1. **Sign In** - Email + OTP verification
2. **Create Profile** - Add skills, interests, role preferences
3. **Toggle "Looking for Team"** - Make yourself discoverable
4. **Browse Participants** - Use filters (skills, roles, experience)
5. **View Skill-Gap Indicator** - See compatibility visualization
6. **Send/Receive Invites** - One-click team formation
7. **Organizer Dashboard** - View team analytics
8. **Generate Team Card** - Auto-created summary

## 🔒 Security Features

- OTP-based authentication (no JWT in browser)
- Rate limiting on critical endpoints
- Input sanitization (XSS prevention)
- NoSQL injection protection
- Private contact details
- Server-side validation
- MongoDB indexes for security

## 📊 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and create session
- `POST /api/auth/logout` - Invalidate session

### Participants
- `GET /api/participants` - List all available participants
- `POST /api/participants` - Create profile
- `PUT /api/participants/:id` - Update profile
- `PATCH /api/participants/:id/availability` - Toggle availability

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `POST /api/teams/:id/invite` - Send invite
- `POST /api/teams/:id/accept` - Accept invite
- `GET /api/teams/:id/balance-score` - Get team balance score
- `GET /api/teams/:id/card` - Generate team summary card

### Organizer
- `GET /api/organizer/dashboard` - Analytics dashboard
- `GET /api/organizer/unassigned` - Solo participants
- `GET /api/organizer/skill-distribution` - Skill heatmap

## 🎨 Key Components

### Frontend
- `ParticipantProfile` - Profile creation/editing
- `DiscoveryPage` - Browse participants with filters
- `SkillGapIndicator` - Visual skill compatibility
- `SwipeDiscovery` - Mobile swipe interface
- `TeamCard` - Auto-generated team summary
- `OrganizerDashboard` - Analytics and insights

### Backend
- `otpService` - OTP generation and verification
- `emailService` - Email sending via nodemailer
- `matchingService` - Skill-gap calculation
- `balanceScoreService` - Team balance algorithm
- `visibilityBoostService` - Auto-boost solo participants

## 🏆 Why This MVP Wins

✅ Fully satisfies all mandatory requirements  
✅ No overengineering - clear and maintainable  
✅ Security-aware without complexity  
✅ Strong inclusion narrative  
✅ Explainable logic (no black-box AI)  
✅ Realistic to build and deploy  
✅ Mobile-first responsive design  
✅ Production-ready features  

## 🤝 Contributing

This is a hackathon MVP project. Feel free to fork and enhance!

## 📄 License

MIT License - feel free to use for your hackathons!

---

**Built with ❤️ for better hackathon collaboration**
