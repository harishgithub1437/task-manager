# Notes App - Full Stack Assignment

A full-stack note-taking application with email/OTP authentication and Google login.

## Features

- ✅ Email + OTP signup/login with validation
- ✅ Google OAuth login
- ✅ JWT authentication
- ✅ Create and delete notes
- ✅ Mobile-friendly responsive design
- ✅ Error handling and validation

## Quick Start

### Backend (Port 4000)
```bash
cd server
npm install
npm run dev
```

### Frontend (Port 5173)
```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=4000
JWT_SECRET=please_change_this_secret_in_production
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Client (.env)
```
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Usage

1. Open http://localhost:5173
2. Sign up with email + OTP (OTP shown in dev mode)
3. Or use Google login (requires GOOGLE_CLIENT_ID)
4. Create and manage your notes

## API Endpoints

- `POST /auth/request-otp` - Request OTP for email
- `POST /auth/verify-otp` - Verify OTP and login
- `POST /auth/google` - Google OAuth login
- `GET /notes` - Get user notes (requires JWT)
- `POST /notes` - Create note (requires JWT)
- `DELETE /notes/:id` - Delete note (requires JWT)

## Tech Stack

**Backend:** Node.js, Express, JWT, bcrypt, Google Auth Library
**Frontend:** React, Vite, React Router, Tailwind CSS
**Storage:** JSON files (development)


