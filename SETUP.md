# Complete Setup Guide - Sip and Snacks with PostgreSQL Backend

This guide will help you set up the complete application with PostgreSQL database backend.

## Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
3. **Git** (optional) - [Download](https://git-scm.com/)

## Step 1: Install PostgreSQL

### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Make sure PostgreSQL service is running

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create PostgreSQL Database

1. Open PostgreSQL command line or pgAdmin
2. Create a new database:
```sql
CREATE DATABASE sipandsnacks;
```

Or using command line:
```bash
psql -U postgres
CREATE DATABASE sipandsnacks;
\q
```

## Step 3: Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   - Edit `.env` file and update your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sipandsnacks
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password_here
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

4. **Initialize database:**
   ```bash
   npm run init-db
   ```
   
   This will create all tables and insert default data.

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   The backend should now be running on `http://localhost:5000`

## Step 4: Frontend Setup

1. **Navigate to project root (if not already there):**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   - Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend:**
   ```bash
   npm start
   ```
   
   The frontend should now be running on `http://localhost:3000`

## Step 5: Verify Installation

1. **Check backend:** Open `http://localhost:5000/api/health` in your browser
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Check frontend:** Open `http://localhost:3000` in your browser
   - Should see the order form

3. **Test admin login:**
   - Go to `http://localhost:3000/admin/login`
   - Username: `admin`
   - Password: `admin123`

## Step 6: Production Build

### Backend:
```bash
cd backend
npm start
```

### Frontend:
```bash
npm run build
```

The built files will be in the `build` folder. You can deploy this to Netlify, Vercel, or any static hosting service.

**Note:** For production deployment:
- Update `REACT_APP_API_URL` to point to your production backend URL
- Ensure your backend server is accessible from the internet
- Use HTTPS in production
- Change default admin credentials
- Use a strong JWT_SECRET

## Troubleshooting

### Database Connection Error:
- Verify PostgreSQL is running: `pg_isready` or check services
- Check database credentials in `.env`
- Ensure database `sipandsnacks` exists

### Port Already in Use:
- Change `PORT` in backend `.env` file
- Or kill the process using the port

### CORS Errors:
- Ensure backend CORS is configured correctly
- Check that frontend API URL matches backend URL

### Authentication Issues:
- Clear browser localStorage
- Verify JWT_SECRET is set correctly
- Check backend logs for errors

## Project Structure

```
SipandSnacks/
├── backend/              # Backend API server
│   ├── config/          # Database configuration
│   ├── database/        # SQL schema files
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── scripts/        # Database initialization scripts
│   └── server.js       # Main server file
├── src/                 # Frontend React app
│   ├── components/     # React components
│   ├── utils/         # Utility functions (API client)
│   └── types/         # TypeScript types
└── build/              # Production build (after npm run build)
```

## Next Steps

1. Change default admin credentials
2. Customize employee names and menu items
3. Set up SSL/HTTPS for production
4. Configure environment-specific settings
5. Set up database backups

## Support

If you encounter any issues:
1. Check the console logs (both frontend and backend)
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check network connectivity between frontend and backend

