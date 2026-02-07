# Authentication Setup Guide

## Prerequisites

1. **MongoDB** - Install MongoDB locally or use MongoDB Atlas (cloud)
   - Local: Download from https://www.mongodb.com/try/download/community
   - Cloud: Create free account at https://www.mongodb.com/atlas

## Setup Instructions

### 1. Install MongoDB (if using local)

**Windows:**
```bash
# Download MongoDB installer
# Install MongoDB as a service
# MongoDB will run on mongodb://localhost:27017 by default
```

**Or use MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env` file with your connection string

### 2. Update Environment Variables

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fullstack-app
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fullstack-app
JWT_SECRET=your-secret-key-change-this-in-production
```

### 3. Start the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

You should see:
```
Server is running on port 5000
MongoDB connected successfully
```

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```

Client will run on: http://localhost:5173

## Features Implemented

### Server (Backend)

#### Authentication Routes:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

#### User Model:
- Username (unique, min 3 characters)
- Email (unique, validated)
- Password (hashed with bcrypt, min 6 characters)

#### Security:
- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Protected routes with middleware

### Client (Frontend)

#### Pages:
- **Login** (`/login`) - User login form
- **Register** (`/register`) - User registration form
- **Dashboard** (`/dashboard`) - Protected user dashboard

#### Features:
- Form validation
- Error handling
- Loading states
- Protected routes
- Auto-redirect when logged in
- Persistent authentication (localStorage)
- Beautiful gradient UI

## How to Use

1. **Start both server and client**
2. **Navigate to http://localhost:5173**
3. **Register a new account:**
   - Enter username (min 3 chars)
   - Enter email
   - Enter password (min 6 chars)
   - Confirm password
4. **After registration, you'll be logged in automatically**
5. **Dashboard shows your user information**
6. **Logout redirects to login page**
7. **Login with existing credentials**

## API Testing with Postman/Thunder Client

### Register User:
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login:
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Get Current User (Protected):
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

## File Structure

```
server/
├── controllers/
│   └── authController.js      # Authentication logic
├── middleware/
│   └── authMiddleware.js      # JWT verification
├── models/
│   └── User.js                # User schema
├── routes/
│   └── auth.js                # Auth routes
├── .env                       # Environment variables
├── index.js                   # Server entry point
└── package.json

client/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Login form
│   │   ├── Register.jsx       # Registration form
│   │   ├── Dashboard.jsx      # User dashboard
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   ├── Auth.css           # Auth styling
│   │   └── Dashboard.css      # Dashboard styling
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state management
│   ├── App.jsx                # Main app with routing
│   └── main.jsx               # App entry point
└── package.json
```

## Troubleshooting

### Server won't start:
- Check if MongoDB is running
- Verify `.env` file has correct MongoDB URI
- Check if port 5000 is available

### "MongoDB connection error":
- Ensure MongoDB service is running
- Check MongoDB URI in `.env`
- For Atlas, check network access and credentials

### Authentication not working:
- Check JWT_SECRET is set in `.env`
- Clear localStorage in browser
- Check browser console for errors

### CORS errors:
- Server has CORS enabled for all origins
- If issues persist, check server console

## Next Steps

- Add password reset functionality
- Add email verification
- Add user profile editing
- Add role-based access control
- Add refresh tokens
- Add social authentication (Google, GitHub)
