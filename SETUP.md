# CodeShare - Setup & Run Guide

## Quick Start (Development)

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Copy .env.example to .env and update values
cp .env.example .env

# Edit .env with your settings:
# - MONGO_URI=mongodb://localhost:27017/codeshare
# - JWT_SECRET=(any random string)
# - CLIENT_URL=http://localhost:5173
# - JUDGE0_API_URL=https://ce.judge0.com (free, no key needed)

npm run dev
# Backend runs on http://localhost:5000
```

### Frontend Setup

```bash
cd Frontend
npm install

# Copy .env.example to .env (defaults already correct)
cp .env.example .env

npm run dev
# Frontend runs on http://localhost:5173
```

### Demo Users (Optional - Run Seed Script)

```bash
cd backend
node scripts/seed.js
# Creates demo1@codeshare.dev and demo2@codeshare.dev (password: Demo@123)
```

---

## Test Checklist for Demo

### Tier 0.1: Compiler & Console ✅
- [ ] Sign up, create a room
- [ ] Open in 2 browser windows
- [ ] Type code in one window, see it sync in the other
- [ ] Click "Run" → output appears in Console tab with status badge
- [ ] Try Ctrl+Enter → also runs code
- [ ] Switch language → starter template loads
- [ ] Click History tab → see past runs
- [ ] Click "Restore" on a run → code loads in editor
- [ ] Check "Input" tab → enter stdin, run, see it used

### Tier 0.2: Notifications Page ✅
- [ ] Go to Notifications page (bell icon)
- [ ] Should show "No notifications" or seeded samples
- [ ] Check navbar bell badge for count
- [ ] Click notification → should navigate

### Tier 0.3: UI Polish ✅
- [ ] Dark theme, consistent colors/spacing
- [ ] Sidebar with nav groups
- [ ] Buttons are consistent (primary, secondary, ghost, danger)
- [ ] Loading skeletons appear (not bare spinners)
- [ ] Empty states on all pages (Dashboard, Rooms, History, Chat, etc.)
- [ ] No blank pages anywhere
- [ ] Responsive on mobile (sidebar collapses)

### Tier 1: Live Features ✅
- [ ] Live cursors appear with user names (different colors)
- [ ] Typing indicator shows "Ariya is typing..."
- [ ] Auto-reconnect if network drops
- [ ] Participants panel shows avatars
- [ ] Chat works real-time
- [ ] Emoji picker in chat
- [ ] Video call (PeerJS) - start/stop, mute, camera toggle

### Tier 2: Advanced Features (as time allows)
- [ ] Session replay with timeline slider, play/pause, speed control
- [ ] Analytics dashboard with charts (time, lines, errors)
- [ ] Complexity analyzer button (calls mock LLM)
- [ ] Mentor review - select lines, add comments
- [ ] Scorecard with PDF download
- [ ] Anti-cheat logs (host only)

---

## Environment Variables

### Backend `.env`

```
# Required
PORT=5000
MONGO_URI=mongodb://localhost:27017/codeshare
JWT_SECRET=any_random_string_here
CLIENT_URL=http://localhost:5173

# Judge0 (free public API, no key needed for ce.judge0.com)
JUDGE0_API_URL=https://ce.judge0.com

# Optional: RapidAPI commercial version (faster, higher limits)
# JUDGE0_API_KEY=your_key
# JUDGE0_API_HOST=judge0-ce.p.rapidapi.com

# Email (Gmail SMTP - use App Password, not account password)
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=16_char_app_password

# Feature Flags
REQUIRE_EMAIL_VERIFICATION=false
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Troubleshooting

**"Cannot connect to Judge0"**
- Judge0 defaults to `https://ce.judge0.com` (free, public API)
- If you have RapidAPI key, set `JUDGE0_API_KEY` and `JUDGE0_API_HOST`
- Check network: try `curl https://ce.judge0.com/about` from terminal

**"MongoDB connection failed"**
- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas cloud database: `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/codeshare`

**"Blank page on frontend"**
- Check browser console (F12 → Console tab) for errors
- Verify `VITE_API_URL` and `VITE_SOCKET_URL` in `.env`
- Ensure backend is running on port 5000

**"Socket.io connection fails"**
- Both backend and frontend must be running
- Check `VITE_SOCKET_URL` points to backend

---

## For Production

See `DEPLOYMENT.md` for Render, Vercel, and MongoDB Atlas deployment.

---

## Demo Walk-Through (5 minutes)

1. **Sign up** → Login with new account
2. **Create a room** → "My First Session"
3. **Open in new tab** → Join same room
4. **Code together** → Write Hello World in JavaScript
5. **Run code** → See output in Console, status badge, execution time/memory
6. **Check History** → See run listed with user who ran it
7. **Switch to Python** → See starter template auto-load
8. **Chat** → Type message, see it in Chat tab
9. **Show Notifications** → Bell icon in navbar
10. **Mention session replay** → "Session Replay page records every keystroke"

---

**Total setup time: ~5 minutes**  
**Demo time: ~10 minutes**

Good luck with your project review! 🚀
