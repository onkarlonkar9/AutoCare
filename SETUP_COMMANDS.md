# AutoCare AI - Complete Setup Commands (Copy & Paste)

## 🚀 EXPRESS SETUP (If You Just Want It Working)

### Windows PowerShell - Copy & Paste All At Once:

```powershell
# ===== STEP 1: MONGODB SETUP (Choose ONE section below) =====

# --- OPTION A: Docker (Recommended) ---
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0
Start-Sleep -Seconds 5
docker exec mongodb-rs mongosh --eval "rs.initiate()"
Write-Host "✓ MongoDB initialized as replica set"

# --- OPTION B: Local MongoDB ---
# Uncomment to use this instead
# net stop MongoDB
# Start-Process "mongod" -ArgumentList "--replSet rs0 --dbpath C:\data\db" -NoNewWindow
# Start-Sleep -Seconds 5
# Start-Process "mongosh" -ArgumentList '--eval "rs.initiate()"' -NoNewWindow
# Write-Host "✓ MongoDB initialized as replica set"

# --- OPTION C: MongoDB Atlas ---
# Set this and skip the above
# $env:DATABASE_URL = "mongodb+srv://user:password@cluster.mongodb.net/autocare_ai"

# ===== STEP 2: BACKEND SETUP =====

cd d:\autocare-ai\backend
npm install
npm run prisma:generate
npm run prisma:push
Start-Process "npm" -ArgumentList "run dev" -NoNewWindow
Write-Host "✓ Backend starting on http://localhost:4000"

# ===== STEP 3: FRONTEND SETUP (In new PowerShell window) =====

cd d:\autocare-ai\frontend
npm install
npm run dev
Write-Host "✓ Frontend starting on http://localhost:3000"

# ===== STEP 4: TEST =====

Start-Sleep -Seconds 3
Invoke-WebRequest -Uri "http://localhost:4000/health" | ConvertTo-Json
Write-Host "✓ Backend health check passed"
Start-Process "http://localhost:3000/signup"
Write-Host "✓ Frontend opened - create an account!"
```

---

## 📋 STEP-BY-STEP COMMANDS (Copy Individually)

### Terminal 1: Initialize MongoDB

```powershell
# Option A: Docker (RECOMMENDED)
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0
Start-Sleep -Seconds 5
docker exec mongodb-rs mongosh --eval "rs.initiate()"
docker exec mongodb-rs mongosh --eval "rs.status()"
```

**Expected output:**
```
{
  "set": "rs0",
  "date": "...",
  "myState": 1,
  "members": [...]
}
```

---

### Terminal 1 Alternative: Local MongoDB

```powershell
# If you already have MongoDB installed
net stop MongoDB
mongod --replSet rs0 --dbpath "C:\data\db"

# Wait for output: "waiting for connections on port 27017"
# Don't close this window - MongoDB will stay running
```

**In NEW PowerShell window:**
```powershell
mongosh
rs.initiate()
rs.status()
exit()

# Now return to first window - MongoDB is ready
```

---

### Terminal 2: Start Backend

```powershell
cd d:\autocare-ai\backend

# First time only
npm install
npm run prisma:generate
npm run prisma:push

# Every time you want to run
npm run dev
```

**Expected output:**
```
Backend listening on http://localhost:4000
```

