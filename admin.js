(function() {
// Global variables
let allOrders = [];
let filteredOrders = [];
let currentOrderId = null;

// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Global variables for real-time updates
let refreshInterval;
let lastUpdateTime = new Date();
let isRealTimeEnabled = true;

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!isLoggedIn || !adminToken) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    // Verify token is still valid by testing API call
    try {
        await api.healthCheck();
        console.log('Authentication verified, initializing dashboard');
        await initializeDashboard();
        setupRealTimeUpdates();
        setupEventListeners();
    } catch (error) {
        console.error('Authentication failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    }
});

// Initialize dashboard with real-time capabilities
async function initializeDashboard() {
    try {
        showLoadingIndicator();
        await loadOrders();
        await updateDashboardStats();
        renderOrdersTable();
        hideLoadingIndicator();
        updateLastRefreshTime();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        hideLoadingIndicator();
        showNotification('Error initializing dashboard. Please refresh the page.', 'error');
    }
}

// Setup real-time updates
function setupRealTimeUpdates() {
    // Auto-refresh every 30 seconds
    refreshInterval = setInterval(async () => {
        if (isRealTimeEnabled) {
            await refreshData();
        }
    }, 30000); // 30 seconds

    // Add manual refresh button functionality
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await refreshData();
        });
    }

    // Add real-time toggle functionality
    const realTimeToggle = document.getElementById('realTimeToggle');
    if (realTimeToggle) {
        realTimeToggle.addEventListener('change', (e) => {
            isRealTimeEnabled = e.target.checked;
            updateRealTimeStatus();
            if (isRealTimeEnabled) {
                showNotification('Real-time updates enabled', 'success');
            } else {
                showNotification('Real-time updates disabled', 'info');
            }
        });
    }

    // Initialize real-time status
    updateRealTimeStatus();
}

// Refresh all data
async function refreshData() {
    try {
        showLoadingIndicator();
        const previousOrderCount = allOrders.length;
        
        await loadOrders();
        await updateDashboardStats();
        renderOrdersTable();
        
        const newOrderCount = allOrders.length;
        if (newOrderCount > previousOrderCount) {
            showNotification(`New order detected! Total orders: ${newOrderCount}`, 'success');
        }
        
        updateLastRefreshTime();
        hideLoadingIndicator();
    } catch (error) {
        console.error('Error refreshing data:', error);
        hideLoadingIndicator();
        showNotification('Error refreshing data. Please try again.', 'error');
    }
}

// Load orders from database
async function loadOrders() {
    try {
        console.log('Loading orders from API...');
        // Use backend API to load orders
        const response = await api.getOrders();
        console.log('Orders response:', response);
        
        allOrders = response.orders || [];
        filteredOrders = [...allOrders];
        
        console.log(`Loaded ${allOrders.length} orders`);
        
        if (allOrders.length === 0) {
            console.log('No orders found in response');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Error loading orders. Please refresh the page.', 'error');
        throw error;
    }
}

// Update dashboard statistics
async function updateDashboardStats() {
    try {
        console.log('Loading dashboard stats...');
        const stats = await api.getDashboardStats();
        console.log('Dashboard stats:', stats);
        
        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('inTransitOrders').textContent = stats.inTransitOrders;
        document.getElementById('deliveredOrders').textContent = stats.deliveredOrders;
        document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue.toLocaleString()}`;
        
        console.log('Dashboard stats updated successfully');
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Fallback to local calculation
        const totalOrders = allOrders.length;
        const inTransitOrders = allOrders.filter(order => order.status === 'In Transit').length;
        const deliveredOrders = allOrders.filter(order => order.status === 'Delivered').length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + (order.price || 0), 0);

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('inTransitOrders').textContent = inTransitOrders;
        document.getElementById('deliveredOrders').textContent = deliveredOrders;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
        
        console.log('Using fallback stats calculation');
    }
}

// Render orders table
function renderOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';

    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-orders">
                    <i class="fas fa-inbox"></i>
                    <p>No orders found</p>
                </td>
            </tr>
        `;
        return;
    }

    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        const createdDate = new Date(order.createdAt).toLocaleDateString();
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.trackingNumber}</td>
            <td>
                <div class="customer-info">
                    <strong>${order.customerName}</strong>
                    <small>${order.customerEmail}</small>
                </div>
            </td>
            <td>${order.serviceType}</td>
            <td>
                <span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">
                    ${order.status}
                </span>
            </td>
            <td>${createdDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" data-id="${order.id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-update" data-id="${order.id}" title="Update Status">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger btn-delete" data-id="${order.id}" title="Delete Order">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Attach event listeners for action buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            viewOrderDetails(this.dataset.id);
        });
    });
    document.querySelectorAll('.btn-update').forEach(btn => {
        btn.addEventListener('click', function() {
            updateOrderStatus(this.dataset.id);
        });
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteOrder(this.dataset.id);
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchOrders').addEventListener('input', filterOrders);
    
    // Filter functionality
    document.getElementById('statusFilter').addEventListener('change', filterOrders);
    document.getElementById('serviceFilter').addEventListener('change', filterOrders);
    
    // Update form submission
    document.getElementById('updateForm').addEventListener('submit', handleStatusUpdate);
    // Modal close and confirm buttons
    document.getElementById('closeDetailsModalBtn')?.addEventListener('click', closeDetailsModal);
    document.getElementById('closeUpdateModalBtn')?.addEventListener('click', closeUpdateModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'login.html';
        });
    }
}

