# Maintenance App (React Frontend)

This package now talks to a bespoke REST API backed by MySQL instead of Supabase. The API lives in the sibling `../server` directory.

## Prerequisites

- Node.js 18+
- npm 9+
- Running API server (see `../server`)

## Environment variables

Copy `.env` and set the API base URL, for example:

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## Install dependencies

```
npm install
```

## Start the dev server

```
npm start
```

The React app expects the API server to be available at `REACT_APP_API_BASE_URL` for login, request submission, and status updates.
