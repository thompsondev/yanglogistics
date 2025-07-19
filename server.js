const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');

const app = express();
app.set('trust proxy', 1); // Trust first proxy for correct client IP and rate limiting
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: ['https://yanglogistics-portal.web.app', 'http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('dev'));

// Serve static files (HTML, CSS, JS) - must be before routes
app.use(express.static(__dirname));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database configuration
const { DATABASE_PATH } = require('./database-config');
const DB_PATH = DATABASE_PATH;

// Initialize database if it doesn't exist
async function initializeDatabase() {
    try {
        await fs.access(DB_PATH);
        console.log('📊 Database file exists');
    } catch (error) {
        console.log('📊 Initializing new database file...');
        const initialDb = {
            orders: [],
            trackingStages: [
                "Order Placed",
                "Package Picked Up",
                "Out for Delivery",
                "In Transit",
                "Delivered",
                "Failed Delivery"
            ],
            serviceTypes: [
                "Standard Delivery",
                "Express Delivery",
                "Air Freight",
                "Ocean Freight",
                "Ground Transport",
                "Same Day Delivery"
            ],
            nextOrderId: 1,
            nextTrackingNumber: 1001,
            adminAccounts: [
                {
                    id: "ADM1701234567890",
                    firstName: "Admin",
                    lastName: "User",
                    email: "admin@yanglogistics.com",
                    phone: "+1-555-0123",
                    company: "YangLogistics",
                    role: "super_admin",
                    password: "Admin123!",
                    createdAt: "2024-12-01T10:00:00Z",
                    isActive: true
                }
            ]
        };
        
        await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf8');
        console.log('✅ Database initialized successfully');
    }
}

// Utility functions
async function readDatabase() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return {
            orders: [],
            adminAccounts: [],
            nextOrderId: 1,
            nextTrackingNumber: 1001
        };
    }
}

async function writeDatabase(data) {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
}

// Authentication middleware (disabled - public access)
function authenticateToken(req, res, next) {
    // Skip authentication - allow public access
    next();
}

