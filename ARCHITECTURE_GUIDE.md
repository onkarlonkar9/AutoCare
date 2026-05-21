# AutoCare AI - Architecture & Integration Guide

## System Architecture

```
┌─────────────────────┐
│  Frontend (Vite)    │
│ http://localhost:3  │
│       000           │
└──────────┬──────────┘
           │
           │ VITE_API_URL=
           │ http://localhost:4000/api
           │
           ▼
┌─────────────────────────────────────┐
│   Backend (Express)                 │
│   http://localhost:4000             │
│   CORS origin: http://localhost:    │
│              3000                   │
└──────────┬──────────────────────────┘
           │
           │ DATABASE_URL=
           │ mongodb://localhost:27017/
           │ autocare_ai
           │
           ▼
┌─────────────────────────────────────┐
│   MongoDB Replica Set (rs0)         │
│   Port: 27017                       │
│   Database: autocare_ai             │
└─────────────────────────────────────┘
```

---

## Backend API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/signup` | Create new account | `{name, email, password, role}` | `{token, user}` |
| POST | `/login` | Login with credentials | `{email, password}` | `{token, user}` |
| GET | `/me` | Get current user (requires auth) | - | `{user}` |
| GET | `/google/start` | Start OAuth flow | `?intent=signup&role=owner` | Redirect to Google |
| GET | `/google/callback` | OAuth callback | (auto) | Redirect to frontend with token |

### Service Routes
- **Owner Routes** (`/api/owner`): Vehicles, service records management
- **Service Center Routes** (`/api/service-center`): Job cards, mechanics, customers
- **AI Routes** (`/api/ai`): AI-powered predictions and insights
- **Health Check** (`/health`): System status

---

## Frontend Configuration Files

### Frontend Environment (frontend/.env)
```
VITE_API_URL="http://localhost:4000/api"
```

### Frontend API Client (frontend/src/integrations/backend/client.ts)
- Exports: `API_BASE_URL`, `apiRequest()`
- Automatically adds Bearer token to requests
- Handles error extraction and response validation

### Frontend Auth Context (frontend/src/contexts/AuthContext.tsx)
- Provides: `useAuth()` hook
- Methods: `signup()`, `login()`, `logout()`, `refreshProfile()`
- Stores token in localStorage: `autocare_backend_token`

---

## Backend Configuration Files

### Backend Environment (backend/.env)
```
DATABASE_URL="mongodb://localhost:27017/autocare_ai"
PORT="4000"
JWT_SECRET="change_me_to_long_random_string"
CORS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"
AI_GATEWAY_URL=""
AI_GATEWAY_API_KEY=""
AI_GATEWAY_MODEL="google/gemini-3-flash-preview"
```

### Backend Server (backend/src/server.ts)
- Port: 4000
- Middleware: CORS, Helmet, Morgan logging, Cookie parser
- Static files: `/uploads` → `backend/uploads/`

### Backend Auth Routes (backend/src/routes/auth.ts)
- Signup: Creates user with password hash (bcrypt)
- Login: Validates credentials
- Google OAuth: Creates/updates user on OAuth callback
- JWT: 30-day expiration (configured in JWT service)

---

## Database Schema (Prisma/MongoDB)

### Core Models
```
User
├── id (ObjectId)
├── name, email, phone, avatarUrl
├── passwordHash, role (admin|owner|service_center)
├── planName, subscription, trialEndsAt
├── createdAt, updatedAt
└── Relations: vehicles, serviceRecords, mechanics, customers, jobCards

Vehicle
├── id, ownerId
├── name, vehicleNumber, type, manufacturer, model
├── fuelType, engineNumber, chassisNumber, currentMileage
├── healthScore, nextServiceDate, insuranceExpiry, pucExpiry
└── Relations: owner (User), serviceRecords

ServiceRecord
├── id, vehicleId, ownerId
├── serviceType, date, mileageAtService
├── serviceCenterName, mechanicName, cost
├── partsReplaced[], billUrl, notes
└── Relations: vehicle, owner

JobCard
├── id, centerId, customerName, vehicleNumber
├── mileage, problemDescription, serviceTasks[]
├── estimatedCost, actualCost, mechanicId
├── status (pending|in_progress|waiting_parts|completed|delivered)
└── Relations: center (User), mechanic

Mechanic, Customer, ServiceCenterConfig
└── Related to service center operations
```

---

## Data Flow: Account Creation

