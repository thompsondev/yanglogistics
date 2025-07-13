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

// Order form submission
const orderForm = document.getElementById('orderForm');
const orderModal = document.getElementById('orderModal');

orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    showLoading();
    
    try {
        // Get form data
        const formData = new FormData(orderForm);
        const orderData = Object.fromEntries(formData.entries());
        
        // Validate form data
        if (!validateOrderData(orderData)) {
            hideLoading();
            return;
        }
        
        // Create new order
        const newOrder = await createOrder(orderData);
        
        // Show success modal
        showOrderModal(newOrder);
        hideLoading();
        
        // Reset form
        orderForm.reset();
        
    } catch (error) {
        console.error('Error creating order:', error);
        showNotification('Error creating order. Please try again.', 'error');
        hideLoading();
    }
});

// Validate order data
function validateOrderData(data) {
    // Check required fields
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'pickupAddress', 'deliveryAddress', 'packageWeight', 'packageDimensions', 'packageDescription'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return false;
        }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    // Validate phone - Accept various US phone number formats
    const phoneRegex = /^(\+?1[\s\-\.]?)?\(?[0-9]{3}\)?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}$/;
    const cleanPhone = data.customerPhone.replace(/[\s\-\(\)\.]/g, '');
    
    // Check if it's a valid US phone number
    if (!phoneRegex.test(cleanPhone)) {
        showNotification('Please enter a valid US phone number. Examples: 555-123-4567, (555) 123-4567, +1 555 123 4567, 5551234567', 'error');
        return false;
    }
    
    // Ensure it has exactly 10 digits (US format)
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
        showNotification('Phone number must have 10 digits (or 11 with country code).', 'error');
        return false;
    }
    // Validate weight
    if (parseFloat(data.packageWeight) <= 0) {
        showNotification('Package weight must be greater than 0.', 'error');
        return false;
    }
    
    // Validate dimensions format
    const dimensionsRegex = /^\d+x\d+x\d+$/;
    if (!dimensionsRegex.test(data.packageDimensions.replace(/\s/g, ''))) {
        showNotification('Please enter dimensions in format: LxWxH (e.g., 50x30x20)', 'error');
        return false;
    }
    
    return true;
}

