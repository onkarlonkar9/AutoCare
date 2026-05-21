# AutoCare AI - Quick Fix Guide

## The Problem
Your MongoDB is not running as a replica set, blocking Prisma from writing to the database. This makes signup/login fail.

## The Solution (Choose ONE)

### 🚀 OPTION 1: Docker (Easiest - 2 Minutes)

Requirements: Docker installed

```powershell
# Start MongoDB with replica set
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0

# Initialize replica set (wait 5 seconds, then run)
Start-Sleep -Seconds 5
docker exec mongodb-rs mongosh --eval "rs.initiate()"

# Verify it's working
docker exec mongodb-rs mongosh --eval "rs.status()"
```

Then proceed to **SETUP BACKEND** section below.

---

### 💻 OPTION 2: Local MongoDB (If Already Installed - 3 Minutes)

```powershell
# Stop the MongoDB service
net stop MongoDB

# Start MongoDB in replica set mode
# Note: Adjust C:\data\db to your MongoDB data directory if different
mongod --replSet rs0 --dbpath "C:\data\db"
```

**In a NEW PowerShell window:**
```powershell
mongosh
```

**In the mongosh shell, paste:**
```javascript
rs.initiate()
rs.status()
```

You should see `"set": "rs0"` in the output.

**Exit with:**
```javascript
exit()
```

Then proceed to **SETUP BACKEND** section below.

---

### ☁️ OPTION 3: MongoDB Atlas Cloud (5 Minutes - No Local Setup)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up free (if needed)
3. Create a free tier cluster
4. Wait 5-10 minutes for cluster to initialize
5. Click "Connect" → "Drivers" → Copy connection string
6. Edit `backend/.env` and replace DATABASE_URL:
   ```
   DATABASE_URL="mongodb+srv://username:password@your-cluster.mongodb.net/autocare_ai"
   ```

Then proceed to **SETUP BACKEND** section below.

---

## 🔧 SETUP BACKEND

Once MongoDB is ready:

```powershell
# Go to backend folder
cd d:\autocare-ai\backend

# Install dependencies (if not done)
npm install

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Start backend
npm run dev
```

You should see:
```
Backend listening on http://localhost:4000
```

---

## ✅ VERIFICATION

### Test 1: Health Check
```powershell
curl http://localhost:4000/health
```

Expected response:
```json
{"ok":true,"service":"autocare-backend"}
```

### Test 2: Signup Test
```powershell
curl -X POST http://localhost:4000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "owner"
  }'
```

Expected response (success):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner"
  }
}
```

---

## 🎉 FINAL TEST: Frontend Signup

1. In a new terminal, start frontend:
   ```powershell
   cd d:\autocare-ai\frontend
   npm install
   npm run dev
   ```

2. Open http://localhost:3000/signup

3. Fill out form:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
   - Role: Owner

4. Click "Create Account"

You should see: ✅ "Account created"

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check if MongoDB is running/initialized
# Option 1 - Docker:
docker ps | findstr mongodb-rs

# Option 2 - Local MongoDB:
mongosh  # Should connect without errors
rs.status()  # Should show replica set info
```

### Signup still fails
1. Check backend console for errors
2. Verify MongoDB is initialized: `docker exec mongodb-rs mongosh --eval "rs.status()"`
3. Check firewall - MongoDB needs port 27017

### Still not working?
Share the error message from:
1. Backend console (npm run dev output)
2. Frontend browser console (F12 > Console tab)
3. MongoDB status output (rs.status())

---

## 📋 Checklist

- [ ] MongoDB initialized as replica set
- [ ] Backend `.env` has correct DATABASE_URL
- [ ] `npm install` completed in backend folder
- [ ] `npm run dev` running in backend (shows "listening on 4000")
- [ ] Health endpoint responds: `curl http://localhost:4000/health`
- [ ] Signup test succeeds via curl
- [ ] Frontend signup page loads at http://localhost:3000/signup
- [ ] Account creation succeeds in frontend UI

---

## 🎯 Summary

The issue was **MongoDB not configured as replica set**. Once you choose an option above and complete the setup, everything should work. The frontend and backend are already correctly configured - they just need a properly initialized database.

Good luck! 🚀
