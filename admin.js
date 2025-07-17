// Enhanced Admin Dashboard with Mobile Responsiveness

// Global variables
let orders = [];
let filteredOrders = [];
let currentPage = 1;
const ordersPerPage = 10;
let realTimeEnabled = true;
let refreshInterval;

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

// Enhanced initialization with mobile optimization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Mobile-specific optimizations
        if (window.innerWidth <= 768) {
            // Optimize admin controls for mobile
            document.querySelectorAll('.admin-controls input, .admin-controls select').forEach(el => {
                el.style.fontSize = '16px';
                el.style.minHeight = '44px';
                el.style.padding = '12px 16px';
            });
            
            // Optimize buttons for touch
            document.querySelectorAll('.btn').forEach(btn => {
                btn.style.minHeight = '48px';
                btn.style.minWidth = '44px';
            });
            
            // Optimize table for mobile
            const tableContainer = document.querySelector('.table-responsive');
            if (tableContainer) {
                tableContainer.style.overflowX = 'auto';
                tableContainer.style.webkitOverflowScrolling = 'touch';
            }
        }
        
        // Initialize dashboard
        await initializeDashboard();
        
        // Set up real-time updates
        setupRealTimeUpdates();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Admin dashboard loaded successfully with mobile optimizations!');
        
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        showNotification('Error loading dashboard. Please refresh the page.', 'error');
    }
});

// Enhanced dashboard initialization with mobile optimization
async function initializeDashboard() {
    try {
        showLoading('Loading dashboard...');
        
        // Load orders
        await loadOrders();
        
        // Update stats with mobile-friendly display
        updateDashboardStats();
        
        // Render orders table with mobile optimization
        renderOrdersTable();
        
        // Update pagination with mobile-friendly controls
        updatePagination();
        
        hideLoading();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        hideLoading();
        showNotification('Error initializing dashboard. Please refresh the page.', 'error');
    }
}

// Enhanced order loading with mobile optimization
async function loadOrders() {
    try {
        showLoading('Loading orders...');
        
        const response = await api.getOrders();
        
        if (response.success) {
            orders = response.orders || [];
            filteredOrders = [...orders];
            
            // Enhanced mobile notification
            if (window.innerWidth <= 768 && orders.length > 0) {
                showNotification(`${orders.length} orders loaded successfully`, 'success');
            }
        } else {
            throw new Error('Failed to load orders');
        }
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        hideLoading();
        showNotification('Error loading orders. Please try again.', 'error');
        throw error;
    }
}

// Enhanced dashboard stats update with mobile optimization
function updateDashboardStats() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'Order Placed').length;
    const inTransitOrders = orders.filter(order => order.status === 'In Transit').length;
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
    
    // Update stats with mobile-friendly formatting
    const isMobile = window.innerWidth <= 768;
    
    document.getElementById('totalOrders').textContent = isMobile ? 
        totalOrders.toLocaleString() : totalOrders.toLocaleString();
    document.getElementById('pendingOrders').textContent = isMobile ? 
        pendingOrders.toLocaleString() : pendingOrders.toLocaleString();
    document.getElementById('inTransitOrders').textContent = isMobile ? 
        inTransitOrders.toLocaleString() : inTransitOrders.toLocaleString();
    document.getElementById('deliveredOrders').textContent = isMobile ? 
        deliveredOrders.toLocaleString() : deliveredOrders.toLocaleString();
    
    // Enhanced mobile stats display
    if (isMobile) {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.style.padding = '1rem';
            card.style.marginBottom = '1rem';
        });
    }
}

