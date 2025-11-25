# Sip and Snacks Backend API

Backend API server for the Sip and Snacks ordering system using Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database:**
   - Create a new PostgreSQL database named `sipandsnacks`
   - Or modify the database name in `.env` file

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sipandsnacks
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   ```

4. **Initialize the database:**
   ```bash
   npm run init-db
   ```
   This will:
   - Create all necessary tables
   - Insert default admin user (username: admin, password: admin123)
   - Insert default employees, tea items, and snack items

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify authentication token

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add employee (Admin only)
- `PUT /api/employees/:id` - Update employee (Admin only)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Tea Items
- `GET /api/tea-items` - Get all tea items
- `POST /api/tea-items` - Add tea item (Admin only)
- `PUT /api/tea-items/:id` - Update tea item (Admin only)
- `DELETE /api/tea-items/:id` - Delete tea item (Admin only)

### Snack Items
- `GET /api/snack-items` - Get all snack items
- `POST /api/snack-items` - Add snack item (Admin only)
- `PUT /api/snack-items/:id` - Update snack item (Admin only)
- `DELETE /api/snack-items/:id` - Delete snack item (Admin only)

### Orders
- `GET /api/orders` - Get all orders (supports query params: `fromDate`, `toDate`)
- `GET /api/orders/today` - Get today's orders
- `POST /api/orders` - Create new order

## Database Schema

The database includes the following tables:
- `admin_users` - Admin authentication
- `employees` - Employee list
- `tea_items` - Tea menu items
- `snack_items` - Snack menu items
- `orders` - Order records

## Security

- Admin routes are protected with JWT authentication
- Passwords are hashed using bcrypt
- CORS is enabled for frontend communication

## Default Credentials

- **Username:** admin
- **Password:** admin123

**⚠️ Change these credentials in production!**