// Generate tracking number
function generateTrackingNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TRK${year}${month}${day}${random}`;
}

// Generate order ID
function generateOrderId() {
    return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'YangLogistics API is running on Railway',
        timestamp: new Date().toISOString()
    });
});

// Root route for Railway
app.get('/', (req, res) => {
    res.json({ 
        message: 'YangLogistics API Server',
        health: '/api/health',
        timestamp: new Date().toISOString()
    });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = await readDatabase();
        const admin = db.adminAccounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // In production, use bcrypt.compare(password, admin.password)
        if (password !== admin.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                id: admin.id, 
                email: admin.email, 
                role: admin.role 
            }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change password endpoint
app.post('/api/auth/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'All password fields are required' });
        }
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'New password and confirmation do not match' });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }
        
        // Get user from token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication token required' });
        }
        
        const token = authHeader.substring(7);
        let decoded;
        
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        
        // Read database and find admin
        const db = await readDatabase();
        const adminIndex = db.adminAccounts.findIndex(acc => acc.id === decoded.id);
        
        if (adminIndex === -1) {
            return res.status(404).json({ error: 'Admin account not found' });
        }
        
        const admin = db.adminAccounts[adminIndex];
        
        // Verify current password
        if (admin.password !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Update password
        db.adminAccounts[adminIndex].password = newPassword;
        
        // Save to database
        const success = await writeDatabase(db);
        
        if (success) {
            res.json({ 
                success: true, 
                message: 'Password changed successfully' 
            });
        } else {
            res.status(500).json({ error: 'Failed to update password' });
        }
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all admins endpoint
app.get('/api/admins', async (req, res) => {
    try {
        // Check authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication token required' });
        }
        
        const token = authHeader.substring(7);
        let decoded;
        
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        
        // Read database
        const db = await readDatabase();
        
        // Return admin accounts without passwords for security
        const admins = db.adminAccounts.map(admin => ({
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phone: admin.phone,
            company: admin.company,
            role: admin.role,
            createdAt: admin.createdAt,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin || null
        }));
        
        res.json({
            success: true,
            admins: admins,
            total: admins.length
        });
        
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get specific admin by ID endpoint
app.get('/api/admins/:adminId', async (req, res) => {
    try {
        const { adminId } = req.params;
        
        // Check authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication token required' });
        }
        
        const token = authHeader.substring(7);
        let decoded;
        
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        
        // Read database
        const db = await readDatabase();
        
        // Find specific admin
        const admin = db.adminAccounts.find(acc => acc.id === adminId);
        
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        // Return admin without password for security
        const adminInfo = {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phone: admin.phone,
            company: admin.company,
            role: admin.role,
            createdAt: admin.createdAt,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin || null
        };
        
        res.json({
            success: true,
            admin: adminInfo
        });
        
    } catch (error) {
        console.error('Get admin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, company, role, password } = req.body;

        if (!firstName || !lastName || !email || !phone || !company || !role || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const db = await readDatabase();
        
        // Check if email already exists
        const existingAdmin = db.adminAccounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
        if (existingAdmin) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new admin account
        const newAdmin = {
            id: `ADM${Date.now()}`,
            firstName,
            lastName,
            email,
            phone,
            company,
            role,
            password, // In production, hash with bcrypt
            createdAt: new Date().toISOString(),
            isActive: true
        };

        db.adminAccounts.push(newAdmin);
        await writeDatabase(db);

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully'
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Orders CRUD routes (public access)
app.get('/api/orders', async (req, res) => {
    try {
        const db = await readDatabase();
        const { search, status, serviceType, page = 1, limit = 10 } = req.query;

        let filteredOrders = [...db.orders];

        // Search filter
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredOrders = filteredOrders.filter(order => 
                order.id.toLowerCase().includes(searchTerm) ||
                order.trackingNumber.toLowerCase().includes(searchTerm) ||
                order.customerName.toLowerCase().includes(searchTerm) ||
                order.customerEmail.toLowerCase().includes(searchTerm)
            );
        }

        // Status filter
        if (status) {
            filteredOrders = filteredOrders.filter(order => order.status === status);
        }

        // Service type filter
        if (serviceType) {
            filteredOrders = filteredOrders.filter(order => order.serviceType === serviceType);
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

        res.json({
            orders: paginatedOrders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(filteredOrders.length / limit),
                totalOrders: filteredOrders.length,
                hasNext: endIndex < filteredOrders.length,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error (get orders)', details: error.message });
    }
});

// Allow anyone to create an order (no authentication)
app.post('/api/orders', async (req, res) => {
    try {
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

        if (!customerName || !customerEmail || !customerPhone || !pickupAddress || !deliveryAddress || !serviceType) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        
        // Handle both old format (direct weight) and new format (packageDetails)
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
            return res.status(400).json({ error: 'Invalid or missing weight.' });
        }

        const db = await readDatabase();

        const order = {
            id: generateOrderId(),
            trackingNumber: generateTrackingNumber(),
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
        await writeDatabase(db);

        res.status(201).json({
            success: true,
            order,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Internal server error (create order)', details: error.message });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await readDatabase();
        
        const order = db.orders.find(o => o.id === id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Internal server error (get order)', details: error.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const db = await readDatabase();
        const orderIndex = db.orders.findIndex(o => o.id === id);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order
        db.orders[orderIndex] = {
            ...db.orders[orderIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        await writeDatabase(db);

        res.json({
            success: true,
            order: db.orders[orderIndex],
            message: 'Order updated successfully'
        });

    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Internal server error (update order)', details: error.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await readDatabase();
        
        const orderIndex = db.orders.findIndex(o => o.id === id);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        db.orders.splice(orderIndex, 1);
        await writeDatabase(db);

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Internal server error (delete order)', details: error.message });
    }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, location, description } = req.body;

        // Debug logging
        console.log('🔍 Received update request:', {
            orderId: id,
            status,
            location,
            description,
            body: req.body
        });

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const db = await readDatabase();
        const order = db.orders.find(o => o.id === id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const newStage = {
            stage: status,
            timestamp: new Date().toISOString(),
            location: location && location.trim() !== '' ? location : 'Processing Center',
            description: description && description.trim() !== '' ? description : `Order status updated to ${status}`
        };

        console.log('📝 Creating new stage:', newStage);

        order.stages.push(newStage);
        order.status = status;
        order.currentStage = status;
        order.updatedAt = new Date().toISOString();

        // Update actual delivery if status is "Delivered"
        if (status === 'Delivered') {
            order.actualDelivery = new Date().toISOString();
        }

        await writeDatabase(db);

        console.log('✅ Order updated successfully');

        res.json({
            success: true,
            order,
            message: 'Order status updated successfully'
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Internal server error (update status)', details: error.message });
    }
});

// Tracking route (public, no authentication)
app.get('/api/track/:trackingNumber', async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const db = await readDatabase();

        const order = db.orders.find(o => 
            o.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()
        );

        if (!order) {
            return res.status(404).json({ error: 'Tracking number not found' });
        }

        res.json(order);

    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ error: 'Internal server error (tracking)', details: error.message });
    }
});

// Dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const db = await readDatabase();
        
        const totalOrders = db.orders.length;
        const inTransitOrders = db.orders.filter(o => o.status === 'In Transit').length;
        const deliveredOrders = db.orders.filter(o => o.status === 'Delivered').length;
        const totalRevenue = db.orders.reduce((sum, order) => sum + (order.price || 0), 0);

        res.json({
            totalOrders,
            inTransitOrders,
            deliveredOrders,
            totalRevenue,
            pendingOrders: db.orders.filter(o => o.status === 'Order Placed').length,
            outForDelivery: db.orders.filter(o => o.status === 'Out for Delivery').length
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export orders
app.get('/api/orders/export/csv', async (req, res) => {
    try {
        const db = await readDatabase();
        const { status, serviceType } = req.query;

        let filteredOrders = [...db.orders];

        if (status) {
            filteredOrders = filteredOrders.filter(o => o.status === status);
        }

        if (serviceType) {
            filteredOrders = filteredOrders.filter(o => o.serviceType === serviceType);
        }

        // Generate CSV
        const headers = [
            'Order ID',
            'Tracking Number',
            'Customer Name',
            'Customer Email',
            'Customer Phone',
            'Service Type',
            'Status',
            'Price',
            'Created Date',
            'Estimated Delivery',
            'Actual Delivery'
        ];

        const csvRows = [headers.join(',')];

        filteredOrders.forEach(order => {
            const row = [
                order.id,
                order.trackingNumber,
                `"${order.customerName}"`,
                order.customerEmail,
                order.customerPhone,
                order.serviceType,
                order.status,
                order.price,
                new Date(order.createdAt).toLocaleDateString(),
                new Date(order.estimatedDelivery).toLocaleDateString(),
                order.actualDelivery ? new Date(order.actualDelivery).toLocaleDateString() : ''
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=orders_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvContent);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Utility functions
function calculateEstimatedDelivery(serviceType) {
    const now = new Date();
    let daysToAdd = 0;
    
    switch (serviceType) {
        case 'Standard Delivery': daysToAdd = 4; break;
        case 'Express Delivery': daysToAdd = 2; break;
        case 'Air Freight': daysToAdd = 3; break;
        case 'Ocean Freight': daysToAdd = 10; break;
        default: daysToAdd = 4;
    }
    
    const estimatedDate = new Date(now);
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    estimatedDate.setHours(17, 0, 0, 0);
    
    return estimatedDate.toISOString();
}

function calculatePrice(serviceType, weight) {
    const weightNum = parseFloat(weight);
    let basePrice = 0;
    let weightMultiplier = 0;
    switch (serviceType) {
        case 'Standard Delivery': basePrice = 150; weightMultiplier = 5; break;
        case 'Express Delivery': basePrice = 250; weightMultiplier = 8; break;
        case 'Air Freight': basePrice = 400; weightMultiplier = 12; break;
        case 'Ocean Freight': basePrice = 200; weightMultiplier = 3; break;
        default: basePrice = 150; weightMultiplier = 5;
    }
    const weightPrice = weightNum * weightMultiplier;
    return Math.round(basePrice + weightPrice);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Catch-all error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong (unhandled error)', details: err.message });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
    // Initialize database on startup
    await initializeDatabase();
    
    console.log(`🚚 YangLogistics API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 API Base: http://localhost:${PORT}`);
});

module.exports = app; 