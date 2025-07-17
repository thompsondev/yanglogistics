(function() {
// Enhanced Admin Dashboard with Mobile Responsiveness

// Global variables
let allOrders = [];
let filteredOrders = [];
let currentOrderId = null;

// Enhanced Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Global variables for real-time updates
let refreshInterval;
let lastUpdateTime = new Date();
let isRealTimeEnabled = true;

// Enhanced initialization with mobile optimization
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin page loaded - No authentication required');
    
    // Initialize dashboard directly
    try {
        console.log('Initializing dashboard...');
        await initializeDashboard();
        setupRealTimeUpdates();
        setupEventListeners();
        
        // Enhanced mobile-specific initializations
        if (window.innerWidth <= 768) {
            initializeMobileOptimizations();
        }
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        showNotification('Error loading dashboard. Please refresh the page.', 'error');
    }
});

// Enhanced mobile optimizations
function initializeMobileOptimizations() {
    // Optimize touch targets
    document.querySelectorAll('.btn, .nav-link, .table-row').forEach(el => {
        el.style.minHeight = '44px';
        el.style.minWidth = '44px';
    });
    
    // Optimize form inputs for mobile
    document.querySelectorAll('input, textarea, select').forEach(el => {
        el.style.fontSize = '16px'; // Prevents iOS zoom
        el.style.minHeight = '44px'; // Touch-friendly height
    });
    
    // Enhance table for mobile
    const ordersTable = document.querySelector('.orders-table');
    if (ordersTable) {
        ordersTable.style.fontSize = '0.9rem';
    }
    
    // Optimize modals for mobile
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.padding = '1rem';
        modal.style.margin = '1rem';
    });
    
    // Add mobile-specific event listeners
    setupMobileEventListeners();
}

// Logout function (no longer needed but kept for compatibility)
function logout() {
    // Clear any existing authentication data
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminToken');
    api.clearToken();
    
    // Redirect to home page instead of login
    window.location.href = 'index.html';
}

// Enhanced mobile event listeners
function setupMobileEventListeners() {
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Close mobile menu on orientation change
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
            
            // Re-apply mobile optimizations
            if (window.innerWidth <= 768) {
                initializeMobileOptimizations();
            }
        }, 500);
    });
    
    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Close mobile menu if screen becomes large
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                // Re-apply mobile optimizations
                initializeMobileOptimizations();
            }
        }, 250);
    });
}

// Enhanced dashboard initialization with mobile optimization
async function initializeDashboard() {
    try {
        showLoadingIndicator();
        await loadOrders();
        await updateDashboardStats();
        renderOrdersTable();
        hideLoadingIndicator();
        updateLastRefreshTime();
        
        // Enhanced mobile notification
        if (window.innerWidth <= 768) {
            showNotification('Dashboard loaded successfully!', 'success');
        }
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        hideLoadingIndicator();
        showNotification('Error initializing dashboard. Please refresh the page.', 'error');
    }
}

// Enhanced real-time updates with mobile optimization
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
            
            // Enhanced mobile notification
            const message = isRealTimeEnabled ? 'Real-time updates enabled' : 'Real-time updates disabled';
            const type = isRealTimeEnabled ? 'success' : 'info';
            showNotification(message, type);
        });
    }

    // Initialize real-time status
    updateRealTimeStatus();
}

// Enhanced data refresh with mobile optimization
async function refreshData() {
    try {
        showLoadingIndicator();
        const previousOrderCount = allOrders.length;
        
        await loadOrders();
        await updateDashboardStats();
        renderOrdersTable();
        
        const newOrderCount = allOrders.length;
        if (newOrderCount > previousOrderCount) {
            const message = `New order detected! Total orders: ${newOrderCount}`;
            showNotification(message, 'success');
        }
        
        updateLastRefreshTime();
        hideLoadingIndicator();
    } catch (error) {
        console.error('Error refreshing data:', error);
        hideLoadingIndicator();
        showNotification('Error refreshing data. Please try again.', 'error');
    }
}

// Enhanced order loading with mobile optimization
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

// Enhanced dashboard stats with mobile optimization
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

