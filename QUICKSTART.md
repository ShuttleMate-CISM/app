# Quick Reference Guide

## 🚀 Getting Started (5 minutes)

### First Time Setup
```bash
# 1. Clone the repo
git clone <your-repo-url>
cd shuttlemate

# 2. Install all dependencies
npm install

# 3. Setup backend
cd Shuttlemate-Backend
cp .env.example .env
# Edit .env with your credentials

# 4. Setup frontend
cd ../Shuttlemate-Frontend
# Update src/firebase/firebaseconfig.jsx

# 5. Run the app (from root)
cd ..
npm run dev
```

## 📁 Project Structure At A Glance

```
shuttlemate/
├── Shuttlemate-Backend/   ← Express API
├── Shuttlemate-Frontend/  ← React + Vite
├── .github/workflows/     ← CI/CD pipelines
└── Root config files      ← package.json, .gitignore, etc.
```

## 💻 Common Commands

### Development
| Command | What it does |
|---------|------------|
| `npm install` | Install dependencies for everything |
| `npm run dev` | Start both backend & frontend |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Build frontend for production |

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: my feature"

# Push and create PR
git push origin feature/my-feature
```

## 🔧 Backend Quick Setup

1. **Navigate to backend:**
   ```bash
   cd Shuttlemate-Backend
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Add credentials:**
   - MONGO_URL (MongoDB connection)
   - FIREBASE_PROJECT_ID
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY
   - STRIPE_SECRET_KEY

4. **Start server:**
   ```bash
   npm run dev
   ```
   → Server runs at `http://localhost:5000`

## ⚛️ Frontend Quick Setup

1. **Navigate to frontend:**
   ```bash
   cd Shuttlemate-Frontend
   ```

2. **Update Firebase config:**
   Edit `src/firebase/firebaseconfig.jsx` with your Firebase credentials

3. **Start dev server:**
   ```bash
   npm run dev
   ```
   → App runs at `http://localhost:5173`

## 🔐 Environment Variables Needed

### Backend (.env file)
```
MONGO_URL=                 # MongoDB connection string
FIREBASE_PROJECT_ID=       # Firebase project ID
FIREBASE_CLIENT_EMAIL=     # Firebase service account email
FIREBASE_PRIVATE_KEY=      # Firebase private key
PORT=5000                  # Server port
CORS_ORIGIN=http://localhost:5173
STRIPE_SECRET_KEY=         # Stripe secret key (optional)
```

### Frontend
Update `src/firebase/firebaseconfig.jsx`:
```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### "MongoDB connection failed"
- Check MongoDB is running: `brew services list`
- Start MongoDB: `brew services start mongodb-community`
- Verify MONGO_URL in .env is correct

### "Firebase initialization error"
- Verify firebaseconfig.jsx has all required fields
- Check Firebase project is active in Console
- Ensure credentials are correct

## 📊 Available Scripts

| Command | Runs in | Purpose |
|---------|---------|---------|
| `npm install` | Root | Install all dependencies |
| `npm run dev` | Root | Run backend & frontend |
| `npm run build` | Root | Build frontend |
| `npm run dev:backend` | Root | Backend dev mode |
| `npm run dev:frontend` | Root | Frontend dev mode |
| `npm run start:backend` | Root | Backend production |
| `npm run lint:frontend` | Root | Frontend linting |
| `npm run preview:frontend` | Root | Preview production build |

## 🔍 Testing Your Setup

### Test Backend
```bash
# If server is running, this should return a response
curl http://localhost:5000/api/health
```

### Test Frontend
- Open browser: `http://localhost:5173`
- Should load the Shuttlemate app

### Test Database
```bash
# Connect to MongoDB
mongosh

# Select database
use shuttlemate

# List collections
db.getCollectionNames()
```

## 📝 Commit Message Format

```
feat: add new feature          # New feature
fix: fix the issue             # Bug fix
docs: update README            # Documentation
style: format code             # Code formatting
refactor: refactor code        # Code refactoring
test: add tests                # Tests
chore: update dependencies     # Maintenance
```

## 🚢 Preparing for GitHub

1. **Update credentials:**
   - Ensure .env files are in .gitignore ✓
   - Never commit Firebase keys ✓

2. **Review files:**
   - Check README.md is complete
   - Verify .gitignore covers everything
   - Ensure LICENSE is present

3. **Create repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

4. **Configure GitHub:**
   - Enable branch protection (optional)
   - Add secrets if deploying
   - Set up Actions if needed

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview & setup |
| `DEVELOPMENT.md` | Detailed dev guide |
| `CONTRIBUTING.md` | Contribution guidelines |
| `MONOREPO_SETUP.md` | Monorepo configuration |
| `.env.example` | Environment variables template |

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| MongoDB | localhost:27017 |

## 💡 Tips & Tricks

1. **Use VS Code extensions** for better development:
   - ESLint - Code linting
   - Prettier - Code formatting
   - Thunder Client - API testing
   - MongoDB - Database browsing

2. **Enable auto-format on save** in VS Code:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode"
   }
   ```

3. **Use npm scripts** instead of direct commands:
   ```bash
   npm run dev:backend  # Better than cd && npm start
   ```

4. **Keep .env files local** - Never push them

## 🆘 Getting Help

1. **Check documentation:**
   - DEVELOPMENT.md for setup issues
   - CONTRIBUTING.md for contribution help

2. **Search existing issues** on GitHub

3. **Create a detailed issue** with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment info

4. **Read error messages** carefully - they usually have the solution!

---

**For more detailed information, see:**
- 📖 [DEVELOPMENT.md](./DEVELOPMENT.md) - Complete setup guide
- 🤝 [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- 🏗️ [MONOREPO_SETUP.md](./MONOREPO_SETUP.md) - Monorepo details