// Filter orders
function filterOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const serviceFilter = document.getElementById('serviceFilter').value;

    filteredOrders = allOrders.filter(order => {
        const matchesSearch = 
            order.id.toLowerCase().includes(searchTerm) ||
            order.trackingNumber.toLowerCase().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.customerEmail.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || order.status === statusFilter;
        const matchesService = !serviceFilter || order.serviceType === serviceFilter;

        return matchesSearch && matchesStatus && matchesService;
    });

    renderOrdersTable();
}

// View order details
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const detailsContent = document.getElementById('orderDetailsContent');
    const createdDate = new Date(order.createdAt).toLocaleString();
    const estimatedDelivery = new Date(order.estimatedDelivery).toLocaleString();
    const actualDelivery = order.actualDelivery ? new Date(order.actualDelivery).toLocaleString() : 'Not delivered yet';

    detailsContent.innerHTML = `
        <div class="order-details-grid">
            <div class="detail-section">
                <h4>Order Information</h4>
                <div class="detail-item">
                    <label>Order ID:</label>
                    <span>${order.id}</span>
                </div>
                <div class="detail-item">
                    <label>Tracking Number:</label>
                    <span>${order.trackingNumber}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span>
                </div>
                <div class="detail-item">
                    <label>Service Type:</label>
                    <span>${order.serviceType}</span>
                </div>
                <div class="detail-item">
                    <label>Price:</label>
                    <span>$${order.price.toFixed(2)}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4>Customer Information</h4>
                <div class="detail-item">
                    <label>Name:</label>
                    <span>${order.customerName}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${order.customerEmail}</span>
                </div>
                <div class="detail-item">
                    <label>Phone:</label>
                    <span>${order.customerPhone}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4>Package Details</h4>
                <div class="detail-item">
                    <label>Weight:</label>
                    <span>${order.packageDetails.weight}</span>
                </div>
                <div class="detail-item">
                    <label>Dimensions:</label>
                    <span>${order.packageDetails.dimensions}</span>
                </div>
                <div class="detail-item">
                    <label>Description:</label>
                    <span>${order.packageDetails.description}</span>
                </div>
                <div class="detail-item">
                    <label>Quantity:</label>
                    <span>${order.packageDetails.quantity}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4>Addresses</h4>
                <div class="detail-item">
                    <label>Pickup:</label>
                    <span>${order.pickupAddress}</span>
                </div>
                <div class="detail-item">
                    <label>Delivery:</label>
                    <span>${order.deliveryAddress}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4>Timeline</h4>
                <div class="detail-item">
                    <label>Created:</label>
                    <span>${createdDate}</span>
                </div>
                <div class="detail-item">
                    <label>Estimated Delivery:</label>
                    <span>${estimatedDelivery}</span>
                </div>
                <div class="detail-item">
                    <label>Actual Delivery:</label>
                    <span>${actualDelivery}</span>
                </div>
            </div>
        </div>

        <div class="timeline-section">
            <h4>Shipment Progress</h4>
            <div class="timeline">
                ${order.stages.map(stage => `
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <div class="timeline-header">
                                <h5>${stage.stage}</h5>
                                <span class="timeline-date">${new Date(stage.timestamp).toLocaleString()}</span>
                            </div>
                            <p class="timeline-location">${stage.location}</p>
                            <p class="timeline-description">${stage.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('detailsModal').style.display = 'flex';
}

// Close details modal
function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// Update order status
function updateOrderStatus(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    currentOrderId = orderId;
    document.getElementById('updateOrderId').textContent = order.id;
    document.getElementById('updateTrackingNumber').textContent = order.trackingNumber;
    document.getElementById('newStatus').value = '';

    // Prefill location and description from the latest stage if available
    let lastStage = order.stages && order.stages.length > 0 ? order.stages[order.stages.length - 1] : null;
    document.getElementById('updateLocation').value = lastStage && lastStage.location ? lastStage.location : '';
    document.getElementById('updateDescription').value = lastStage && lastStage.description ? lastStage.description : '';

    document.getElementById('updateModal').style.display = 'flex';
}

// Close update modal
function closeUpdateModal() {
    document.getElementById('updateModal').style.display = 'none';
    currentOrderId = null;
}

