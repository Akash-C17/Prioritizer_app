# PRIORA AI - Product Decision System

A comprehensive system for reasoning through competing product decisions, constraints, and trade-offs during ideation and design phases.

## 🎯 Features

### 1. **Landing Page** (`/`)
- Project management hub
- Create and manage projects
- Quick access to all decision-making tools
- View project history

### 2. **Feature Prioritization** (`/feature-prioritize`)
- Add and rate features on impact, effort, and cost metrics
- Automatic ROI-based ranking
- Visual scoring system (1-10 scales)
- Export prioritized feature list

### 3. **AI Decision Analysis** (`/ai-analyze`)
- Describe product decisions and constraints
- Get AI-powered analysis including:
  - Key trade-offs identification
  - Constraint evaluation
  - Strategic recommendations
  - Risk assessment
- Save analyses to project history

### 4. **Product Discussion Panel** (`/discussion`)
- Collaborative discussion threads
- Comment-based collaboration
- Status tracking (Open, Pending, Resolved)
- Real-time discussion management
- Team collaboration features

### 5. **Decision History** (`/history`)
- Track all decisions made per project
- Filter by decision type
- View decision evolution over time
- Export historical data

## 🛠 Tech Stack

**Frontend:**
- Next.js 16.2.4
- React 19.2.4
- Tailwind CSS 4
- Zustand (State Management)
- Lucide React (Icons)
- React Hot Toast (Notifications)

**Backend (Ready for Integration):**
- Next.js API Routes
- Express.js (Optional, can be added)
- Node.js

**Database (To be configured):**
- MongoDB
- Mongoose ODM

## 📦 Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will run on `http://localhost:3000`

## 📁 Project Structure

```
decision-ai/
├── app/
│   ├── api/                    # API Routes
│   │   ├── projects/           # Project management endpoints
│   │   ├── decisions/          # Decision history endpoints
│   │   └── analyze/            # AI analysis endpoint
│   ├── feature-prioritize/     # Feature prioritization page
│   ├── ai-analyze/             # AI analysis page
│   ├── discussion/             # Discussion panel page
│   ├── history/                # Decision history page
│   ├── layout.tsx              # Root layout with navigation
│   └── page.tsx                # Landing page
├── components/
│   └── Navigation.tsx          # Navigation bar component
├── lib/
│   └── store.js                # Zustand store (state management)
└── public/                     # Static assets
```

## 🚀 Getting Started

1. **Create a Project**
   - Go to home page
   - Enter project name and click "Create"

2. **Prioritize Features**
   - Navigate to "Prioritize" tab
   - Add features with impact, effort, and cost ratings
   - View automatic ROI-based ranking
   - Save to history

3. **Analyze Decisions**
   - Go to "AI Analyze" tab
   - Describe your decision problem and constraints
   - Get comprehensive AI analysis
   - Review trade-offs, recommendations, and risks

4. **Collaborate**
   - Use "Discussion" tab for team conversations
   - Create discussion threads
   - Change status as decisions progress
   - Track all team inputs

5. **Review History**
   - Check "History" tab to see all past decisions
   - Filter by decision type
   - Track project evolution

## 🔧 Configuration

### Environment Variables (To be created)
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000

# AI Integration (for demo: add your API key)
OPENAI_API_KEY=your_api_key_here

# Database
MONGODB_URI=your_mongodb_uri
```

## 📚 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Decisions
- `GET /api/decisions` - List all decisions
- `POST /api/decisions` - Save new decision
- `DELETE /api/decisions/[id]` - Delete decision

### Analysis
- `POST /api/analyze` - Get AI analysis

## 🎨 Design Features

- **Dark Mode Interface**: Professional dark theme for focus
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Real-time Updates**: Instant feedback and state management
- **Intuitive Navigation**: Easy access to all features
- **Toast Notifications**: User feedback for all actions

## 🔮 Future Enhancements

- [ ] MongoDB integration for persistent storage
- [ ] Real OpenAI/Claude API integration
- [ ] Team collaboration with user authentication
- [ ] Export to PDF/CSV
- [ ] Advanced analytics and insights
- [ ] Decision templates
- [ ] Version control for decisions
- [ ] WebSocket for real-time collaboration
- [ ] File attachments for discussions

## 🤝 Contributing

To extend this application:

1. Add new pages in `app/` directory
2. Create API routes in `app/api/`
3. Update store in `lib/store.js` for new state
4. Add components in `components/`

## 📝 License

MIT License - Feel free to use this for your product decisions!

## 🎓 Best Practices for Decision Making

Using this tool:
1. **Be Specific**: Clearly define your decision problem
2. **Consider Constraints**: List all real constraints
3. **Document Trade-offs**: Explicitly state what you're trading
4. **Involve Stakeholders**: Use discussion panel for collaboration
5. **Track Changes**: Monitor evolution of decisions in history
6. **Review Regularly**: Check historical decisions for patterns

---

Built with ❤️ for product managers, designers, and teams making thoughtful product decisions.