```
1. USER INPUT
   ├─ Name, Email, Password, Role (Owner/ServiceCenter)
   └─ Submit from Signup.tsx

2. FRONTEND (frontend/src/pages/Signup.tsx)
   ├─ useAuth().signup() called
   └─ Calls apiRequest('/auth/signup', {POST, body})

3. API REQUEST (frontend/src/integrations/backend/client.ts)
   ├─ Adds: Content-Type: application/json
   ├─ Adds: Authorization: Bearer <token> (if available)
   └─ fetch(http://localhost:4000/api/auth/signup)

4. BACKEND (backend/src/routes/auth.ts::POST /signup)
   ├─ Validate input with Zod schema
   ├─ Check if email exists: prisma.user.findUnique({email})
   ├─ Hash password: bcrypt.hash(password, 12)
   ├─ Create user: prisma.user.create({...})
   ├─ Sign JWT: signToken({sub: user.id, role})
   └─ Return: {token, user}

5. PRISMA → MONGODB
   ├─ Connect to mongodb://localhost:27017/autocare_ai
   ├─ Use replica set for transaction safety
   └─ Insert User document

6. RESPONSE
   ├─ Backend returns token + user object
   ├─ Frontend stores token in localStorage
   ├─ Frontend updates AuthContext
   └─ User redirected to dashboard

⚠️  FAILS AT STEP 5 IF MongoDB NOT REPLICA SET
    Error: "Prisma needs to perform transactions, which requires 
            your MongoDB server to be run as a replica set."
```

---

## Communication Verification

### Frontend → Backend Communication
✅ **CORS**: Configured to allow localhost:3000
✅ **Port**: Backend on 4000, Frontend on 3000
✅ **API URL**: frontend/.env VITE_API_URL correct
✅ **Routes**: All auth endpoints exist
✅ **Headers**: Content-Type and Authorization handled

### Backend → MongoDB Communication
❌ **CRITICAL**: MongoDB must be replica set
❌ **Current Status**: Unknown (needs verification)
❌ **Connection String**: `mongodb://localhost:27017/autocare_ai`

### Authentication Flow
✅ **Token Storage**: localStorage key `autocare_backend_token`
✅ **JWT Signing**: Configured with JWT_SECRET
✅ **Token Validation**: Middleware `requireAuth` checks Authorization header
✅ **User Hydration**: AuthContext properly stores user data

---

## Security Configuration

### CORS (Cross-Origin Resource Sharing)
```javascript
cors({
  origin: "http://localhost:3000",
  credentials: true
})
```

### Password Security
- Hash algorithm: bcrypt with 12 salt rounds
- JWT expiration: ~30 days
- Secrets: JWT_SECRET must be long random string

### Environment Variables
- Never commit `.env` file
- Use `.env.example` as template
- Critical variables: DATABASE_URL, JWT_SECRET

---

## Troubleshooting Matrix

| Issue | Cause | Check | Fix |
|-------|-------|-------|-----|
| Signup fails with no error | MongoDB not replica set | `rs.status()` | Initialize replica set |
| "Invalid credentials" on login | Wrong password/email | Check email in DB | Verify user exists in MongoDB |
| CORS error in frontend | Wrong CORS_ORIGIN | Check backend/.env | Update CORS_ORIGIN to frontend URL |
| 404 on /api/auth/signup | Backend not running | `curl localhost:4000/health` | Start backend: `npm run dev` |
| Token not stored | LocalStorage full/disabled | Check browser settings | Clear storage, enable localStorage |
| "Email already exists" | Duplicate signup attempt | Check MongoDB autocare_ai.users | Use different email or login |

---

## Development Commands

```powershell
# Backend
cd backend
npm install                 # Install dependencies
npm run dev                 # Start development server
npm run build              # Build for production
npm run prisma:generate    # Generate Prisma client
npm run prisma:push        # Sync schema with MongoDB

# Frontend
cd frontend
npm install                 # Install dependencies
npm run dev                 # Start Vite dev server
npm run build              # Build for production
npm run type-check         # Type checking

# MongoDB
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0
docker exec mongodb-rs mongosh --eval "rs.initiate()"
docker exec mongodb-rs mongosh --eval "rs.status()"
```

---

## Production Deployment Considerations

1. **MongoDB Atlas**: Use cloud-hosted MongoDB (includes replica set)
2. **Environment Variables**: Never commit secrets
3. **JWT_SECRET**: Use long random string (32+ chars)
4. **CORS_ORIGIN**: Update to production frontend URL
5. **FRONTEND_URL**: Update to production frontend URL
6. **HTTPS**: Enable SSL/TLS in production
7. **Rate Limiting**: Consider adding rate limiter middleware
8. **Input Validation**: Zod schemas already validate inputs

---

## API Testing Examples

### Signup
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "owner"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Current User (requires token from login/signup)
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <token_from_login>"
```

---

## Summary

**Frontend ↔ Backend Communication**: ✅ Properly Configured
**Backend ↔ MongoDB Communication**: ❌ **BLOCKED** (No Replica Set)

**To Fix**: Initialize MongoDB as replica set (see FIX_GUIDE.md)