// Handle status update
async function handleStatusUpdate(e) {
    e.preventDefault();

    const newStatus = document.getElementById('newStatus').value;
    const location = document.getElementById('updateLocation').value;
    const description = document.getElementById('updateDescription').value;

    if (!newStatus || !location || !description) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }

    try {
        // Use backend API to update order status
        const response = await api.updateOrderStatus(currentOrderId, {
            status: newStatus,
            location: location,
            description: description
        });

        if (response.success) {
            // Always reload orders from backend after update
            await loadOrders();
            await updateDashboardStats();
            renderOrdersTable();
            closeUpdateModal();
            showNotification('Order status updated successfully!', 'success');
        }

    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error updating order status. Please try again.', 'error');
    }
}

// Delete order
function deleteOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('deleteOrderId').textContent = order.id;
    document.getElementById('deleteTrackingNumber').textContent = order.trackingNumber;
    currentOrderId = orderId;

    document.getElementById('deleteModal').style.display = 'flex';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentOrderId = null;
}

// Confirm delete
async function confirmDelete() {
    try {
        // Use backend API to delete order
        const response = await api.deleteOrder(currentOrderId);

        if (response.success) {
            // Always reload orders from backend after delete
            await loadOrders();
            await updateDashboardStats();
            renderOrdersTable();
            closeDeleteModal();
            showNotification('Order deleted successfully!', 'success');
        }

    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Error deleting order. Please try again.', 'error');
    }
}

// Export orders
async function exportOrders() {
    try {
        const statusFilter = document.getElementById('statusFilter').value;
        const serviceFilter = document.getElementById('serviceFilter').value;
        
        const filters = {};
        if (statusFilter) filters.status = statusFilter;
        if (serviceFilter) filters.serviceType = serviceFilter;

        await api.exportOrders(filters);
        showNotification('Orders exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting orders:', error);
        showNotification('Error exporting orders. Please try again.', 'error');
    }
}

// Generate CSV content
function generateCSV(orders) {
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

    orders.forEach(order => {
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

    return csvRows.join('\n');
}

// Show loading indicator
function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

// Hide loading indicator
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// Update last refresh time
function updateLastRefreshTime() {
    lastUpdateTime = new Date();
    const lastRefreshElement = document.getElementById('lastRefreshTime');
    if (lastRefreshElement) {
        lastRefreshElement.textContent = lastUpdateTime.toLocaleTimeString();
    }
}

// Show real-time status
function updateRealTimeStatus() {
    const realTimeStatus = document.getElementById('realTimeStatus');
    if (realTimeStatus) {
        if (isRealTimeEnabled) {
            realTimeStatus.innerHTML = '<i class="fas fa-circle text-success"></i> Live';
            realTimeStatus.className = 'real-time-status active';
        } else {
            realTimeStatus.innerHTML = '<i class="fas fa-circle text-muted"></i> Paused';
            realTimeStatus.className = 'real-time-status paused';
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        currentOrderId = null;
    }
});

// Debug function to test API connectivity
window.debugAPI = async function() {
    console.log('=== API Debug Test ===');
    console.log('Admin Token:', localStorage.getItem('adminToken'));
    console.log('Admin Logged In:', localStorage.getItem('adminLoggedIn'));
    
    try {
        console.log('Testing health check...');
        const health = await api.healthCheck();
        console.log('Health check result:', health);
        
        console.log('Testing orders API...');
        const orders = await api.getOrders();
        console.log('Orders API result:', orders);
        
        console.log('Testing dashboard stats...');
        const stats = await api.getDashboardStats();
        console.log('Dashboard stats result:', stats);
        
        console.log('=== API Debug Test Complete ===');
    } catch (error) {
        console.error('API Debug Test Failed:', error);
    }
};

// Test authentication flow
window.testAuth = async function() {
    console.log('=== Authentication Test ===');
    
    // Clear any existing tokens
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoggedIn');
    
    try {
        console.log('Testing login...');
        const loginResult = await api.login('admin@yanglogistics.com', 'Admin123!');
        console.log('Login result:', loginResult);
        
        if (loginResult.success) {
            console.log('Login successful, testing orders...');
            const orders = await api.getOrders();
            console.log('Orders after login:', orders);
            
            console.log('Testing stats...');
            const stats = await api.getDashboardStats();
            console.log('Stats after login:', stats);
        }
        
        console.log('=== Authentication Test Complete ===');
    } catch (error) {
        console.error('Authentication Test Failed:', error);
    }
};

window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.closeDetailsModal = closeDetailsModal;
window.closeUpdateModal = closeUpdateModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;

console.log('Admin dashboard loaded successfully!');
console.log('Use debugAPI() in console to test API connectivity');
console.log('Use testAuth() in console to test authentication flow');
})(); 