# Shuttlemate Backend

A comprehensive backend API service for managing shuttle transportation systems. This application provides APIs for shuttle booking, route management, user authentication, and real-time tracking functionality.

## Features

- **User Management**: User registration, authentication, and profile management
- **Shuttle Management**: Create and manage shuttle routes, schedules, and capacity
- **Booking System**: Allow users to book seats on available shuttles
- **Payment Integration**: Secure payment processing for bookings
- **Admin Dashboard**: Administrative tools for managing the entire system
- **Notifications**: Real-time notifications for booking confirmations, delays, etc.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js / FastAPI 
- **Database**: MongoDB  / MySQL
- **Authentication**: JWT tokens
- **Payment Processing**: Stripe 
- **Documentation**: Swagger/OpenAPI

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v16 or higher) 
- Database (MongoDB/MySQL)
- npm/yarn or pip or Maven/Gradle
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HimashaKodikara/Shuttlemate-Backend.git
   cd Shuttlemate-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or for Python
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DATABASE_URL=mongodb://localhost:27017/shuttlemate
   # or for PostgreSQL
   # DATABASE_URL=postgresql://username:password@localhost:5432/shuttlemate

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d

   # Payment Gateway
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Redis (for caching)
   REDIS_URL=redis://localhost:6379

   # Google Maps API (for location services)
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

4. **Database Setup**
   ```bash
   # Run database migrations (if applicable)
   npm run migrate
   # or
   python manage.py migrate

   # Seed initial data
   npm run seed
   ```

## Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
# or for Python
python app.py
```

### Production Mode
```bash
npm run build
npm start
# or
yarn build
yarn start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:3000/api-docs`
- Postman Collection: Available in `/docs` folder

### Main API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account

#### Shuttles
- `GET /api/shuttles` - Get all available shuttles
- `GET /api/shuttles/:id` - Get specific shuttle details
- `POST /api/shuttles` - Create new shuttle route (Admin)
- `PUT /api/shuttles/:id` - Update shuttle information (Admin)
- `DELETE /api/shuttles/:id` - Delete shuttle route (Admin)

#### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get specific booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

#### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

## Project Structure

```
├── src/
│   ├── controllers/          # Route controllers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   └── validators/          # Input validation schemas
├── tests/                   # Test files
├── docs/                    # Documentation
├── public/                  # Static files
├── .env.example            # Environment variables example
├── package.json
└── README.md
```

## Testing

Run the test suite:

```bash
# Unit tests
npm test
# or
yarn test

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

## Database Schema

### Users
- id, email, password, firstName, lastName, phone, role, createdAt, updatedAt

### Shuttles
- id, name, route, capacity, currentLocation, status, schedule, price

### Bookings
- id, userId, shuttleId, seatNumber, bookingDate, status, paymentStatus

### Payments
- id, bookingId, amount, status, paymentMethod, transactionId

## Deployment

### Using Docker
```bash
# Build the image
docker build -t shuttlemate-backend .

# Run the container
docker run -p 3000:3000 --env-file .env shuttlemate-backend
```

### Using Docker Compose
```bash
docker-compose up -d
```

### Cloud Deployment
The application is ready for deployment on:
- Heroku
- AWS (EC2, ECS, Lambda)
- Google Cloud Platform
- DigitalOcean
- Vercel/Netlify (for serverless functions)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

- Follow REST API conventions
- Use meaningful commit messages
- Write tests for new features
- Update documentation for API changes
- Use ESLint/Prettier for code formatting
- Follow security best practices

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- SQL injection prevention
- XSS protection

## Monitoring and Logging

- Request/Response logging
- Error tracking
- Performance monitoring
- Health check endpoints (`/health`, `/ready`)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: [your-email@example.com]

## Changelog

### v1.0.0 (Current)
- Initial release
- Basic CRUD operations for shuttles and bookings
- User authentication system
- Payment integration
- Real-time tracking

---

**Made with ❤️ by [Himasha Kodikara](https://github.com/HimashaKodikara)**
