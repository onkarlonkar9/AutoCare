# Quick MongoDB Replica Set Setup

## Option 1: Using Docker (Easiest - 2 commands)

If you have Docker installed, open PowerShell and run:

```powershell
# Start MongoDB with replica set
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0

# Initialize replica set
docker exec mongodb-rs mongosh --eval "rs.initiate()"
```

That's it! Your MongoDB is now ready with replica set.

### To stop it later:
```powershell
docker stop mongodb-rs
docker rm mongodb-rs
```

---

## Option 2: Using Local MongoDB (Without stopping service)

If you have MongoDB Compass installed, MongoDB is already running. Just initialize the replica set:

Open PowerShell and run:
```powershell
mongosh
```

In the mongosh shell, paste:
```javascript
rs.initiate()
```

Then verify:
```javascript
rs.status()
```

You should see `"set": "rs0"` in the output.

Exit with:
```javascript
exit()
```

---

## Option 3: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up free
3. Create a free tier cluster (takes ~5 minutes)
4. Get connection string
5. Update `backend/.env`:
   ```
   DATABASE_URL="mongodb+srv://username:password@yourcluster.mongodb.net/autocare_ai"
   ```

---

## Test Your Setup

After any option above, run:

```powershell
cd D:\autocare-ai\backend
npm run dev
```

Then try creating an account. It should work!

Let me know which option you choose!