// Enhanced orders table rendering with mobile optimization
function renderOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    if (pageOrders.length === 0) {
        const noOrdersRow = document.createElement('tr');
        noOrdersRow.innerHTML = `
            <td colspan="8" class="no-orders">
                <i class="fas fa-box-open"></i>
                <h3>No orders found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </td>
        `;
        tableBody.appendChild(noOrdersRow);
        return;
    }
    
    const isMobile = window.innerWidth <= 768;
    
    pageOrders.forEach(order => {
        const row = document.createElement('tr');
        
        // Enhanced mobile-friendly row content
        if (isMobile) {
            row.innerHTML = `
                <td>
                    <div class="mobile-order-info">
                        <strong>${order.trackingNumber}</strong>
                        <small>${order.customerName}</small>
                        <span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span>
                    </div>
                </td>
                <td>
                    <div class="mobile-order-details">
                        <div>${order.serviceType}</div>
                        <small>${new Date(order.createdAt).toLocaleDateString()}</small>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewOrder('${order.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-update" onclick="updateOrderStatus('${order.id}')" title="Update Status">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteOrder('${order.id}')" title="Delete Order">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        } else {
            row.innerHTML = `
                <td>${order.trackingNumber}</td>
                <td>
                    <div class="customer-info">
                        <div>${order.customerName}</div>
                        <small>${order.customerEmail}</small>
                    </div>
                </td>
                <td>${order.serviceType}</td>
                <td>
                    <span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span>
                </td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>$${order.price}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewOrder('${order.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-update" onclick="updateOrderStatus('${order.id}')" title="Update Status">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteOrder('${order.id}')" title="Delete Order">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        }
        
        tableBody.appendChild(row);
    });
}

// Enhanced pagination with mobile optimization
function updatePagination() {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    paginationContainer.innerHTML = '';
    
    const isMobile = window.innerWidth <= 768;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-sm';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    paginationContainer.appendChild(prevBtn);
    
    // Page numbers with mobile optimization
    if (isMobile) {
        // Show only current page and total on mobile
        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `${currentPage} of ${totalPages}`;
        pageInfo.style.margin = '0 1rem';
        paginationContainer.appendChild(pageInfo);
    } else {
        // Show page numbers on desktop
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `btn btn-sm ${i === currentPage ? 'btn-primary' : ''}`;
                pageBtn.textContent = i;
                pageBtn.onclick = () => changePage(i);
                paginationContainer.appendChild(pageBtn);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.margin = '0 0.5rem';
                paginationContainer.appendChild(ellipsis);
            }
        }
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-sm';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => changePage(currentPage + 1);
    paginationContainer.appendChild(nextBtn);
}

// Enhanced page change with mobile optimization
function changePage(page) {
    currentPage = page;
    renderOrdersTable();
    updatePagination();
    
    // Enhanced scroll behavior for mobile
    if (window.innerWidth <= 768) {
        const tableContainer = document.querySelector('.orders-table-container');
        if (tableContainer) {
            tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Enhanced search functionality with mobile optimization
function searchOrders(query) {
    const searchTerm = query.toLowerCase();
    
    filteredOrders = orders.filter(order => 
        order.trackingNumber.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.customerEmail.toLowerCase().includes(searchTerm) ||
        order.serviceType.toLowerCase().includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    renderOrdersTable();
    updatePagination();
    
    // Enhanced mobile feedback
    if (window.innerWidth <= 768) {
        const resultCount = filteredOrders.length;
        showNotification(`${resultCount} order${resultCount !== 1 ? 's' : ''} found`, 'info');
    }
}

// Enhanced filter functionality with mobile optimization
function filterOrders(status, serviceType) {
    filteredOrders = [...orders];
    
    if (status && status !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    if (serviceType && serviceType !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.serviceType === serviceType);
    }
    
    currentPage = 1;
    renderOrdersTable();
    updatePagination();
    
    // Enhanced mobile feedback
    if (window.innerWidth <= 768) {
        const resultCount = filteredOrders.length;
        showNotification(`${resultCount} order${resultCount !== 1 ? 's' : ''} found`, 'info');
    }
}

// Enhanced real-time updates with mobile optimization
function setupRealTimeUpdates() {
    const toggleSwitch = document.getElementById('realTimeToggle');
    const statusIndicator = document.getElementById('realTimeStatus');
    
    if (toggleSwitch) {
        toggleSwitch.checked = realTimeEnabled;
        updateRealTimeStatus();
        
        toggleSwitch.addEventListener('change', () => {
            realTimeEnabled = toggleSwitch.checked;
            updateRealTimeStatus();
            
            if (realTimeEnabled) {
                startRealTimeUpdates();
            } else {
                stopRealTimeUpdates();
            }
        });
    }
    
    if (realTimeEnabled) {
        startRealTimeUpdates();
    }
}

// Enhanced real-time status update
function updateRealTimeStatus() {
    const statusIndicator = document.getElementById('realTimeStatus');
    if (statusIndicator) {
        statusIndicator.className = `real-time-status ${realTimeEnabled ? 'active' : 'paused'}`;
        statusIndicator.innerHTML = `
            <i class="fas fa-${realTimeEnabled ? 'play' : 'pause'}"></i>
            ${realTimeEnabled ? 'Live Updates' : 'Updates Paused'}
        `;
    }
}

// Enhanced real-time updates start
function startRealTimeUpdates() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    refreshInterval = setInterval(async () => {
        try {
            await loadOrders();
            updateDashboardStats();
            renderOrdersTable();
            updatePagination();
        } catch (error) {
            console.error('Error in real-time update:', error);
        }
    }, 30000); // Update every 30 seconds
}

// Enhanced real-time updates stop
function stopRealTimeUpdates() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Enhanced event listeners setup with mobile optimization
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchOrders');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchOrders(e.target.value);
            }, 300); // Debounce search for better mobile performance
        });
    }
    
    // Filter functionality
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            filterOrders(e.target.value);
        });
    }
    
    // Service filter functionality
    const serviceFilter = document.getElementById('serviceFilter');
    if (serviceFilter) {
        serviceFilter.addEventListener('change', (e) => {
            filterOrders(null, e.target.value);
        });
    }
    
    // Manual refresh button
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            try {
                showLoading('Refreshing...');
                await loadOrders();
                updateDashboardStats();
                renderOrdersTable();
                updatePagination();
                showNotification('Dashboard refreshed successfully', 'success');
            } catch (error) {
                console.error('Error refreshing dashboard:', error);
                showNotification('Error refreshing dashboard', 'error');
            } finally {
                hideLoading();
            }
        });
    }
    
    // Update form submission
    const updateForm = document.getElementById('updateForm');
    if (updateForm) {
        updateForm.addEventListener('submit', handleStatusUpdate);
    }
    
    // Modal close buttons
    const closeUpdateModalBtn = document.getElementById('closeUpdateModalBtn');
    const closeUpdateModalBtn2 = document.getElementById('closeUpdateModalBtn2');
    if (closeUpdateModalBtn) {
        closeUpdateModalBtn.addEventListener('click', closeUpdateModal);
    }
    if (closeUpdateModalBtn2) {
        closeUpdateModalBtn2.addEventListener('click', closeUpdateModal);
    }
    
    const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
    if (closeDetailsModalBtn) {
        closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
    }
    
    const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
    const closeDeleteModalBtn2 = document.getElementById('closeDeleteModalBtn2');
    if (closeDeleteModalBtn) {
        closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    }
    if (closeDeleteModalBtn2) {
        closeDeleteModalBtn2.addEventListener('click', closeDeleteModal);
    }
    
    // Delete confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
    
    // Real-time toggle
    const realTimeToggle = document.getElementById('realTimeToggle');
    if (realTimeToggle) {
        realTimeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                startRealTimeUpdates();
            } else {
                stopRealTimeUpdates();
            }
        });
    }
    
    // Enhanced mobile-specific event listeners
    if (window.innerWidth <= 768) {
        // Add touch-friendly interactions
        document.querySelectorAll('.btn-icon').forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'scale(0.95)';
            });
            
            btn.addEventListener('touchend', () => {
                btn.style.transform = 'scale(1)';
            });
        });
    }
}

