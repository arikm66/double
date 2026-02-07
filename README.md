# Full Stack App - Node.js + React/Vite

A full stack application with a Node.js/Express backend and React/Vite frontend.

## Project Structure

```
double/
├── server/          # Node.js backend
│   ├── node_modules/
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   └── package.json
└── client/          # React/Vite frontend
    ├── node_modules/
    ├── public/
    ├── src/
    ├── .gitignore
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Server Setup (Node.js + Express)

### Dependencies Installed:
- **express** - Web framework
- **cors** - Enable Cross-Origin Resource Sharing
- **dotenv** - Environment variables management
- **nodemon** (dev) - Auto-restart server on changes

### Server Scripts:
```bash
cd server
npm run dev    # Start server with nodemon (development)
npm start      # Start server with node (production)
```

Server runs on: **http://localhost:5000**

### API Endpoints:
- `GET /` - Welcome message
- `GET /api/test` - Test endpoint

## Client Setup (React + Vite)

### Created with:
```bash
npm create vite@latest client -- --template react-swc
```

### Client Scripts:
```bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

Client runs on: **http://localhost:5173**

## Running the Full Stack App

### Option 1: Run in separate terminals

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

### Option 2: Run both (requires installation of concurrently)

You can install `concurrently` to run both server and client from the root:

```bash
# In root directory
npm init -y
npm install concurrently

# Add to root package.json scripts:
"dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\""

# Then run:
npm run dev
```

## Environment Variables

### Server (.env)
```
PORT=5000
```

## Testing the Connection

1. Start the server (it will run on port 5000)
2. Start the client (it will run on port 5173)
3. Open http://localhost:5173 in your browser
4. Click the "Test API Connection" button
5. You should see "API is working!" message

## Next Steps

- Add more API routes in `server/index.js`
- Create React components in `client/src/components/`
- Set up a database (MongoDB, PostgreSQL, etc.)
- Add authentication
- Deploy to production

## Additional Packages You Might Need

### Server:
```bash
cd server
npm install mongoose          # For MongoDB
npm install pg                # For PostgreSQL
npm install jsonwebtoken      # For JWT authentication
npm install bcrypt            # For password hashing
```

### Client:
```bash
cd client
npm install react-router-dom  # For routing
npm install axios             # HTTP client (alternative to fetch)
npm install @tanstack/react-query  # Data fetching and caching
```