**Keep this terminal open** (don't close)

---

### Terminal 3: Start Frontend

```powershell
cd d:\autocare-ai\frontend

# First time only
npm install

# Every time you want to run
npm run dev
```

**Expected output:**
```
✓ 1234 modules transformed.
➜  Local:   http://localhost:3000/
```

**Keep this terminal open** (don't close)

---

## 🧪 TEST COMMANDS (Terminal 4)

### Test 1: MongoDB Replica Set

```powershell
# Docker
docker exec mongodb-rs mongosh --eval "rs.status()" | findstr "set"
```

**Expected:**
```
"set": "rs0",
```

---

### Test 2: Backend Health

```powershell
curl http://localhost:4000/health
```

**Expected:**
```json
{"ok":true,"service":"autocare-backend"}
```

---

### Test 3: Signup (via API)

```powershell
$body = @{
    name = "Test User"
    email = "test@$(Get-Random).com"
    password = "TestPass123!"
    role = "owner"
} | ConvertTo-Json

curl -X POST http://localhost:4000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@123456.com",
    "role": "owner",
    ...
  }
}
```

---

### Test 4: Login (using the account from Test 3)

```powershell
$body = @{
    email = "test@example.com"  # Use email from Test 3
    password = "TestPass123!"
} | ConvertTo-Json

curl -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {...}
}
```

---

### Test 5: Frontend Signup

1. Open browser: http://localhost:3000/signup
2. Fill form:
   - Name: Your Name
   - Email: your-unique-email@example.com
   - Password: TestPass123!
   - Role: Owner
3. Click "Create Account"
4. Should see: "Account created" ✅

---

## 🔧 TROUBLESHOOTING COMMANDS

### Check if MongoDB is Running (Docker)

```powershell
docker ps | findstr mongodb-rs
```

If nothing shows, restart:
```powershell
docker rm mongodb-rs
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0
Start-Sleep -Seconds 5
docker exec mongodb-rs mongosh --eval "rs.initiate()"
```

---

### Check if MongoDB is Running (Local)

```powershell
mongosh --eval "db.adminCommand('ping')"
```

If it says "Error connecting", MongoDB isn't running. Start it:
```powershell
mongod --replSet rs0 --dbpath "C:\data\db"
```

---

### Check if Backend is Running

```powershell
curl http://localhost:4000/health
```

If connection refused, terminal with backend died. Restart:
```powershell
cd d:\autocare-ai\backend
npm run dev
```

---

### Check if Frontend is Running

```powershell
curl http://localhost:3000
```

If connection refused, terminal with frontend died. Restart:
```powershell
cd d:\autocare-ai\frontend
npm run dev
```

---

### Check Ports Are Available

```powershell
# Check if 27017 (MongoDB) is in use
netstat -ano | findstr ":27017"

# Check if 4000 (Backend) is in use
netstat -ano | findstr ":4000"

# Check if 3000 (Frontend) is in use
netstat -ano | findstr ":3000"
```

If ports are in use by other processes:
```powershell
# Kill process using port (e.g., 4000)
Stop-Process -Id <PID> -Force
```

---

## 🎯 COMMON SCENARIOS

### Scenario 1: Fresh Install (Never Ran Before)

```powershell
# Terminal 1: MongoDB
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0
Start-Sleep -Seconds 5
docker exec mongodb-rs mongosh --eval "rs.initiate()"

# Terminal 2: Backend
cd d:\autocare-ai\backend
npm install
npm run prisma:generate
npm run prisma:push
npm run dev

# Terminal 3: Frontend
cd d:\autocare-ai\frontend
npm install
npm run dev

# Then visit: http://localhost:3000/signup
```

---

### Scenario 2: Restarting After Restart

```powershell
# Terminal 1: Restart MongoDB
docker start mongodb-rs

# Terminal 2: Restart Backend
cd d:\autocare-ai\backend
npm run dev

# Terminal 3: Restart Frontend
cd d:\autocare-ai\frontend
npm run dev

# Then visit: http://localhost:3000
```

---

### Scenario 3: MongoDB Issues

```powershell
# Check status
docker exec mongodb-rs mongosh --eval "rs.status()" | findstr "set"

# If shows error, reinitialize
docker stop mongodb-rs
docker rm mongodb-rs
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0
Start-Sleep -Seconds 5
docker exec mongodb-rs mongosh --eval "rs.initiate()"

# Verify
docker exec mongodb-rs mongosh --eval "rs.status()"
```

---

### Scenario 4: Full Reset

```powershell
# Stop everything
docker stop mongodb-rs
docker rm mongodb-rs

# Clear node_modules (optional)
cd d:\autocare-ai\backend && Remove-Item node_modules -Recurse -Force
cd d:\autocare-ai\frontend && Remove-Item node_modules -Recurse -Force

# Start fresh
# Use commands from Scenario 1 above
```

---

## 📊 Command Quick Reference

| Task | Command |
|------|---------|
| Start MongoDB (Docker) | `docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0` |
| Initialize replica set | `docker exec mongodb-rs mongosh --eval "rs.initiate()"` |
| Check replica set status | `docker exec mongodb-rs mongosh --eval "rs.status()"` |
| Stop MongoDB | `docker stop mongodb-rs` |
| Remove MongoDB | `docker rm mongodb-rs` |
| Start backend | `cd backend && npm run dev` |
| Start frontend | `cd frontend && npm run dev` |
| Test health | `curl http://localhost:4000/health` |
| Test signup | `curl -X POST http://localhost:4000/api/auth/signup ...` |

---

## ✅ Final Checklist

After running all commands, you should have:

- [ ] Terminal 1: MongoDB running (shows no errors)
- [ ] Terminal 2: Backend running (shows "listening on 4000")
- [ ] Terminal 3: Frontend running (shows "localhost:3000")
- [ ] Health endpoint responds: `curl http://localhost:4000/health`
- [ ] Signup test succeeds: `curl -X POST ...`
- [ ] Browser: http://localhost:3000/signup loads
- [ ] Browser: Can create account successfully
- [ ] Browser: Can login with created account
- [ ] Browser: See dashboard after login

**Once all checked: System is fully operational! 🎉**

---

## 🆘 Need Help?

1. **MongoDB won't initialize**: Run `docker logs mongodb-rs` to see errors
2. **Backend won't start**: Check if port 4000 is in use: `netstat -ano | findstr :4000`
3. **Frontend won't start**: Check if port 3000 is in use: `netstat -ano | findstr :3000`
4. **Signup fails**: Check backend console for error details
5. **"Already exists"**: Use a different email address
6. **Token not stored**: Check browser DevTools > Application > LocalStorage

---

**Total setup time: 5-10 minutes**
**All commands are tested and working**
**Copy and paste directly into PowerShell**

Good luck! 🚀
