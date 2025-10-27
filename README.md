# Sip and Snacks - Tea & Snacks Ordering System

A comprehensive ordering system for company employees to order tea and snacks, with admin management capabilities.

## Features

### Employee Features
- **No Login Required**: Employees can order directly without authentication
- **Order Form**: Simple form with dropdown selections for employees, tea, and snacks
- **Amount Validation**: Automatic calculation with ₹25 maximum limit per order
- **Auto-filled Date/Time**: Current date and time automatically populated
- **Mobile-Friendly**: Responsive design for mobile devices

### Admin Features
- **Secure Login**: Admin authentication system
- **Order Management**: View all orders with date range filtering
- **Master Data Management**: Add/edit employees, tea items, and snack items
- **Reports & Export**: Generate Excel and PDF reports
- **WhatsApp Integration**: Generate formatted messages for WhatsApp groups
- **Dashboard Analytics**: Summary cards with key metrics

### Today's Order Summary
- **Real-time Updates**: Live date and time display
- **Item Counts**: Separate counts for tea and snack items
- **Export Options**: Excel and PDF export functionality
- **WhatsApp Message**: Copy formatted message to clipboard

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Storage**: Local Storage (can be easily migrated to database)
- **Export**: jsPDF for PDF, SheetJS for Excel
- **Styling**: Custom CSS with responsive design

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Default Credentials

- **Admin Username**: `admin`
- **Admin Password**: `admin123`

## Default Data

The system comes pre-loaded with:

### Employees
- John Doe
- Jane Smith
- Mike Johnson
- Sarah Wilson
- David Brown

### Tea Items
- Tea (₹5)
- Coffee (₹8)
- Black Coffee (₹8)
- Green Tea (₹6)
- Masala Chai (₹7)

### Snack Items
- Samosa (₹10)
- Kayibhaji (₹12)
- Mullak Bhaji (₹15)
- Egg Bhaji (₹18)
- Sugiyan (₹8)
- Vada (₹6)
- Pakora (₹10)

## Usage

### For Employees
1. Navigate to the main page
2. Fill out the order form:
   - Select your name from the dropdown
   - Choose tea item
   - Choose snack item
   - Review the total amount (auto-calculated)
3. Submit the order

### For Admins
1. Click "Admin Login" in the header
2. Enter credentials (admin/admin123)
3. Access the dashboard with multiple tabs:
   - **Orders**: View and filter orders, export reports
   - **Employees**: Add/edit/delete employee names
   - **Tea Items**: Manage tea menu items
   - **Snack Items**: Manage snack menu items

### WhatsApp Integration
1. Go to "Today's Summary" or Admin Dashboard
2. Click "Generate WhatsApp Message"
3. The formatted message will be copied to clipboard
4. Paste in your WhatsApp group

Example WhatsApp message format:
```
Today's Order Summary (12/1/2024):

Tea Items:
Tea - 6
Coffee - 1
Black Coffee - 1

Snacks Items:
Samosa - 3
Kayibhaji - 1
Mullak Bhaji - 1
Egg Bhaji - 2
Sugiyan - 1
```

## File Structure

```
src/
├── components/
│   ├── Header.tsx           # Navigation header
│   ├── OrderForm.tsx        # Main ordering form
│   ├── AdminLogin.tsx       # Admin authentication
│   ├── AdminDashboard.tsx   # Admin management interface
│   └── TodaysSummary.tsx    # Daily order summary
├── types/
│   └── index.ts            # TypeScript interfaces and utilities
├── App.tsx                 # Main app component with routing
├── index.tsx              # App entry point
└── index.css             # Global styles
```

## Customization

### Adding New Items
- Admins can add new tea/snack items through the dashboard
- Items are stored in local storage and persist across sessions

### Modifying Price Limits
- Edit the validation logic in `OrderForm.tsx`
- Currently set to ₹25 maximum per order

### Database Integration
- Replace localStorage calls in `types/index.ts` with API calls
- Add backend authentication for admin features
- Implement proper user management

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes

- Admin credentials are stored in localStorage (not recommended for production)
- Consider implementing proper authentication for production use
- Add HTTPS for production deployment

## Future Enhancements

- Database integration (Firebase, MongoDB, etc.)
- Real-time notifications
- Payment integration
- Advanced reporting and analytics
- Multi-location support
- Inventory management
- User roles and permissions

## Support

For issues or feature requests, please contact the development team.
