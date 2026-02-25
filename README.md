# WecnDraw

**Real-Time Collaborative Whiteboard** — built with the MERN stack, Socket.IO, and Fabric.js.

[![Frontend](https://img.shields.io/badge/Frontend-React_+_Vite-blue)](https://vitejs.dev)  [![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-green)](https://expressjs.com)  [![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎨 **Infinite Canvas** | Fabric.js-powered canvas with pan, zoom, grid |
| ✏️ **Drawing Tools** | Pencil, eraser, highlighter, shapes, text, sticky notes, laser pointer |
| 🔄 **Real-time Sync** | Zero-latency Socket.IO collaboration with live cursors |
| 💬 **Chat** | In-room chat with typing indicators, @mentions |
| 👥 **Presence** | Stacked avatars, host badge, connection indicator |
| 🎭 **Emoji Reactions** | Floating emoji animations |
| ⏮️ **Undo/Redo** | 50-step history stack, synced across all users |
| 📸 **Snapshots** | Auto-save every 60s + manual PNG export |
| 🎬 **Recording** | Session recording with frame storage |
| 📋 **Templates** | Blank, Wireframe, Flowchart, Kanban |
| 🌙 **Dark/Light Mode** | System-aware theme with smooth transitions |
| 🔐 **Auth** | JWT + refresh tokens, optional room passwords |

---

## 🛠 Tech Stack

**Frontend:** React 18 · TypeScript · Vite · Fabric.js · Zustand · Socket.IO Client · Framer Motion · Tailwind CSS · Axios

**Backend:** Node.js · Express · Socket.IO · MongoDB (Mongoose) · Bcryptjs · JWT · Cloudinary · Winston · Helmet

---

## 📁 Project Structure

```
WecnDraw/
├── client/                    # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # LoginForm, RegisterForm, ProtectedRoute
│   │   │   ├── shared/        # Navbar, Modal, Loader, ErrorBoundary, ThemeToggle
│   │   │   ├── room/          # CreateRoom, JoinRoom, RoomCard
│   │   │   └── whiteboard/    # Canvas, Toolbar, ChatPanel, PresenceBar
│   │   ├── context/           # SocketContext
│   │   ├── hooks/             # useSocket
│   │   ├── pages/             # LandingPage, AuthPage, DashboardPage, WhiteboardPage
│   │   ├── services/          # api.ts, authService.ts, roomService.ts
│   │   ├── store/             # authStore, roomStore, canvasStore (Zustand)
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # canvasHelpers, colorUtils
│   └── vercel.json
└── server/                    # Express + Socket.IO backend
    ├── config/                # db.js, cloudinary.js, corsOptions.js
    ├── controllers/           # auth, room, session, file
    ├── middleware/             # auth, role, error, rateLimiter, validate
    ├── models/                # User, Room, Session, Message
    ├── routes/                # authRoutes, roomRoutes, sessionRoutes, fileRoutes
    ├── services/              # jwtService, cloudinaryService, sessionService
    ├── socket/                # socketManager, roomHandler, drawingHandler, chatHandler, presenceHandler, webrtcHandler
    ├── utils/                 # logger, generateRoomId, apiResponse
    └── server.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/WecnDraw.git

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment Variables

**`server/.env`:**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/wecndraw
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**`client/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

App will be available at **http://localhost:5173**

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/logout` | ✅ | Logout |
| POST | `/api/auth/refresh-token` | ❌ | Refresh access token |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/update-profile` | ✅ | Update profile |
| POST | `/api/rooms/create` | ✅ | Create room |
| GET | `/api/rooms/my-rooms` | ✅ | Get user's rooms |
| POST | `/api/rooms/:roomId/join` | ✅ | Join room |
| DELETE | `/api/rooms/:roomId` | ✅ | Delete room (host only) |
| GET | `/api/sessions/:roomId` | ✅ | Get session data |
| POST | `/api/sessions/:roomId/save` | ✅ | Save canvas state |
| POST | `/api/sessions/:roomId/snapshot` | ✅ | Save PNG snapshot |
| POST | `/api/files/upload` | ✅ | Upload file |

---

## ⚡ Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `room:join` | → Server | Join a room |
| `room:leave` | → Server | Leave a room |
| `room:user-joined` | ← Client | User joined notification |
| `draw:object-added` | ↔ | New shape/path synced |
| `draw:object-modified` | ↔ | Shape moved/resized |
| `canvas:undo` | ↔ | Undo broadcast |
| `canvas:clear` | ↔ | Canvas cleared |
| `chat:send` | → Server | Send message |
| `chat:message` | ← Client | Receive message |
| `chat:typing` | ↔ | Typing indicator |
| `cursor:move` | → Server | Mouse position |
| `draw:emoji` | ↔ | Floating emoji reaction |

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy the `dist/` folder to Vercel
# Or connect GitHub repo at vercel.com
```

### Backend (Railway / Render)
```bash
# Set all environment variables in Railway dashboard
# Connect GitHub repo and Railway will auto-deploy from `server/`
# Start command: node server.js
```

---

## 🔐 Security

- **Helmet** — HTTP security headers
- **CORS** — Whitelist only the client URL
- **Rate Limiting** — 5 auth attempts / 15 min, 100 API calls / 15 min
- **JWT** — Short-lived access tokens (15m) + HTTP-only refresh cookies (7d)
- **bcrypt** — Password hashing with salt rounds 12
- **express-validator** — Input sanitization and validation

---
