# MongoDB Replica Set Setup Guide

## Problem
Prisma with MongoDB requires a replica set for transactional operations. Without it, you get:
```
PrismaClientKnownRequestError: Prisma needs to perform transactions, 
which requires your MongoDB server to be run as a replica set.
```

## Solution 1: Setup MongoDB Replica Set (Recommended for Development)

### On Windows (with MongoDB installed):

1. **Stop the MongoDB service if running:**
   ```powershell
   net stop MongoDB
   ```

2. **Start MongoDB in replica set mode:**
   ```powershell
   mongod --replSet rs0 --dbpath "C:\data\db"
   ```
   
   (Adjust the dbpath if your MongoDB data directory is different)

3. **Open a new terminal and initialize the replica set:**
   ```powershell
   mongosh
   ```

4. **In the MongoDB shell, run:**
   ```javascript
   rs.initiate()
   ```

5. **Verify it's working:**
   ```javascript
   rs.status()
   ```
   
   You should see output with `"set": "rs0"` and your instance listed as PRIMARY.

### On Windows (with MongoDB Docker):

If you prefer Docker, run:
```bash
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0
docker exec mongodb-rs mongosh --eval "rs.initiate()"
```

### On Mac/Linux:

```bash
# Using Homebrew (Mac)
brew services stop mongodb-community
mongod --replSet rs0 --dbpath /usr/local/var/mongodb

# Or Docker (any OS)
docker run -d -p 27017:27017 --name mongodb-rs mongo:latest mongod --replSet rs0
docker exec mongodb-rs mongosh --eval "rs.initiate()"
```

## Solution 2: Use MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/products/platform/atlas
2. Create a free tier cluster
3. Get your connection string (it will be a replica set by default)
4. Update `DATABASE_URL` in `backend/.env`:
   ```
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/autocare_ai"
   ```

## Solution 3: Disable Implicit Transactions (Not Recommended)

If you absolutely cannot setup a replica set, you can modify the code to avoid implicit transactions. However, this is not recommended for production.

## Verification

After setup, verify the connection works:

```bash
cd backend
npm run prisma:generate
npm run prisma:push
npm run dev
```

Then try creating an account in the app. It should work now.

## References
- https://www.prisma.io/docs/reference/database-reference/supported-databases
- https://docs.mongodb.com/manual/replication/
- https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/
