# Development Guide

This guide will help you set up Shuttlemate for local development.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v8 or higher) - Usually comes with Node.js
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)
- **Git** - [Download](https://git-scm.com/)

Verify installations:
```bash
node --version
npm --version
git --version
```

## Project Structure

This is a monorepo containing two main packages:

```
shuttlemate/
├── Shuttlemate-Backend/   # Node.js + Express API
├── Shuttlemate-Frontend/  # React + Vite application
└── .github/workflows/     # CI/CD pipelines
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/shuttlemate.git
cd shuttlemate
```

### 2. Install Dependencies

Install all dependencies for both packages:

```bash
npm install
```

This will:
- Install root dependencies
- Install Backend dependencies
- Install Frontend dependencies

### 3. Backend Setup

#### Configure Environment Variables

Navigate to the backend and set up your `.env` file:

```bash
cd Shuttlemate-Backend
```

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```dotenv
# MongoDB
MONGO_URL=mongodb://localhost:27017/shuttlemate
# or for MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/shuttlemate

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Server
PORT=5000
NODE_ENV=development

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key

# CORS Origin
CORS_ORIGIN=http://localhost:5173
```

#### Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select or create your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy values to your `.env` file

#### Start Backend Server

```bash
npm run dev:backend
```

Server will run at `http://localhost:5000`

### 4. Frontend Setup

#### Configure Firebase

Navigate to the frontend:

```bash
cd Shuttlemate-Frontend
```

Update `src/firebase/firebaseconfig.jsx` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
};
```

#### Start Frontend Server

```bash
npm run dev:frontend
```

Frontend will run at `http://localhost:5173`

## Running the Application

### Option 1: Run Both Concurrently (from root)

```bash
npm run dev
```

This starts both backend and frontend in one terminal.

### Option 2: Run Separately (from root)

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Frontend:
```bash
npm run dev:frontend
```

## Available Scripts

### From Root Directory

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Run backend & frontend concurrently |
| `npm run build` | Build frontend for production |
| `npm run start:backend` | Start backend server |
| `npm run start:frontend` | Start frontend dev server |
| `npm run dev:backend` | Run backend in dev mode with nodemon |
| `npm run dev:frontend` | Run frontend dev server |
| `npm run lint:frontend` | Run ESLint on frontend |
| `npm run preview:frontend` | Preview production build locally |

### Backend Scripts (from Shuttlemate-Backend)

| Command | Description |
|---------|-------------|
| `npm start` | Start backend server |
| `npm run dev` | Start with nodemon (auto-reload) |

### Frontend Scripts (from Shuttlemate-Frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Database Setup

### MongoDB Locally

1. Install MongoDB Community Edition
2. Start MongoDB service:

```bash
# macOS (if installed via Homebrew):
brew services start mongodb-community

# Linux (Ubuntu):
sudo systemctl start mongod

# Windows:
# Start MongoDB Community in Services app
```

3. Verify MongoDB is running:
```bash
mongosh
```

### MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add it to `.env`:

```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/shuttlemate
```

## Testing the Setup

### 1. Test Backend API

```bash
curl http://localhost:5000/api/health
```

### 2. Check Frontend

Visit `http://localhost:5173` in your browser

### 3. Verify Database Connection

```bash
# In MongoDB shell
use shuttlemate
db.getCollectionNames()
```

## Common Issues & Troubleshooting

### Port Already in Use

If port 5000 or 5173 is occupied:

```bash
# Find process on port 5000
lsof -i :5000
kill -9 <PID>

# For port 5173
lsof -i :5173
kill -9 <PID>
```

### MongoDB Connection Error

```bash
# Check MongoDB is running
# Linux/macOS:
brew services list

# If not running:
brew services start mongodb-community
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Vite/Webpack Build Errors

```bash
# Clear cache
cd Shuttlemate-Frontend
rm -rf dist
npm run build
```

### Firebase Configuration Error

```bash
# Ensure firebaseconfig.jsx has all required fields:
- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- appId
```

## IDE Setup

### VS Code Extensions (Recommended)

Install these extensions for better development experience:

- ESLint
- Prettier
- Thunder Client (for API testing)
- MongoDB for VS Code
- Firebase
- Vite
- React Extension Pack

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact"
  ]
}
```

## Git Workflow

```bash
# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Key Endpoints

See the main [README.md](../README.md) for detailed API documentation.

## Performance Tips

1. **Use MongoDB Indexes** for frequently queried fields
2. **Implement Pagination** for large data sets
3. **Use Caching** where appropriate
4. **Optimize Images** in the frontend
5. **Code Split React** components for better performance

## Environment Management

### Development
- Use local MongoDB or MongoDB Atlas
- Enable console logging
- Keep detailed error messages

### Staging
- Use staging database
- Enable basic logging
- Test all features

### Production
- Use production database with backups
- Minimize console output
- Implement proper error handling

## Next Steps

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
2. Check [README.md](../README.md) for project overview
3. Explore the codebase structure
4. Start implementing features!

## Support

For help with development:
1. Check existing GitHub Issues
2. Read the [README.md](../README.md)
3. Open a new issue with detailed information
4. Contact the maintainers

Happy coding! 🚀