// View order details
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
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
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // currentOrderId = orderId; // This variable is no longer global
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
    // currentOrderId = null; // This variable is no longer global
}

// Handle status update
async function handleStatusUpdate(e) {
    e.preventDefault();

    const orderId = document.getElementById('updateOrderId').textContent;
    const newStatus = document.getElementById('newStatus').value;
    const location = document.getElementById('updateLocation').value;
    const description = document.getElementById('updateDescription').value;

    if (!newStatus || !location || !description) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }

    try {
        // Use backend API to update order status
        const response = await api.updateOrderStatus(orderId, {
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
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('deleteOrderId').textContent = order.id;
    document.getElementById('deleteTrackingNumber').textContent = order.trackingNumber;
    // currentOrderId = orderId; // This variable is no longer global

    document.getElementById('deleteModal').style.display = 'flex';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    // currentOrderId = null; // This variable is no longer global
}

// Confirm delete
async function confirmDelete() {
    try {
        const orderId = document.getElementById('deleteOrderId').textContent;
        // Use backend API to delete order
        const response = await api.deleteOrder(orderId);

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

// Enhanced loading states with mobile optimization
function showLoading(message = 'Loading...') {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
        const messageElement = loadingIndicator.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
    
    // Enhanced mobile loading notification
    if (window.innerWidth <= 768) {
        showNotification(message, 'info');
    }
}

function hideLoading() {
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
        if (realTimeEnabled) {
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
        // currentOrderId = null; // This variable is no longer global
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

// Make functions globally available
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.closeDetailsModal = closeDetailsModal;
window.closeUpdateModal = closeUpdateModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;

console.log('Admin dashboard loaded successfully!');
console.log('Use debugAPI() in console to test API connectivity');
console.log('Use testAuth() in console to test authentication flow'); 