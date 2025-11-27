# 🗄️ How to Get MongoDB URI - Step by Step

## Method 1: From Existing MongoDB Atlas Account

### Step 1: Login
Go to: https://cloud.mongodb.com/
- Sign in with your credentials

### Step 2: Find Your Cluster
- You'll see your dashboard
- Look for your cluster (usually named "Cluster0" or similar)
- It shows a green "Connect" button

### Step 3: Click Connect
- Click the **"Connect"** button on your cluster
- A popup will appear with connection options

### Step 4: Choose Connection Method
- Click **"Connect your application"**
- (NOT "Connect with MongoDB Compass" or "Connect with MongoDB Shell")

### Step 5: Select Driver
- Driver: **Node.js**
- Version: **5.5 or later** (or latest)

### Step 6: Copy Connection String
You'll see a connection string like this:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 7: Modify the Connection String

**Replace these parts:**

1. **`<username>`** - Your database username (NOT your Atlas login email)
2. **`<password>`** - Your database user password (NOT your Atlas login password)
3. **Add database name** before the `?`:

**Before:**
```
mongodb+srv://myuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**After:**
```
mongodb+srv://myuser:MyPassword123@cluster0.xxxxx.mongodb.net/trading-signals?retryWrites=true&w=majority
```

---

## Method 2: Create New Database User (If Needed)

If you don't remember your database password:

### Step 1: Go to Database Access
- In MongoDB Atlas dashboard
- Click **"Database Access"** in left sidebar (under SECURITY)

### Step 2: Add New User or Edit Existing
- Click **"Add New Database User"** OR
- Click **"Edit"** on existing user

### Step 3: Set Credentials
- **Username:** `tradinguser` (or any name)
- **Password:** Click "Autogenerate Secure Password" 
- **COPY THE PASSWORD** - you won't see it again!
- **Database User Privileges:** Select "Read and write to any database"

### Step 4: Save
- Click **"Add User"** or **"Update User"**

---

## Method 3: Check Network Access

Make sure your IP is whitelisted:

### Step 1: Go to Network Access
- Click **"Network Access"** in left sidebar (under SECURITY)

### Step 2: Add IP Address
- Click **"Add IP Address"**
- Click **"Allow Access from Anywhere"**
- Or enter: `0.0.0.0/0`
- Description: `Allow all for Vercel`
- Click **"Confirm"**

---

## ✅ Final Connection String Format

Your final URI should look exactly like this:

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.xxxxx.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://tradinguser:MySecurePass123@cluster0.abc123.mongodb.net/trading-signals?retryWrites=true&w=majority
```

**Parts explained:**
- `tradinguser` = your database username
- `MySecurePass123` = your database password
- `cluster0.abc123.mongodb.net` = your cluster address
- `trading-signals` = database name (you choose this)

---

## 🚨 Common Issues

### Issue 1: "Authentication failed"
- Wrong username or password
- Create new database user with known password

### Issue 2: "Connection timeout"
- IP not whitelisted
- Add `0.0.0.0/0` to Network Access

### Issue 3: "Cannot connect"
- Check if cluster is active (not paused)
- Verify connection string format

---

## 📞 Need Help?

If you're stuck:
1. Take a screenshot of your MongoDB Atlas dashboard
2. Tell me what step you're on
3. I'll guide you through it

---

## 🎯 Quick Links

- MongoDB Atlas Login: https://cloud.mongodb.com/
- MongoDB Atlas Register: https://www.mongodb.com/cloud/atlas/register
- MongoDB Documentation: https://docs.mongodb.com/

---

**Once you have your URI, copy it and we'll add it to Vercel!**
