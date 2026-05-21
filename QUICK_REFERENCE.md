# AutoCare AI - Quick Reference Checklist

## 🔴 THE PROBLEM
MongoDB is not a replica set → Signup/Login fail → No accounts can be created

## 🟢 THE SOLUTION
Initialize MongoDB as replica set (2 min) → Restart backend → Everything works

---

## ⚡ 5-Minute Quick Start

```powershell
# Step 1: Start MongoDB with Replica Set (Docker)
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0
Start-Sleep -Seconds 5
docker exec mongodb-rs mongosh --eval "rs.initiate()"

# Step 2: Start Backend
cd d:\autocare-ai\backend
npm install
npm run prisma:generate
npm run prisma:push
npm run dev

# Step 3: Test Backend
curl http://localhost:4000/health

# Step 4: Start Frontend (new terminal)
cd d:\autocare-ai\frontend
npm install
npm run dev

# Step 5: Test Signup
# Open http://localhost:3000/signup and create account
```

---

## 📋 Detailed Setup

### MongoDB Setup (Choose One)

#### Docker (Easiest)
```powershell
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0
Start-Sleep -Seconds 5
docker exec mongodb-rs mongosh --eval "rs.initiate()"
```

#### Local MongoDB
```powershell
net stop MongoDB
mongod --replSet rs0 --dbpath "C:\data\db"

# New terminal:
mongosh
rs.initiate()
exit()
```

#### MongoDB Atlas (Cloud)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Copy connection string
4. Edit backend/.env: DATABASE_URL="mongodb+srv://..."
```

### Backend Setup
```powershell
cd d:\autocare-ai\backend
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

### Frontend Setup
```powershell
cd d:\autocare-ai\frontend
npm install
npm run dev
```

---

## ✅ Verification Tests

### Test 1: MongoDB Running
```powershell
# For Docker
docker exec mongodb-rs mongosh --eval "rs.status()" | findstr "set"
# Expected: "set": "rs0"

# For Local
mongosh --eval "rs.status()"
# Expected: "set": "rs0"
```

### Test 2: Backend Health
```powershell
curl http://localhost:4000/health
# Expected: {"ok":true,"service":"autocare-backend"}
```

### Test 3: Signup API
```powershell
curl -X POST http://localhost:4000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "owner"
  }'
# Expected: {"token":"...","user":{"id":"...","name":"John Doe",...}}
```

### Test 4: Frontend Signup
```
Open: http://localhost:3000/signup
Fill form → Submit
Expected: Success, redirect to dashboard
```

---

## 🔧 Configuration Summary

### Backend URLs
- **Server**: http://localhost:4000
- **Health**: http://localhost:4000/health
- **API Base**: http://localhost:4000/api
- **Auth**: http://localhost:4000/api/auth

### Frontend URLs
- **App**: http://localhost:3000
- **Signup**: http://localhost:3000/signup
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/owner/dashboard (after login)

### Database
- **Connection**: mongodb://localhost:27017/autocare_ai
- **Replica Set**: rs0
- **Database**: autocare_ai

### API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get user (requires auth) |
| GET | /health | System status |

---

## 🚨 Troubleshooting

### "Signup fails with no error"
```powershell
# Check MongoDB is initialized
docker exec mongodb-rs mongosh --eval "rs.status()"
# Should show "set": "rs0", not error
```

### "Cannot GET /health" or connection refused
```powershell
# Check backend is running
npm run dev  # in backend folder
# Should show: Backend listening on http://localhost:4000
```

### "CORS error" in browser console
```
Check frontend/.env: VITE_API_URL="http://localhost:4000/api"
Check backend/.env: CORS_ORIGIN="http://localhost:3000"
```

### "Email already exists" error
```
This is GOOD - it means MongoDB IS working!
Use a different email to test.
```

---

## 📁 Key Files

### Backend
- `backend/.env` - Configuration
- `backend/src/server.ts` - Express server
- `backend/src/routes/auth.ts` - Auth endpoints
- `backend/prisma/schema.prisma` - Database schema

### Frontend
- `frontend/.env` - Configuration
- `frontend/src/contexts/AuthContext.tsx` - Auth logic
- `frontend/src/pages/Signup.tsx` - Signup page
- `frontend/src/integrations/backend/client.ts` - API client

---

## 🎯 Success Indicators

✅ `npm run dev` starts backend without errors
✅ Health endpoint returns `{"ok":true,...}`
✅ Signup test via curl returns token
✅ Frontend loads without console errors
✅ Can create account via UI
✅ Token stored in localStorage
✅ Can login with created account

---

## 📞 Quick Help

| Issue | Command | Expected Output |
|-------|---------|-----------------|
| Is MongoDB running? | `docker ps` | `mongodb-rs` in list |
| Is replica set ready? | `docker exec mongodb-rs mongosh --eval "rs.status()"` | `"set": "rs0"` |
| Is backend ready? | `curl http://localhost:4000/health` | `{"ok":true,...}` |
| Is frontend running? | Open http://localhost:3000 | No errors in console |

---

## 🎓 Architecture in 60 Seconds

```
Frontend (3000) 
    ↓ (fetch to http://localhost:4000/api)
Backend (4000)
    ↓ (write to database)
MongoDB Replica Set (27017)
```

Frontend & Backend are already correctly configured.
Only MongoDB needs replica set initialization.
Once done, everything works.

---

## 📚 Documentation Files

- **FINAL_DIAGNOSIS.md** - Complete technical analysis
- **FIX_GUIDE.md** - Step-by-step fix with options
- **ARCHITECTURE_GUIDE.md** - System design & API details
- **QUICK_REFERENCE.md** - This file

---

## 🚀 Status Tracker

- [ ] MongoDB initialized as replica set
- [ ] Backend `.env` verified
- [ ] `npm run dev` in backend folder
- [ ] Health endpoint responds
- [ ] Signup test via curl succeeds
- [ ] Frontend `.env` verified
- [ ] Frontend accessible at localhost:3000
- [ ] Frontend signup test succeeds
- [ ] Account created and login works
- [ ] ✅ System fully operational

---

**Estimated time to full operation: 5-10 minutes**
**Code issues: 0**
**Configuration issues: 0**
**Infrastructure issues: 1 (MongoDB replica set) - FIXABLE**

Good luck! 🚀
