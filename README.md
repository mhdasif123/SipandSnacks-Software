# 🍵 Sip & Snacks - Tea & Snacks Ordering System

A modern web application for managing tea and snack orders in a company. Employees can place orders, and admins can manage orders, employees, and menu items.

## ✨ Features

- 📝 **Order Management**: Employees can place orders for tea and snacks
- 👥 **Employee Management**: Add, edit, and delete employees
- ☕ **Menu Management**: Manage tea items and snack items with prices
- 📊 **Today's Summary**: Real-time summary of today's orders
- 📈 **Admin Dashboard**: Comprehensive admin panel with analytics
- 🔐 **Admin Authentication**: Secure admin login system
- 📤 **Export Options**: Export orders to Excel and PDF
- 📱 **WhatsApp Integration**: Generate WhatsApp messages for order summaries
- 🎨 **Modern UI**: Beautiful and responsive user interface

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SipandSnacks
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Setup environment variables**
   
   Create `backend/.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sipandsnacks
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   DB_SSL=false
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=5000
   ```

5. **Initialize database**
   ```bash
   cd backend
   npm run init-db
   ```

6. **Start development servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📚 Documentation

For complete deployment guide and free hosting instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔑 Default Credentials

- **Admin Username**: `admin`
- **Admin Password**: `admin123`

⚠️ **Change these credentials in production!**

## 🛠️ Available Scripts

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run init-db` - Initialize database with schema and default data
- `npm run test-db` - Test database connection
- `npm run check-env` - Check environment variables
- `npm run cleanup-orders` - Cleanup old orders manually

## 📁 Project Structure

```
SipandSnacks/
├── backend/           # Backend API server
│   ├── config/        # Database configuration
│   ├── database/      # Database schema and migrations
│   ├── middleware/    # Authentication middleware
│   ├── routes/        # API routes
│   ├── scripts/       # Utility scripts
│   └── server.js      # Express server
├── src/               # React frontend
│   ├── components/    # React components
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/            # Static files
└── build/             # Production build (generated)
```

## 🔒 Security Features

- JWT-based authentication for admin routes
- Bcrypt password hashing
- CORS protection
- Input validation
- SQL injection prevention (parameterized queries)

## 📊 API Endpoints

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
- `GET /api/orders` - Get all orders (with optional date filtering)
- `GET /api/orders/today` - Get today's orders
- `POST /api/orders` - Create new order
- `DELETE /api/orders/:id` - Delete order (Admin only)

## 🎨 Technologies Used

### Frontend
- React 18
- TypeScript
- React Router
- Lucide React (Icons)
- jsPDF (PDF export)
- XLSX (Excel export)

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (Authentication)
- Bcrypt (Password hashing)
- CORS

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists
- Check firewall settings

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using the port

### Build Errors
- Delete `node_modules` and reinstall
- Clear npm cache: `npm cache clean --force`
- Check Node.js version compatibility

## 📝 License

This project is open source and available for use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Screenshorts
(Screenshorts/1.png)


