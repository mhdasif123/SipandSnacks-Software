# 🚀 Complete Free Hosting Guide for Sip & Snacks

This guide will help you host your application completely FREE for lifetime using:
- **Vercel** (Frontend) - Free forever
- **Railway** or **Render** (Backend) - Free tier available
- **Supabase** or **Neon** (PostgreSQL Database) - Free tier available

---

## 📋 Prerequisites

1. GitHub account (free)
2. Vercel account (free)
3. Railway account (free) OR Render account (free)
4. Supabase account (free) OR Neon account (free)

---

## 🗄️ Step 1: Setup Free PostgreSQL Database

### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in:
   - Project name: `sipandsnacks`
   - Database password: (save this password!)
   - Region: Choose closest to you
4. Click "Create new project"
5. Wait for setup (takes 2-3 minutes)
6. Once ready, go to **Settings** → **Database**
7. Copy the connection string (URI format)
8. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

### Option B: Neon (Alternative)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Click "Create Project"
3. Fill in:
   - Project name: `sipandsnacks`
   - Database name: `sipandsnacks`
   - Region: Choose closest to you
4. Click "Create Project"
5. Copy the connection string from the dashboard

---

## 💻 Step 2: Setup Database

### Connect to your database and run migrations:

1. Use Supabase SQL Editor or any PostgreSQL client
2. Go to Supabase → SQL Editor → New Query
3. Copy and paste the contents of `backend/database/schema.sql`
4. Run the query to create all tables

### Initialize Database with Default Data:

1. Download/clone your project locally
2. Create `backend/.env` file with your database connection string:

```env
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=true
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

3. Run:
```bash
cd backend
npm install
npm run init-db
```

This will:
- Create all tables
- Insert default admin user (username: admin, password: admin123)
- Insert default employees, tea items, and snack items

---

## 🔧 Step 3: Deploy Backend to Railway

### Using Railway (Recommended - Easy)

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect it's a Node.js app
5. Add Environment Variables:
   - Click on your project → Variables tab
   - Add all variables from `backend/.env`:
     ```
     DB_HOST=xxx.supabase.co
     DB_PORT=5432
     DB_NAME=postgres
     DB_USER=postgres
     DB_PASSWORD=your_password
     DB_SSL=true
     JWT_SECRET=your_secret_key
     NODE_ENV=production
     PORT=5000
     ```
6. Railway will automatically deploy
7. Copy your Railway URL (looks like: `https://your-app.railway.app`)

### Alternative: Deploy to Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - Name: `sipandsnacks-backend`
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free
5. Add Environment Variables (same as Railway)
6. Click "Create Web Service"
7. Copy your Render URL (looks like: `https://your-app.onrender.com`)

**Important for Render:** 
- Free tier sleeps after 15 mins of inactivity
- First request may take 30-60 seconds to wake up
- Consider upgrading to paid tier ($7/month) for always-on

---

## 🎨 Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project" → Import your repository
3. Configure:
   - Framework Preset: Create React App
   - Root Directory: `.` (root)
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add Environment Variable:
   - Name: `REACT_APP_API_URL`
   - Value: Your backend URL (Railway or Render) + `/api`
     - Example: `https://your-app.railway.app/api`
     - Example: `https://your-app.onrender.com/api`
5. Click "Deploy"
6. Wait for deployment (2-3 minutes)
7. Your app will be live at: `https://your-app.vercel.app`

---

## ✅ Step 5: Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health Check**: Visit `https://your-backend-url/api/health`
3. **Test Login**: 
   - Go to Admin Login
   - Username: `admin`
   - Password: `admin123`
4. **Test Order Creation**: Create a test order

---

## 🔒 Step 6: Security Recommendations

### 1. Change Default Admin Password

After first login:
- Go to Admin Dashboard
- Consider updating admin credentials in database directly

### 2. Update JWT Secret

Use a strong random string for `JWT_SECRET` in production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Security

- Keep your database password secure
- Don't commit `.env` files to GitHub
- Use environment variables in hosting platforms

---

## 📝 Environment Variables Summary

### Backend (Railway/Render):
```
DB_HOST=xxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=true
JWT_SECRET=your_secret_key_here
NODE_ENV=production
PORT=5000
```

### Frontend (Vercel):
```
REACT_APP_API_URL=https://your-backend-url/api
```

---

## 🆓 Free Tier Limits

### Vercel (Frontend)
- ✅ Unlimited deployments
- ✅ Custom domain (free)
- ✅ 100GB bandwidth/month
- ✅ Always on

### Railway (Backend)
- ✅ $5 free credit/month
- ✅ 500 hours compute time
- ✅ Enough for small apps

### Render (Backend - Alternative)
- ✅ 750 free hours/month
- ⚠️ Sleeps after 15 mins inactivity
- ✅ Automatic wake-up on request

### Supabase (Database)
- ✅ 500MB database storage
- ✅ 2GB bandwidth/month
- ✅ Unlimited API requests
- ✅ Always on

### Neon (Database - Alternative)
- ✅ 3GB storage (free tier)
- ✅ Automatic scaling
- ✅ Branching feature

---

## 🔄 Updating Your App

### To update backend:
1. Push changes to GitHub
2. Railway/Render will auto-deploy

### To update frontend:
1. Push changes to GitHub
2. Vercel will auto-deploy

### To update database:
- Connect via Supabase SQL Editor or psql
- Run migration scripts

---

## 🐛 Troubleshooting

### Backend not connecting to database:
- Check SSL settings (set `DB_SSL=true` for Supabase/Neon)
- Verify connection string is correct
- Check firewall/network settings

### Frontend can't reach backend:
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running (check health endpoint)

### 503 errors on Render:
- First request may take 30-60 seconds (cold start)
- Free tier sleeps after inactivity
- Consider Railway for always-on service

---

## 💡 Pro Tips

1. **Custom Domain**: Add your domain in Vercel (free SSL included)
2. **Monitoring**: Use Railway/Render logs to monitor errors
3. **Backups**: Supabase/Neon provide automatic backups
4. **Database Management**: Use Supabase dashboard for easy DB management

---

## 📞 Need Help?

If you encounter issues:
1. Check Railway/Render logs
2. Check Vercel deployment logs
3. Test backend health endpoint
4. Verify all environment variables are set

---

**🎉 Congratulations! Your app is now live and free forever!**

