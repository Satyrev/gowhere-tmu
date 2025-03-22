# GoWhere Campus Navigation

A campus navigation application built with React, Express, and MongoDB. This app helps users navigate between campus buildings and classrooms, showing walking routes on a map.

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account (or local MongoDB installation)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Satyrev/gowhere-tmu
   cd gowhere-tmu
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string with your credentials

4. Add MapBox token to Map.tsx

5. Start the development servers
   ```
   npm run dev
   ```

## Available Scripts

### `npm run dev`

Runs both the React frontend and Express backend concurrently.
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)

### `npm start`

Runs only the React frontend in development mode.

### `npm run server`

Runs only the Express backend server.