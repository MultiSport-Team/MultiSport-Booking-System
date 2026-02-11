# MultiSport Booking System

A full-stack sports venue booking platform that connects users with sports facilities. Book badminton courts, cricket turfs, swimming pools, and more—all in one place.

## Overview

MultiSport Booking System is a complete marketplace for sports facility bookings. Whether you're looking to book a court for a quick game or manage multiple venues, this platform makes it simple. Built for users, vendors, and admins with an intuitive interface and robust backend.

## Features

### For Users
- Browse available sports venues and facilities
- Filter by location, sport category, price range
- View detailed venue information with images and reviews
- Book slots and manage yourSchedule
- Make payments securely
- Track booking history
- Add venues to favorites
- Write reviews and ratings

### For Vendors
- Register and manage multiple venues
- Set availability and pricing
- Create time slots for bookings
- View incoming bookings
- Track revenue
- Manage venue information and images
- Accept or decline bookings

### For Admins
- Approve/reject new venues
- Manage platform users
- View all bookings across the platform
- Create sport categories
- Monitor platform statistics and revenue

## Tech Stack

### Frontend - Web
- **React 19** - UI library
- **Vite** - Fast build tool
- **Redux Toolkit** - State management
- **React Router v7** - Navigation
- **Bootstrap 5** - UI components
- **Axios** - HTTP client

### Frontend - Mobile
- **React Native** - Cross-platform mobile
- **Redux** - State management
- **Axios** - API calls

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

## Project Structure

```
MultiSport-Booking-System/
├── backend/
│   ├── core-services/          # Main API server
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints
│   │   │   │   ├── userRoutes.js
│   │   │   │   ├── venueRoutes.js
│   │   │   │   └── bookingRoutes.js
│   │   │   └── utils/          # Helpers & middleware
│   │   ├── server.js
│   │   ├── package.json
│   │   └── .env
│   └── finance-service/        # (Optional) Java/Spring module
│
├── Multisport Web Application/  # React web app
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API communication
│   │   ├── store/              # Redux state
│   │   └── utils/              # Config & helpers
│   └── package.json
│
├── Mutlisports Mobile Application/ # React Native app
│   ├── src/
│   │   ├── screens/            # Screen components
│   │   ├── services/           # API services
│   │   └── assets/             # Images & icons
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL v8.0+
- npm or yarn

### Backend Setup

1. Navigate to backend:
```bash
cd backend/core-services
```

2. Setup environment:
```bash
cp .env.example .env
```

3. Update `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=db_core
JWT_SECRET=your_secret_key
PORT=3000
```

4. Install dependencies:
```bash
npm install
```

5. Start server:
```bash
node server.js
```

Server runs on `http://localhost:3000`

### Web App Setup

1. Navigate to web app:
```bash
cd "Multisport Web Application"
```

2. Install dependencies:
```bash
npm install
```

3. Start dev server:
```bash
npm run dev
```

App opens at `http://localhost:5173`

### Mobile App Setup

1. Navigate to mobile app:
```bash
cd "Mutlisports Mobile Application"
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-ip:3000';
```

4. Run on device/emulator:
```bash
# iOS
npm run ios

# Android
npm run android
```

## Database Setup

The database uses MySQL with the following main tables:
- `users` - User accounts and profiles
- `venues` - Sports facilities
- `bookings` - Booking records
- `slots` - Available time slots
- `reviews` - Venue reviews
- `sports_categories` - Sport types
- `venue_images` - Venue photos

## API Endpoints

### Authentication
```
POST   /user/register        Register new user
POST   /user/login           User login
GET    /user/profile         Get user profile
PUT    /user/profile         Update profile
```

### Venues
```
GET    /venue                 Get all venues
GET    /venue/details/:id     Get venue details
POST   /venue                 Create venue (vendors)
PUT    /venue/:id             Update venue
GET    /venue/categories      Get sport categories
```

### Bookings
```
POST   /booking               Create booking
GET    /booking               Get user bookings
GET    /booking/:id           Get booking details
POST   /booking/slots         Create slots (vendors)
GET    /booking/venue/:id     Get available slots
```

## Running Everything Together

Open 3 terminals:

**Terminal 1 - Backend:**
```bash
cd backend/core-services
npm install
node server.js
```

**Terminal 2 - Web App:**
```bash
cd "Multisport Web Application"
npm install
npm run dev
```

**Terminal 3 - Mobile App:**
```bash
cd "Mutlisports Mobile Application"
npm install
npm run android  # or npm run ios
```

## Environment Variables

### Backend (.env)
```
PORT=3000
DB_HOST=localhost
DB_USER=multisport
DB_PASSWORD=your_password
DB_NAME=db_core
JWT_SECRET=your_secret_key
SALT_ROUNDS=10
```

### Web App (.env)
```
VITE_API_URL=http://localhost:3000
```

## Build & Deployment

### Web App Production Build
```bash
cd "Multisport Web Application"
npm run build
```

Deploy the `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

### Backend Deployment
Deploy to:
- AWS EC2
- Heroku
- DigitalOcean
- Any Node.js hosting

Update database connection and JWT secret in production `.env`

### Mobile App
Build for stores:
```bash
# Android APK
npm run android -- --release

# iOS IPA
npm run ios -- --release
```

## Key Features Implemented

✅ User authentication with JWT
✅ Venue search and filtering
✅ Booking management
✅ Slot management for vendors
✅ Payment integration ready
✅ Review and rating system
✅ Admin dashboard
✅ Responsive design
✅ Redux state management
✅ Error handling and validation

## Common Issues & Solutions

**Mobile app can't connect to backend?**
- Update API URL in `Mutlisports Mobile Application/src/services/api.js`
- Ensure backend is running on correct port
- Check firewall settings

**Database connection error?**
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

**Port already in use?**
- Change PORT in `.env` or use different port
- Kill existing process on that port

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with clear messages
4. Push and create a pull request

## License

MIT License - Feel free to use this project

## Support

Need help? Check the docs or open an issue in the repository.

---

**Built with ❤️**
