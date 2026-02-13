# Shuttlemate

A comprehensive badminton booking and coaching platform built with MERN stack (MongoDB, Express, React, Node.js).

## Project Overview

Shuttlemate is a full-stack application that enables users to:
- Book badminton courts
- Find and book coaching sessions
- Organize matches and tournaments
- Purchase badminton equipment from the shop
- View sports news and videos
- Manage payments and notifications

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **Payment**: Stripe integration
- **Email**: Nodemailer
- **Security**: bcryptjs for password hashing

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Lucide React
- **HTTP Client**: Axios
- **State Management**: Context API
- **Data Tables**: React Data Table Component
- **Charts**: Recharts
- **Notifications**: SweetAlert2

## Project Structure

```
shuttlemate/
├── Shuttlemate-Backend/      # Express API server
│   ├── config/               # Database configuration
│   ├── controllers/          # Route controllers
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── middlewares/          # Custom middleware
│   ├── firebase/             # Firebase configuration
│   └── server.js             # Entry point
├── Shuttlemate-Frontend/     # React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context
│   │   ├── hooks/            # Custom hooks
│   │   ├── firebase/         # Firebase config
│   │   └── App.jsx           # Root component
│   └── vite.config.js        # Vite configuration
└── package.json              # Root workspaces config
```

## Installation

### Prerequisites
- Node.js (>=16.0.0)
- npm (>=8.0.0)
- MongoDB instance
- Firebase project

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shuttlemate.git
   cd shuttlemate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd Shuttlemate-Backend
   # Create .env file with required variables
   cp .env.example .env
   # Add your database URL, Firebase credentials, Stripe keys, etc.
   ```

4. **Frontend Setup**
   ```bash
   cd ../Shuttlemate-Frontend
   # Firebase config is in src/firebase/firebaseconfig.jsx
   # Update with your Firebase project credentials
   ```

## Running the Application

### Development Mode

Run both backend and frontend concurrently:
```bash
npm run dev
```

### Run Separately

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

### Production Build

**Build Frontend:**
```bash
npm run build
```

**Preview Frontend:**
```bash
npm run preview:frontend
```

**Start Backend:**
```bash
npm run start:backend
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
STRIPE_SECRET_KEY=your_stripe_secret_key
CORS_ORIGIN=http://localhost:5173
PORT=5000
```

### Frontend
Update `src/firebase/firebaseconfig.jsx` with your Firebase configuration:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Courts
- `GET /api/courts` - Get all courts
- `POST /api/courts` - Create new court
- `PUT /api/courts/:id` - Update court
- `DELETE /api/courts/:id` - Delete court

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Coaches
- `GET /api/coaches` - Get all coaches
- `POST /api/coaches` - Register coach
- `POST /api/coach-availability` - Set availability

### Matches
- `GET /api/matches` - Get all matches
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match

### Shop
- `GET /api/shop/items` - Get all items
- `POST /api/shop/items` - Create item
- `POST /api/shop/orders` - Create order

## Features

- User authentication with Firebase
- Role-based access control (Admin, Coach, Player)
- Court booking system with availability management
- Coach hiring and scheduling
- Match creation and timeline
- Integrated payment system with Stripe
- Shop for purchasing badminton equipment
- News and video modules
- Real-time notifications
- User profile management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@shuttlemate.com or open an issue in the repository.

## Authors

- Shuttlemate Team

## Acknowledgments

- MongoDB for the database
- Firebase for authentication
- Stripe for payment processing
- React community for amazing tools and libraries