// Enhanced orders table rendering with mobile optimization
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

    // Enhanced mobile-friendly table rendering
    const isMobile = window.innerWidth <= 768;
    
    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        row.className = 'table-row';
        row.setAttribute('data-order-id', order.id);
        
        // Enhanced mobile-friendly date formatting
        const orderDate = new Date(order.createdAt);
        const formattedDate = isMobile ? 
            orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
            orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.trackingNumber}</td>
            <td>${order.customerName}</td>
            <td>${order.serviceType}</td>
            <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
            <td>${formattedDate}</td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="viewOrderDetails('${order.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="updateOrderStatus('${order.id}')" title="Update Status">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')" title="Delete Order">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Enhanced mobile touch handling
        if (isMobile) {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.actions')) {
                    viewOrderDetails(order.id);
                }
            });
        }
        
        tableBody.appendChild(row);
    });
}

// Enhanced event listeners with mobile optimization
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchOrders');
    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
        
        // Enhanced mobile search optimization
        if (window.innerWidth <= 768) {
            searchInput.addEventListener('focus', () => {
                searchInput.style.fontSize = '16px';
            });
        }
    }

    // Filter functionality
    const statusFilter = document.getElementById('statusFilter');
    const serviceFilter = document.getElementById('serviceFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }
    
    if (serviceFilter) {
        serviceFilter.addEventListener('change', filterOrders);
    }

    // Modal close buttons
    const closeButtons = document.querySelectorAll('.modal-close, #closeUpdateModalBtn2, #closeDetailsModalBtn, #closeDeleteModalBtn, #closeDeleteModalBtn2');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Update form submission
    const updateForm = document.getElementById('updateForm');
    if (updateForm) {
        updateForm.addEventListener('submit', handleStatusUpdate);
    }

    // Delete confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Enhanced order filtering with mobile optimization
function filterOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const serviceFilter = document.getElementById('serviceFilter').value;

    filteredOrders = allOrders.filter(order => {
        const matchesSearch = order.trackingNumber.toLowerCase().includes(searchTerm) ||
                            order.customerName.toLowerCase().includes(searchTerm) ||
                            order.customerEmail.toLowerCase().includes(searchTerm) ||
                            order.id.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || order.status === statusFilter;
        const matchesService = !serviceFilter || order.serviceType === serviceFilter;
        
                return matchesSearch && matchesStatus && matchesService;
    });
    
    renderOrdersTable();
    
    // Enhanced mobile notification
    if (window.innerWidth <= 768 && filteredOrders.length === 0) {
        showNotification('No orders match your search criteria', 'info');
    }
}

// Enhanced order details view with mobile optimization
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }

    currentOrderId = orderId;
    
    // Enhanced mobile-friendly date formatting
    const isMobile = window.innerWidth <= 768;
    const orderDate = new Date(order.createdAt);
    const estimatedDelivery = new Date(order.estimatedDelivery);
    const actualDelivery = order.actualDelivery ? new Date(order.actualDelivery) : null;
    
    const formatDate = (date) => {
        return isMobile ? 
            date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
            date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const modal = document.getElementById('detailsModal');
    const modalContent = document.getElementById('orderDetailsContent');
    
    modalContent.innerHTML = `
        <div class="order-details-grid">
            <div class="detail-section">
                <h4><i class="fas fa-info-circle"></i> Order Information</h4>
                <div class="detail-row">
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
                        <span>$${order.price || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-user"></i> Customer Information</h4>
                <div class="detail-row">
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
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-map-marker-alt"></i> Addresses</h4>
                <div class="detail-row">
                    <div class="detail-item">
                        <label>Pickup Address:</label>
                        <span>${order.pickupAddress}</span>
                    </div>
                    <div class="detail-item">
                        <label>Delivery Address:</label>
                        <span>${order.deliveryAddress}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-box"></i> Package Details</h4>
                <div class="detail-row">
                    <div class="detail-item">
                        <label>Weight:</label>
                        <span>${order.packageDetails.weight} kg</span>
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
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-calendar"></i> Timeline</h4>
                <div class="detail-row">
                    <div class="detail-item">
                        <label>Order Date:</label>
                        <span>${formatDate(orderDate)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Estimated Delivery:</label>
                        <span>${formatDate(estimatedDelivery)}</span>
                    </div>
                    ${actualDelivery ? `
                    <div class="detail-item">
                        <label>Actual Delivery:</label>
                        <span>${formatDate(actualDelivery)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${order.specialInstructions ? `
            <div class="detail-section">
                <h4><i class="fas fa-sticky-note"></i> Special Instructions</h4>
                <div class="detail-row">
                    <div class="detail-item full-width">
                        <span>${order.specialInstructions}</span>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    `;

    modal.style.display = 'flex';
    
    // Enhanced mobile modal handling
    if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
        
        // Add touch-friendly close functionality
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeDetailsModal();
            }
        });
    }
}

