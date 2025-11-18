# Maintenance Request API Server

REST API server for the Maintenance Request application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=maintenance_db
```

3. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Database Schema Required

The server expects the following tables:
- `users` (user_id, user_email, user_password, user_name, user_role)
- `roles` (role_id, role_name)
- `requests` (request_id, title, description, location_building, room_number, user_id, request_role, status, created_at)

## API Endpoints

- `GET /api/test-db` - Test database connection
- `POST /api/login` - User login
- `GET /api/roles` - Get all roles
- `GET /api/requests` - Get requests (filtered by user role)
- `POST /api/requests` - Create new request
- `PATCH /api/requests/:id/status` - Update request status
- `PATCH /api/requests/:id/role` - Assign role to request
