# Render Deployment Guide for Double Full Stack App

This guide will help you deploy your full stack (React + Express + MongoDB) app to [Render](https://render.com/).

---

## 1. Prerequisites
- A [Render](https://render.com/) account
- A [MongoDB Atlas](https://www.mongodb.com/atlas/database) cluster or Render MongoDB instance
- Your project code in a GitHub repo

---

## 2. Prepare the Codebase

### Server (Express)
- The server now uses `process.env.PORT` and serves the React build in production.
- Ensure your `.env` file contains:
  ```env
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  FIREBASE_PROJECT_ID=...
  FIREBASE_PRIVATE_KEY=...
  FIREBASE_CLIENT_EMAIL=...
  NODE_ENV=production
  ```
- Do **not** commit secrets to GitHub! Use Render's environment variables.

### Client (React)
- The client now uses `VITE_API_URL` for API requests.
- In production, set `VITE_API_URL` to your Render backend URL (e.g. `https://your-backend.onrender.com`).

---

## 3. Build & Deploy Steps

### Option 1: Single Render Web Service (Recommended)
- The Express server serves both API and static React build.
- **Steps:**
  1. In your repo root, add a `build` script to the server's `package.json`:
     ```json
     "scripts": {
       ...,
       "build": "cd ../client && npm install && npm run build"
     }
     ```
  2. Push all code to GitHub.
  3. On Render, create a new **Web Service**:
     - **Environment:** Node
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
     - **Root Directory:** `server`
     - **Environment Variables:**
       - `MONGODB_URI`, `JWT_SECRET`, `FIREBASE_*`, etc.
       - `NODE_ENV=production`
  4. Set up a **persistent disk** if you want to keep import logs.
  5. Deploy!

### Option 2: Separate Backend & Frontend Services
- Deploy Express and React separately (advanced, not recommended for most cases).
- Set `VITE_API_URL` in the client to your backend Render URL.

---

## 4. Environment Variables (Render Dashboard)
- Add all secrets from your `.env` files to the Render dashboard for your service.
- Example:
  - `MONGODB_URI=...`
  - `JWT_SECRET=...`
  - `FIREBASE_PROJECT_ID=...`
  - `FIREBASE_PRIVATE_KEY=...`
  - `FIREBASE_CLIENT_EMAIL=...`
  - `NODE_ENV=production`

---

## 5. MongoDB Setup
- Use MongoDB Atlas (recommended) or Render's managed MongoDB.
- Whitelist Render's IPs in Atlas if needed.
- Update `MONGODB_URI` accordingly.

---

## 6. Domain & HTTPS
- Add a custom domain in Render dashboard if desired.
- HTTPS is automatic.

---

## 7. Troubleshooting
- Check Render logs for errors.
- Make sure all environment variables are set.
- If CORS issues, ensure client and server URLs are correct.
- For static files, make sure the client build is in `client/dist`.

---

## 8. Useful Links
- [Render Docs: Node.js](https://render.com/docs/deploy-node)
- [Render Docs: Static Sites](https://render.com/docs/static-sites)
- [Render Docs: Environment Variables](https://render.com/docs/environment-variables)
- [MongoDB Atlas](https://www.mongodb.com/atlas/database)

---

## 9. Quick Checklist
- [ ] All secrets in Render env vars
- [ ] MongoDB URI set
- [ ] Client build script works
- [ ] Server serves client build in production
- [ ] GitHub repo connected to Render
- [ ] Test after deploy!

---

**You are ready to deploy!**