// Enhanced modal close with mobile optimization
function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    modal.style.display = 'none';
    
    // Restore body scroll on mobile
    if (window.innerWidth <= 768) {
        document.body.style.overflow = '';
    }
}

// Enhanced status update with mobile optimization
function updateOrderStatus(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }

    currentOrderId = orderId;
    
    // Populate modal fields
    document.getElementById('updateOrderId').textContent = order.id;
    document.getElementById('updateTrackingNumber').textContent = order.trackingNumber;
    document.getElementById('newStatus').value = order.status;
    document.getElementById('updateLocation').value = '';
    document.getElementById('updateDescription').value = '';
    
    const modal = document.getElementById('updateModal');
    modal.style.display = 'block';
    
    // Enhanced mobile modal handling
    if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
    }
}

// Enhanced update modal close with mobile optimization
function closeUpdateModal() {
    const modal = document.getElementById('updateModal');
    modal.style.display = 'none';
    
    // Restore body scroll on mobile
    if (window.innerWidth <= 768) {
        document.body.style.overflow = '';
    }
}

// Enhanced status update handling with mobile optimization
async function handleStatusUpdate(e) {
    e.preventDefault();
    
    const newStatus = document.getElementById('newStatus').value;
    const order = allOrders.find(o => o.id === currentOrderId);
    
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }

    try {
        showLoadingIndicator();
        
        // Use backend API to update order status
        const response = await api.updateOrderStatus(currentOrderId, { status: newStatus });
        
        if (response.success) {
            // Update local order with the complete updated order from server
            const updatedOrder = response.order;
            const orderIndex = allOrders.findIndex(o => o.id === currentOrderId);
            if (orderIndex !== -1) {
                allOrders[orderIndex] = updatedOrder;
            }
            
            // Update filtered orders
            const filteredOrderIndex = filteredOrders.findIndex(o => o.id === currentOrderId);
            if (filteredOrderIndex !== -1) {
                filteredOrders[filteredOrderIndex] = updatedOrder;
            }
            
            // Re-render table
            renderOrdersTable();
            
            // Update stats
            await updateDashboardStats();
            
            closeUpdateModal();
            showNotification('Order status updated successfully', 'success');
        } else {
            showNotification('Failed to update order status', 'error');
        }
        
        hideLoadingIndicator();
    } catch (error) {
        console.error('Error updating order status:', error);
        hideLoadingIndicator();
        showNotification('Error updating order status. Please try again.', 'error');
    }
}

// Enhanced order deletion with mobile optimization
function deleteOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }

    currentOrderId = orderId;
    
    const modal = document.getElementById('deleteOrderModal');
    const confirmText = document.getElementById('deleteConfirmText');
    
    confirmText.textContent = `Are you sure you want to delete order ${order.trackingNumber}? This action cannot be undone.`;
    modal.style.display = 'flex';
    
    // Enhanced mobile modal handling
    if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
        
        // Add touch-friendly close functionality
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeDeleteModal();
            }
        });
    }
}

// Enhanced delete modal close with mobile optimization
function closeDeleteModal() {
    const modal = document.getElementById('deleteOrderModal');
    modal.style.display = 'none';
    
    // Restore body scroll on mobile
    if (window.innerWidth <= 768) {
        document.body.style.overflow = '';
    }
}

