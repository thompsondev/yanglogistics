# GlobalLogistics - Complete Logistics Management System

A modern, full-stack logistics management system with real-time tracking, order management, and admin dashboard.

## Features

### 🚚 Core Functionality
- **Real-time Package Tracking** - Track shipments with detailed status updates
- **Order Management** - Create, update, and manage shipping orders
- **Admin Dashboard** - Complete CRUD operations with analytics
- **User Authentication** - Secure login/signup system
- **Responsive Design** - Works on all devices

### 📊 Admin Features
- **Dashboard Analytics** - Real-time statistics and insights
- **Order Management** - Full CRUD operations
- **Status Updates** - Real-time order status management
- **Export Functionality** - CSV export of order data
- **Search & Filter** - Advanced order filtering and search
- **User Management** - Admin account creation and management

### 🔐 Security Features
- **JWT Authentication** - Secure token-based authentication
- **Password Validation** - Strong password requirements
- **Session Management** - Secure session handling
- **Rate Limiting** - API protection against abuse

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd logistics
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Backend Server
```bash
npm start
```

The backend server will start on `http://localhost:3000`

### Step 4: Access the Application
Open your browser and navigate to:
- **Main Website**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin.html`
- **API Health Check**: `http://localhost:3000/api/health`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/signup` - Admin registration

### Orders
- `GET /api/orders` - Get all orders (with filters)
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `POST /api/orders/:id/status` - Update order status

### Tracking
- `GET /api/track/:trackingNumber` - Track package (public)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/orders/export/csv` - Export orders to CSV

## Default Admin Account

For testing purposes, a default admin account is created:

```
Email: admin@globallogistics.com
Password: admin123
```

## File Structure

```
logistics/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── logic/
│   ├── database.json      # JSON database
│   ├── api.js            # API service layer
│   ├── auth.js           # Authentication logic
│   ├── admin.js          # Admin dashboard logic
│   ├── tracking.js       # Tracking functionality
│   ├── order.js          # Order management
│   ├── script.js         # Main website scripts
│   ├── styles.css        # Main stylesheet
│   ├── index.html        # Main website
│   ├── admin.html        # Admin dashboard
│   ├── login.html        # Login page
│   ├── signup.html       # Signup page
│   ├── tracking.html     # Tracking page
│   └── order.html        # Order placement page
└── README.md             # This file
```

## Usage Guide

### For Customers

1. **Track Package**
   - Visit the tracking page
   - Enter your tracking number
   - View real-time status updates

2. **Place Order**
   - Fill out the order form
   - Select service type and package details
   - Receive tracking number upon confirmation

### For Administrators

1. **Login**
   - Use admin credentials to access dashboard
   - View real-time statistics

2. **Manage Orders**
   - View all orders with search and filter
   - Update order status with location tracking
   - Export order data to CSV

3. **User Management**
   - Create new admin accounts
   - Manage user permissions

## Development

### Running in Development Mode
```bash
npm run dev
```

This will start the server with nodemon for automatic restarts.

### API Testing
You can test the API endpoints using tools like:
- Postman
- Insomnia
- curl

Example API call:
```bash
curl -X GET http://localhost:3000/api/health
```

## Security Considerations

- JWT tokens expire after 24 hours
- Passwords should be hashed in production
- Rate limiting is enabled on API endpoints
- CORS is configured for security
- Helmet.js provides additional security headers

## Production Deployment

For production deployment:

1. Set environment variables:
   ```bash
   export JWT_SECRET=your-super-secret-jwt-key
   export PORT=3000
   ```

2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js
   ```

3. Set up a reverse proxy (nginx/Apache)

4. Use HTTPS with SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@globallogistics.com
- Documentation: Check the API health endpoint for more details

---

**GlobalLogistics** - Connecting the world through innovative logistics solutions. 