# 🎓 StudyFlow Pro


> A full-stack academic productivity platform for university students — manage courses, assignments, quizzes, exams, notes, and study sessions in one intelligent dashboard.

![Next.js](https://img.shields.io/badge/Next.js_14-black?logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## ✨ Features

- 🔐 **JWT Authentication** — Register, login, refresh tokens, change password
- 📚 **Course Management** — Create/edit/delete courses with custom colors
- ✅ **Task Tracking** — Full CRUD for assignments, quizzes, exams, projects with priority/status/difficulty
- 📅 **Calendar View** — Monthly calendar with task deadlines displayed per day
- 📝 **Notes Module** — Create and edit notes linked to courses/tasks
- 📊 **Analytics Dashboard** — Weekly charts, course progress bars, study hours
- ⚡ **Smart Recommendation Engine** — Ranks tasks by urgency + difficulty, suggests what to study today
- 🌙 **Dark Mode** — Toggle light/dark theme, persisted across sessions
- 🔍 **Filter & Search** — Filter tasks by course, type, status, priority

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Recharts, Zustand, Lucide |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens), bcrypt |
| Deploy | Vercel (frontend) + Railway (backend + DB) |

## 📁 Project Structure

```
studyflow-pro/
├── backend/
│   ├── prisma/schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/                   # env, database
│   │   ├── controllers/              # auth, courses, tasks, notes, sessions, analytics
│   │   ├── middlewares/              # authenticate, validate, errorHandler
│   │   ├── routes/                   # all route files
│   │   ├── utils/                    # response helpers, seed
│   │   └── server.ts                 # Express app entry
│   └── package.json
└── frontend/
    └── src/
        ├── app/
        │   ├── (auth)/login + register
        │   └── (dashboard)/dashboard, courses, tasks, calendar, notes, analytics, settings
        ├── components/layout, courses, tasks, notes
        ├── hooks/                    # useAuth, useTasks, useCourses, useNotes
        ├── lib/                      # api.ts (Axios), utils.ts
        ├── store/                    # Zustand authStore, uiStore
        └── types/                    # TypeScript interfaces
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & install
```bash
git clone https://github.com/yourusername/studyflow-pro
cd studyflow-pro

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Setup backend environment
```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT secrets
```

### 3. Setup database
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed    # Optional: loads demo data
```

### 4. Setup frontend environment
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL
```

### 5. Run development servers
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Prisma Studio: `cd backend && npm run db:studio`

### Demo Credentials
After seeding:
- **Email:** demo@studyflow.pro
- **Password:** password123

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List all courses |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filterable) |
| GET | `/api/tasks/today` | Tasks due today |
| GET | `/api/tasks/overdue` | Overdue tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Summary stats |
| GET | `/api/analytics/weekly` | 7-day progress |
| GET | `/api/analytics/courses` | Per-course progress |
| GET | `/api/analytics/recommendations` | Smart task suggestions |

## 🗄 Database Schema

```
Users ──< Courses ──< Tasks
Users ──< Notes  ──> Courses (optional)
Users ──< StudySessions ──> Tasks (optional)
Tasks ──< StudySessions
Tasks ──< Notes
RefreshTokens ──> Users
```

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set NEXT_PUBLIC_API_URL to your Railway backend URL


Demo login after seeding: demo@studyflow.pro / password123
```

### Backend → Railway
1. Push to GitHub
2. Connect repo to Railway
3. Set all env variables from `.env.example`
4. Railway auto-detects Node.js and runs `npm start`

## 🔮 Future Improvements

- [ ] Pomodoro timer linked to tasks
- [ ] AI study tips via Claude API
- [ ] Browser push notifications for deadlines
- [ ] Google Calendar / iCal sync
- [ ] PDF export for schedules
- [ ] Collaborative study groups
- [ ] Spaced repetition flashcards from notes
- [ ] Mobile app (React Native)

cd backend
npm run dev


cd frontend
npm run dev


## 👤 Author

Built by Achraf Nazha — [GitHub](https://github.com/Achrafnazha) · [LinkedIn](www.linkedin.com/in/achraf-nazha-951879267)

---

⭐ Star this repo if you found it helpful!