// Enhanced delete confirmation with mobile optimization
async function confirmDelete() {
    try {
        showLoadingIndicator();
        
        // Use backend API to delete order
        const response = await api.deleteOrder(currentOrderId);
        
        if (response.success) {
            // Remove from local arrays
            allOrders = allOrders.filter(o => o.id !== currentOrderId);
            filteredOrders = filteredOrders.filter(o => o.id !== currentOrderId);
            
            // Re-render table
            renderOrdersTable();
            
            // Update stats
            await updateDashboardStats();
            
            closeDeleteModal();
            showNotification('Order deleted successfully', 'success');
        } else {
            showNotification('Failed to delete order', 'error');
        }
        
        hideLoadingIndicator();
    } catch (error) {
        console.error('Error deleting order:', error);
        hideLoadingIndicator();
        showNotification('Error deleting order. Please try again.', 'error');
    }
}

// Enhanced order export with mobile optimization
async function exportOrders() {
    try {
        showLoadingIndicator();
        
        const csvContent = generateCSV(filteredOrders);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        hideLoadingIndicator();
        showNotification('Orders exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting orders:', error);
        hideLoadingIndicator();
        showNotification('Error exporting orders. Please try again.', 'error');
    }
}

// Enhanced CSV generation with mobile optimization
function generateCSV(orders) {
    const headers = [
        'Tracking Number',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Service Type',
        'Status',
        'Price',
        'Order Date',
        'Estimated Delivery',
        'Pickup Address',
        'Delivery Address',
        'Package Weight',
        'Package Description'
    ];

    const csvRows = [headers.join(',')];

    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const estimatedDelivery = new Date(order.estimatedDelivery);
        
        const row = [
            order.trackingNumber,
            `"${order.customerName}"`,
            order.customerEmail,
            order.customerPhone,
            order.serviceType,
            order.status,
            order.price || 0,
            orderDate.toISOString(),
            estimatedDelivery.toISOString(),
            `"${order.pickupAddress}"`,
            `"${order.deliveryAddress}"`,
            order.packageDetails.weight,
            `"${order.packageDetails.description}"`
        ];
        
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

// Enhanced loading indicator with mobile optimization
function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// Enhanced last refresh time update
function updateLastRefreshTime() {
    lastUpdateTime = new Date();
    const lastRefreshElement = document.getElementById('lastRefreshTime');
    if (lastRefreshElement) {
        const isMobile = window.innerWidth <= 768;
        const timeString = isMobile ? 
            lastUpdateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
            lastUpdateTime.toLocaleTimeString();
        lastRefreshElement.textContent = timeString;
    }
}

// Enhanced real-time status update
function updateRealTimeStatus() {
    const realTimeStatus = document.getElementById('realTimeStatus');
    if (realTimeStatus) {
        realTimeStatus.textContent = isRealTimeEnabled ? 'Enabled' : 'Disabled';
        realTimeStatus.className = isRealTimeEnabled ? 'status-enabled' : 'status-disabled';
    }
}

// Enhanced notification system with mobile optimization
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
    
    // Mobile-optimized positioning
    const isMobile = window.innerWidth <= 768;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        ${isMobile ? 'bottom: 20px; left: 20px; right: 20px;' : 'top: 20px; right: 20px;'}
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateY(${isMobile ? '100%' : '0'}) translateX(${isMobile ? '0' : '100%'});
        transition: transform 0.3s ease;
        max-width: ${isMobile ? 'none' : '400px'};
        font-size: ${isMobile ? '0.9rem' : '1rem'};
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateY(0) translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = `translateY(${isMobile ? '100%' : '0'}) translateX(${isMobile ? '0' : '100%'})`;
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = `translateY(${isMobile ? '100%' : '0'}) translateX(${isMobile ? '0' : '100%'})`;
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Make functions globally available
window.viewOrderDetails = viewOrderDetails;
window.closeDetailsModal = closeDetailsModal;
window.updateOrderStatus = updateOrderStatus;
window.closeUpdateModal = closeUpdateModal;
window.handleStatusUpdate = handleStatusUpdate;
window.deleteOrder = deleteOrder;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.exportOrders = exportOrders;

console.log('Enhanced Admin Dashboard loaded successfully with mobile optimizations!');
})(); 