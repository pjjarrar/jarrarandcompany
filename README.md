# Bids Backend Portal

Backend portal for managing bids displayed on the Jarrar & Company website.

## Features

- ExpressJS backend with SQLite database
- JWT-based authentication
- CRUD operations for bids and users
- Admin portal accessible at `/admin`
- Dynamic bids display on public bids page

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## Default Admin Credentials

- Username: `admin`
- Password: `admin`

**Important:** Change the default admin password after first login!

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user

### Bids (Public GET, Protected POST/PUT/DELETE)
- `GET /api/bids` - Get all bids
- `GET /api/bids/:id` - Get single bid
- `POST /api/bids` - Create bid (requires auth)
- `PUT /api/bids/:id` - Update bid (requires auth)
- `DELETE /api/bids/:id` - Delete bid (requires auth)

### Users (All Protected)
- `GET /api/users` - Get all users (requires auth)
- `GET /api/users/:id` - Get single user (requires auth)
- `POST /api/users` - Create user (requires auth)
- `PUT /api/users/:id` - Update user (requires auth)
- `DELETE /api/users/:id` - Delete user (requires auth)

## Admin Portal

Access the admin portal at `http://localhost:3000/admin`

The admin portal allows you to:
- Manage bids (create, edit, delete)
- Manage users (create, edit, delete)
- View all bids and users in a table format

## Bid Form Features

- Status dropdown with "Active" and "Not Active" options
- Auto-filled estimator fields (Moe Naeem, mnaeem@jarrarandcompany.com) - editable
- Color-coded status badges (green for Active, red for Not Active)

## Database

The SQLite database (`database.db`) is automatically created on first run. It includes:
- `users` table for user management
- `bids` table for bid management

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours
- Protected routes require valid JWT token
- Change the JWT_SECRET in production (set via JWT_SECRET environment variable)

