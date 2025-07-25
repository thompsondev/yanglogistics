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

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// URL rewriting middleware to remove .html extensions
app.use((req, res, next) => {
    const url = req.url;
    
    // If the URL doesn't end with .html and doesn't have a file extension
    if (!url.includes('.') && !url.endsWith('/')) {
        // Check if the file exists with .html extension
        const htmlPath = path.join(__dirname, url + '.html');
        if (fs.existsSync(htmlPath)) {
            req.url = url + '.html';
        }
    }
    
    // Handle root URL
    if (url === '/') {
        req.url = '/index.html';
    }
    
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database file path
const DB_PATH = path.join(__dirname, 'database.json');

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

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
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
                    message: 'YangLogistics API is running',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Missing email or password:', { email: !!email, password: !!password });
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = await readDatabase();
        console.log('Available admin accounts:', db.adminAccounts.map(acc => ({ email: acc.email, id: acc.id })));
        const admin = db.adminAccounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
        console.log('Found admin:', admin ? { email: admin.email, id: admin.id } : 'Not found');

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

// Orders CRUD routes
app.get('/api/orders', authenticateToken, async (req, res) => {
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
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
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
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        const db = await readDatabase();

        // Validate required fields
        const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'pickupAddress', 'deliveryAddress', 'packageDetails', 'serviceType'];
        for (const field of requiredFields) {
            if (!orderData[field]) {
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        // Validate packageDetails
        if (!orderData.packageDetails.weight || isNaN(parseFloat(orderData.packageDetails.weight))) {
            return res.status(400).json({ error: 'Invalid or missing weight.' });
        }

        // Create new order
        const newOrder = {
            id: generateOrderId(),
            trackingNumber: generateTrackingNumber(),
            ...orderData,
            status: 'Order Placed',
            currentStage: 'Order Placed',
            stages: [{
                stage: 'Order Placed',
                timestamp: new Date().toISOString(),
                location: 'Online',
                description: 'Order received and confirmed'
            }],
            estimatedDelivery: calculateEstimatedDelivery(orderData.serviceType),
            actualDelivery: null,
            price: calculatePrice(orderData.serviceType, orderData.packageDetails.weight),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.orders.push(newOrder);
        await writeDatabase(db);

        res.status(201).json({
            success: true,
            order: newOrder,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/orders/:id', authenticateToken, async (req, res) => {
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
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = await readDatabase();

        const orderIndex = db.orders.findIndex(o => o.id === id);
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const deletedOrder = db.orders.splice(orderIndex, 1)[0];
        await writeDatabase(db);

        res.json({
            success: true,
            message: 'Order deleted successfully',
            deletedOrder
        });

    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update order status
app.post('/api/orders/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, location, description } = req.body;
        const db = await readDatabase();

        const orderIndex = db.orders.findIndex(o => o.id === id);
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = db.orders[orderIndex];

        // Add new stage
        const newStage = {
            stage: status,
            timestamp: new Date().toISOString(),
            location: location || 'Unknown',
            description: description || 'Status updated'
        };

        order.stages.push(newStage);
        order.status = status;
        order.currentStage = status;
        order.updatedAt = new Date().toISOString();

        // Update actual delivery if status is "Delivered"
        if (status === 'Delivered') {
            order.actualDelivery = new Date().toISOString();
        }

        await writeDatabase(db);

        res.json({
            success: true,
            order,
            message: 'Order status updated successfully'
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Tracking route (public)
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
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Dashboard statistics
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
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
app.get('/api/orders/export/csv', authenticateToken, async (req, res) => {
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

// Serve static files
app.use(express.static(path.join(__dirname)));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚚 YangLogistics API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
});

module.exports = app; 