// Create new order
async function createOrder(orderData) {
    try {
        // Prepare order data for API
        const orderPayload = {
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,
            pickupAddress: orderData.pickupAddress,
            deliveryAddress: orderData.deliveryAddress,
            packageDetails: {
                weight: orderData.packageWeight,
                dimensions: orderData.packageDimensions,
                description: orderData.packageDescription,
                quantity: parseInt(orderData.packageQuantity)
            },
            serviceType: orderData.serviceType,
            specialInstructions: orderData.specialInstructions || ''
        };
        
        // Use backend API to create order
        const response = await api.createOrder(orderPayload);
        
        if (response.success) {
            return response.order;
        } else {
            throw new Error('Failed to create order');
        }
        
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

// Calculate estimated delivery date
function calculateEstimatedDelivery(serviceType) {
    const now = new Date();
    let daysToAdd = 0;
    
    switch (serviceType) {
        case 'Standard Delivery':
            daysToAdd = 4; // 3-5 business days
            break;
        case 'Express Delivery':
            daysToAdd = 2; // 1-2 business days
            break;
        case 'Air Freight':
            daysToAdd = 3; // 2-3 business days
            break;
        case 'Ocean Freight':
            daysToAdd = 10; // 7-14 business days
            break;
        default:
            daysToAdd = 4;
    }
    
    const estimatedDate = new Date(now);
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    
    // Set to 5 PM on estimated date
    estimatedDate.setHours(17, 0, 0, 0);
    
    return estimatedDate;
}

// Calculate price based on service and package details
function calculatePrice(serviceType, weight, dimensions) {
    const weightNum = parseFloat(weight);
    const [length, width, height] = dimensions.split('x').map(d => parseFloat(d));
    const volume = length * width * height;
    
    let basePrice = 0;
    let weightMultiplier = 0;
    
    switch (serviceType) {
        case 'Standard Delivery':
            basePrice = 150;
            weightMultiplier = 5;
            break;
        case 'Express Delivery':
            basePrice = 250;
            weightMultiplier = 8;
            break;
        case 'Air Freight':
            basePrice = 400;
            weightMultiplier = 12;
            break;
        case 'Ocean Freight':
            basePrice = 200;
            weightMultiplier = 3;
            break;
        default:
            basePrice = 150;
            weightMultiplier = 5;
    }
    
    // Calculate price based on weight and volume
    const weightPrice = weightNum * weightMultiplier;
    const volumePrice = volume * 0.01; // $0.01 per cubic cm
    
    return Math.round(basePrice + Math.max(weightPrice, volumePrice));
}

// Show order confirmation modal
function showOrderModal(order) {
    try {
        console.log('Showing order modal with order:', order);
        
        const orderIdElement = document.getElementById('modalOrderId');
        const trackingElement = document.getElementById('modalTrackingNumber');
        const serviceTypeElement = document.getElementById('modalServiceType');
        const estimatedDeliveryElement = document.getElementById('modalEstimatedDelivery');
        
        if (!orderIdElement || !trackingElement || !serviceTypeElement || !estimatedDeliveryElement) {
            console.error('Modal elements not found');
            showNotification('Error displaying order confirmation', 'error');
            return;
        }
        
        orderIdElement.textContent = order.id || 'N/A';
        trackingElement.textContent = order.trackingNumber || 'N/A';
        serviceTypeElement.textContent = order.serviceType || 'N/A';
        
        if (order.estimatedDelivery) {
            const estimatedDelivery = new Date(order.estimatedDelivery);
            estimatedDeliveryElement.textContent = estimatedDelivery.toLocaleDateString() + ' ' + estimatedDelivery.toLocaleTimeString();
        } else {
            estimatedDeliveryElement.textContent = 'To be determined';
        }
        
        console.log('Modal elements populated. Tracking number:', order.trackingNumber);
        orderModal.style.display = 'flex';
        
    } catch (error) {
        console.error('Error showing order modal:', error);
        showNotification('Error displaying order confirmation', 'error');
    }
}

// Close order modal
function closeOrderModal() {
    orderModal.style.display = 'none';
}

// Track order function
function trackOrder() {
    try {
        const trackingElement = document.getElementById('modalTrackingNumber');
        if (!trackingElement) {
            console.error('Tracking number element not found');
            showNotification('Error: Tracking information not available', 'error');
            return;
        }
        
        const trackingNumber = trackingElement.textContent.trim();
        if (!trackingNumber) {
            console.error('Tracking number is empty');
            showNotification('Error: Tracking number not available', 'error');
            return;
        }
        
        console.log('Redirecting to tracking page with number:', trackingNumber);
        closeOrderModal();
        
        // Redirect to tracking page with tracking number
        window.location.href = `tracking.html?tracking=${encodeURIComponent(trackingNumber)}`;
    } catch (error) {
        console.error('Error in trackOrder function:', error);
        showNotification('Error tracking package. Please try again.', 'error');
    }
}

// Make trackOrder function globally available for backward compatibility
window.trackOrder = trackOrder;

// Show loading state
function showLoading() {
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Order...';
    submitBtn.disabled = true;
}

// Hide loading state
function hideLoading() {
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Place Order';
    submitBtn.disabled = false;
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

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        closeOrderModal();
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation to page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Add event listener for track order button
    const trackOrderBtn = document.getElementById('trackOrderBtn');
    if (trackOrderBtn) {
        trackOrderBtn.addEventListener('click', trackOrder);
        console.log('Track order button event listener added');
    } else {
        console.warn('Track order button not found');
    }
    
    console.log('Order page loaded successfully!');
}); 