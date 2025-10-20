/**
 * YangLogistics Backend Server
 * Professional Express.js server for Coolify deployment
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const path = require('path');

// Import configurations
const { dbManager, isProduction } = require('./database-config');
const { 
    createError, 
    errorHandler, 
    notFoundHandler, 
    asyncHandler, 
    validateRequired, 
    validateEmail, 
    validatePhone 
} = require('./errorHandler');

// Initialize Express app
const app = express();
app.set('trust proxy', 1); // Trust first proxy for correct client IP and rate limiting

// Configuration
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'yanglogistics-super-secret-jwt-key-change-in-production';

// Production CORS origins
const PRODUCTION_ORIGINS = [
    'https://yang-logistics.web.app',
    'https://logistics.digitalcoresystem.com'
];

// Development CORS origins
const DEVELOPMENT_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5500',
    'http://localhost:5500'
];

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = isProduction ? PRODUCTION_ORIGINS : [...PRODUCTION_ORIGINS, ...DEVELOPMENT_ORIGINS];
        
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`🚫 CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (isProduction) {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
    message: {
        success: false,
        error: {
            type: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.',
            statusCode: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// Serve static files (for development)
if (!isProduction) {
    app.use(express.static(path.join(__dirname, 'fireServer')));
}

// ==================== ROUTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'YangLogistics API is running on Coolify',
        timestamp: new Date().toISOString(),
        environment: isProduction ? 'production' : 'development',
        version: '2.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'YangLogistics API Server',
        version: '2.0.0',
        environment: isProduction ? 'production' : 'development',
        documentation: '/api/health',
        timestamp: new Date().toISOString()
    });
});

// ==================== AUTHENTICATION ROUTES ====================

// Login endpoint
app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    // Validate required fields
    validateRequired(req.body, ['email', 'password']);
    
    // Validate email format
    validateEmail(email);

    const db = await dbManager.readDatabase();
    const admin = db.adminAccounts.find(acc => 
        acc.email.toLowerCase() === email.toLowerCase() && acc.isActive
    );

    if (!admin) {
        throw createError.invalidCredentials('User account not found or inactive');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
        throw createError.invalidCredentials('Invalid password');
    }

    // Generate JWT token
    const token = jwt.sign(
        { 
            id: admin.id, 
            email: admin.email, 
            role: admin.role,
            firstName: admin.firstName,
            lastName: admin.lastName
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
    );

    // Update last login
    admin.lastLogin = new Date().toISOString();
    await dbManager.writeDatabase(db);

    res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: admin.id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            company: admin.company
        }
    });
}));

// Signup endpoint
app.post('/api/auth/signup', asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        company,
        role,
        password,
        confirmPassword
    } = req.body;

    // Validate required fields
    validateRequired(req.body, [
        'firstName', 
        'lastName', 
        'email', 
        'phone', 
        'company', 
        'role', 
        'password', 
        'confirmPassword'
    ]);
    
    // Validate email format
    validateEmail(email);
    
    // Validate phone format
    validatePhone(phone);
    
    // Validate password confirmation
    if (password !== confirmPassword) {
        throw createError.validation('Passwords do not match', 'confirmPassword');
    }
    
    // Validate password strength
    if (password.length < 8) {
        throw createError.validation('Password must be at least 8 characters long', 'password');
    }

    const db = await dbManager.readDatabase();

    // Check if email already exists
    const existingAdmin = db.adminAccounts.find(acc => 
        acc.email.toLowerCase() === email.toLowerCase()
    );

    if (existingAdmin) {
        throw createError.conflict('An account with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new admin account
    const newAdmin = {
        id: `ADM${Date.now()}`,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        company,
        role: role || 'admin',
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        lastLogin: null
    };

    db.adminAccounts.push(newAdmin);
    await dbManager.writeDatabase(db);

    res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        user: {
            id: newAdmin.id,
            email: newAdmin.email,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            role: newAdmin.role,
            company: newAdmin.company
        }
    });
}));

// Change password endpoint
app.post('/api/auth/change-password', asyncHandler(async (req, res) => {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    validateRequired(req.body, ['email', 'currentPassword', 'newPassword', 'confirmPassword']);
    
    // Validate email format
    validateEmail(email);
    
    // Validate password confirmation
    if (newPassword !== confirmPassword) {
        throw createError.validation('New passwords do not match', 'confirmPassword');
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
        throw createError.validation('New password must be at least 8 characters long', 'newPassword');
    }

    const db = await dbManager.readDatabase();
    const admin = db.adminAccounts.find(acc => 
        acc.email.toLowerCase() === email.toLowerCase() && acc.isActive
    );

    if (!admin) {
        throw createError.notFound('User account not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!isValidPassword) {
        throw createError.invalidCredentials('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    admin.password = hashedPassword;
    admin.updatedAt = new Date().toISOString();
    
    await dbManager.writeDatabase(db);

    res.json({
        success: true,
        message: 'Password updated successfully'
    });
}));

// ==================== ORDER ROUTES ====================

// Get all orders
app.get('/api/orders', asyncHandler(async (req, res) => {
    const db = await dbManager.readDatabase();
    const { status, serviceType, limit = 50, offset = 0 } = req.query;

    let orders = db.orders || [];

    // Apply filters
    if (status) {
        orders = orders.filter(order => order.status === status);
    }
    
    if (serviceType) {
        orders = orders.filter(order => order.serviceType === serviceType);
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);

    res.json({
        success: true,
        orders: paginatedOrders,
        pagination: {
            total: orders.length,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: endIndex < orders.length
        }
    });
}));

// Create new order
app.post('/api/orders', asyncHandler(async (req, res) => {
    const {
        customerName,
        customerEmail,
        customerPhone,
        pickupAddress,
        deliveryAddress,
        serviceType,
        packageDetails,
        specialInstructions
    } = req.body;

    // Validate required fields
    validateRequired(req.body, [
        'customerName', 
        'customerEmail', 
        'customerPhone', 
        'pickupAddress', 
        'deliveryAddress', 
        'serviceType'
    ]);
    
    // Validate email format
    validateEmail(customerEmail);
    
    // Validate phone format
    validatePhone(customerPhone);
    
    // Handle package details
    let weight, description, quantity;
    if (packageDetails) {
        weight = packageDetails.weight;
        description = packageDetails.description;
        quantity = packageDetails.quantity;
    } else {
        weight = req.body.weight;
        description = req.body.description;
        quantity = req.body.quantity || 1;
    }
    
    if (!weight || isNaN(parseFloat(weight))) {
        throw createError.validation('Invalid or missing weight', 'weight', 'Weight must be a valid number');
    }
    
    if (parseFloat(weight) <= 0) {
        throw createError.validation('Weight must be greater than 0', 'weight', 'Please enter a valid weight');
    }

    const db = await dbManager.readDatabase();

    // Generate order ID and tracking number
    const orderId = `ORD${Date.now()}`;
    const trackingNumber = `YL${String(db.nextTrackingNumber || 1001).padStart(6, '0')}`;
    
    // Increment tracking number
    db.nextTrackingNumber = (db.nextTrackingNumber || 1001) + 1;

    const order = {
        id: orderId,
        trackingNumber,
        customerName,
        customerEmail,
        customerPhone,
        pickupAddress,
        deliveryAddress,
        serviceType,
        packageDetails: {
            weight: parseFloat(weight),
            description: description || '',
            quantity: parseInt(quantity) || 1
        },
        specialInstructions: specialInstructions || '',
        status: 'Order Placed',
        currentStage: 'Order Placed',
        price: calculatePrice(serviceType, weight),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDelivery: calculateEstimatedDelivery(serviceType),
        stages: [
            {
                stage: 'Order Placed',
                timestamp: new Date().toISOString(),
                location: 'Online',
                description: 'Order received and confirmed'
            }
        ]
    };

    db.orders.push(order);
    await dbManager.writeDatabase(db);

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
    });
}));

// Get single order
app.get('/api/orders/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const db = await dbManager.readDatabase();
    const order = db.orders.find(o => o.id === id);

    if (!order) {
        throw createError.notFound('Order not found');
    }

    res.json({
        success: true,
        order
    });
}));

// Update order
app.put('/api/orders/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const db = await dbManager.readDatabase();
    const orderIndex = db.orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
        throw createError.notFound('Order not found');
    }

    // Update order
    db.orders[orderIndex] = {
        ...db.orders[orderIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
    };

    await dbManager.writeDatabase(db);

    res.json({
        success: true,
        message: 'Order updated successfully',
        order: db.orders[orderIndex]
    });
}));

// Update order status (PATCH endpoint for status updates)
app.patch('/api/orders/:id/status', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const statusData = req.body;

    const db = await dbManager.readDatabase();
    const orderIndex = db.orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
        throw createError.notFound('Order not found');
    }

    // Update order status and add to stages
    const currentOrder = db.orders[orderIndex];
    const newStage = {
        stage: statusData.status,
        location: statusData.location,
        description: statusData.description,
        timestamp: new Date().toISOString()
    };

    // Add new stage to stages array
    if (!currentOrder.stages) {
        currentOrder.stages = [];
    }
    currentOrder.stages.push(newStage);

    // Update order with new status
    db.orders[orderIndex] = {
        ...currentOrder,
        status: statusData.status,
        updatedAt: new Date().toISOString()
    };

    await dbManager.writeDatabase(db);

    res.json({
        success: true,
        message: 'Order status updated successfully',
        order: db.orders[orderIndex]
    });
}));

// Delete order
app.delete('/api/orders/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const db = await dbManager.readDatabase();
    const orderIndex = db.orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
        throw createError.notFound('Order not found');
    }

    // Remove order
    db.orders.splice(orderIndex, 1);
    await dbManager.writeDatabase(db);

    res.json({
        success: true,
        message: 'Order deleted successfully'
    });
}));

// Track order
app.get('/api/track/:trackingNumber', asyncHandler(async (req, res) => {
    const { trackingNumber } = req.params;
    
    if (!trackingNumber || trackingNumber.trim() === '') {
        throw createError.validation('Tracking number is required', 'trackingNumber');
    }
    
    const db = await dbManager.readDatabase();
    const order = db.orders.find(o => 
        o.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()
    );

    if (!order) {
        throw createError.orderNotFound(trackingNumber);
    }

    res.json({
        success: true,
        order
    });
}));

// ==================== ADMIN ROUTES ====================

// Get all admins
app.get('/api/admins', asyncHandler(async (req, res) => {
    const db = await dbManager.readDatabase();
    const admins = db.adminAccounts.map(admin => ({
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        company: admin.company,
        role: admin.role,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
        isActive: admin.isActive
    }));

    res.json({
        success: true,
        admins
    });
}));

// Get single admin
app.get('/api/admins/:adminId', asyncHandler(async (req, res) => {
    const { adminId } = req.params;
    
    const db = await dbManager.readDatabase();
    const admin = db.adminAccounts.find(a => a.id === adminId);

    if (!admin) {
        throw createError.notFound('Admin not found');
    }

    res.json({
        success: true,
        admin: {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phone: admin.phone,
            company: admin.company,
            role: admin.role,
            createdAt: admin.createdAt,
            lastLogin: admin.lastLogin,
            isActive: admin.isActive
        }
    });
}));

// ==================== DASHBOARD ROUTES ====================

// Get dashboard statistics
app.get('/api/dashboard/stats', asyncHandler(async (req, res) => {
    const db = await dbManager.readDatabase();
    const orders = db.orders || [];
    
    const stats = {
        totalOrders: orders.length,
        ordersByStatus: {},
        ordersByServiceType: {},
        recentOrders: orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10),
        totalRevenue: orders.reduce((sum, order) => sum + (order.price || 0), 0)
    };

    // Count orders by status
    orders.forEach(order => {
        stats.ordersByStatus[order.status] = (stats.ordersByStatus[order.status] || 0) + 1;
    });

    // Count orders by service type
    orders.forEach(order => {
        stats.ordersByServiceType[order.serviceType] = (stats.ordersByServiceType[order.serviceType] || 0) + 1;
    });

    res.json({
        success: true,
        stats
    });
}));

// Export orders to CSV
app.get('/api/orders/export/csv', asyncHandler(async (req, res) => {
    const db = await dbManager.readDatabase();
    const orders = db.orders || [];

    // Generate CSV
    const csvHeader = 'ID,Tracking Number,Customer Name,Customer Email,Customer Phone,Service Type,Status,Price,Created At\n';
    const csvRows = orders.map(order => 
        `${order.id},${order.trackingNumber},${order.customerName},${order.customerEmail},${order.customerPhone},${order.serviceType},${order.status},${order.price},${order.createdAt}`
    ).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    res.send(csv);
}));

// ==================== UTILITY FUNCTIONS ====================

function calculatePrice(serviceType, weight) {
    const basePrices = {
        'Standard Delivery': 10,
        'Express Delivery': 25,
        'Air Freight': 50,
        'Ocean Freight': 30,
        'Ground Transport': 15,
        'Same Day Delivery': 40
    };
    
    const basePrice = basePrices[serviceType] || 10;
    const weightMultiplier = Math.ceil(parseFloat(weight) / 5); // $5 per 5kg
    
    return basePrice + (weightMultiplier * 5);
}

function calculateEstimatedDelivery(serviceType) {
    const deliveryDays = {
        'Standard Delivery': 5,
        'Express Delivery': 2,
        'Air Freight': 3,
        'Ocean Freight': 14,
        'Ground Transport': 7,
        'Same Day Delivery': 1
    };
    
    const days = deliveryDays[serviceType] || 5;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    
    return deliveryDate.toISOString();
}

// ==================== ERROR HANDLING ====================

// 404 handler for undefined routes
app.use(notFoundHandler);

// Professional error handling middleware (must be last)
app.use(errorHandler);

// ==================== SERVER STARTUP ====================

async function startServer() {
    try {
        // Initialize database
        await dbManager.initialize();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 YangLogistics Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
            console.log(`📊 Database: ${dbManager.config.databasePath}`);
            console.log(`🔒 Security: ${isProduction ? 'Enabled' : 'Development mode'}`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;