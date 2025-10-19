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

// Enhanced Order Form with Mobile Responsiveness

// Form elements
const orderForm = document.getElementById('orderForm');
const orderModal = document.getElementById('orderModal');

// Enhanced form submission with mobile optimizations
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        showLoading();
        
        // Get form data with enhanced mobile handling
        const formData = new FormData(orderForm);
        const orderData = Object.fromEntries(formData.entries());
        
        // Enhanced validation with mobile-friendly error messages
        if (!validateOrderData(orderData)) {
            hideLoading();
            return;
        }
        
        // Create new order
        const newOrder = await createOrder(orderData);
        
        // Show success modal with mobile optimization
        showOrderModal(newOrder);
        hideLoading();
        
        // Reset form
        orderForm.reset();
        
        // Scroll to top on mobile for better UX
        if (window.innerWidth <= 768) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
    } catch (error) {
        console.error('Error creating order:', error);
        showNotification('Error creating order. Please try again.', 'error');
        hideLoading();
    }
});

// Enhanced validation with mobile-friendly messages
function validateOrderData(data) {
    // Check required fields with mobile-optimized error messages
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'pickupAddress', 'deliveryAddress', 'packageWeight', 'packageDescription'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
            showNotification(`Please fill in the ${fieldName} field.`, 'error');
            
            // Scroll to the field on mobile
            const fieldElement = document.getElementById(field);
            if (fieldElement && window.innerWidth <= 768) {
                fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                fieldElement.focus();
            }
            return false;
        }
    }
    
    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
        showNotification('Please enter a valid email address.', 'error');
        const emailField = document.getElementById('customerEmail');
        if (emailField && window.innerWidth <= 768) {
            emailField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            emailField.focus();
        }
        return false;
    }
    
    // Enhanced phone validation with mobile-friendly examples
    const phoneRegex = /^(\+?1[\s\-\.]?)?\(?[0-9]{3}\)?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}$/;
    const cleanPhone = data.customerPhone.replace(/[\s\-\(\)\.]/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
        showNotification('Please enter a valid phone number (e.g., 555-123-4567 or (555) 123-4567)', 'error');
        const phoneField = document.getElementById('customerPhone');
        if (phoneField && window.innerWidth <= 768) {
            phoneField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            phoneField.focus();
        }
        return false;
    }
    
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
        showNotification('Phone number must have 10 digits (or 11 with country code).', 'error');
        const phoneField = document.getElementById('customerPhone');
        if (phoneField && window.innerWidth <= 768) {
            phoneField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            phoneField.focus();
        }
        return false;
    }
    
    // Enhanced weight validation
    if (parseFloat(data.packageWeight) <= 0) {
        showNotification('Package weight must be greater than 0.', 'error');
        const weightField = document.getElementById('packageWeight');
        if (weightField && window.innerWidth <= 768) {
            weightField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            weightField.focus();
        }
        return false;
    }
    
    return true;
}

// Enhanced order creation with mobile optimizations
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
                description: orderData.packageDescription,
                quantity: parseInt(orderData.packageQuantity) || 1
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

// Enhanced estimated delivery calculation
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

// Enhanced price calculation
function calculatePrice(serviceType, weight) {
    const weightNum = parseFloat(weight);
    
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
    
    // Calculate price based on weight
    const weightPrice = weightNum * weightMultiplier;
    
    return Math.round(basePrice + weightPrice);
}

// Enhanced order modal with mobile optimization
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
        
        // Mobile-specific modal handling
        if (window.innerWidth <= 768) {
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
            
            // Add touch-friendly close functionality
            orderModal.addEventListener('click', (e) => {
                if (e.target === orderModal) {
                    closeOrderModal();
                }
            });
        }
        
    } catch (error) {
        console.error('Error showing order modal:', error);
        showNotification('Error displaying order confirmation', 'error');
    }
}

// Enhanced modal close with mobile optimization
function closeOrderModal() {
    orderModal.style.display = 'none';
    
    // Restore body scroll on mobile
    if (window.innerWidth <= 768) {
        document.body.style.overflow = '';
    }
}

// Enhanced track order function with mobile optimization
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

// Make trackOrder function globally available
window.trackOrder = trackOrder;

// Enhanced loading states with mobile optimization
function showLoading() {
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Order...';
    submitBtn.disabled = true;
    
    // Add mobile-specific loading indicator
    if (window.innerWidth <= 768) {
        showNotification('Creating your order...', 'info');
    }
}

function hideLoading() {
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Place Order';
    submitBtn.disabled = false;
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

// Enhanced mobile-specific initializations
document.addEventListener('DOMContentLoaded', () => {
    // Mobile-specific optimizations
    if (window.innerWidth <= 768) {
        // Optimize form inputs for mobile
        document.querySelectorAll('input, textarea, select').forEach(el => {
            el.style.fontSize = '16px'; // Prevents iOS zoom
            el.style.minHeight = '44px'; // Touch-friendly height
        });
        
        // Add touch-friendly service selection
        document.querySelectorAll('.service-option label').forEach(label => {
            label.style.minHeight = '60px';
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.padding = '12px';
        });
        
        // Optimize buttons for touch
        document.querySelectorAll('.btn').forEach(btn => {
            btn.style.minHeight = '48px';
            btn.style.minWidth = '44px';
        });
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Re-apply mobile optimizations after orientation change
            if (window.innerWidth <= 768) {
                document.querySelectorAll('input, textarea, select').forEach(el => {
                    el.style.fontSize = '16px';
                    el.style.minHeight = '44px';
                });
            }
        }, 500);
    });
    
    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Re-apply optimizations based on new screen size
            if (window.innerWidth <= 768) {
                document.querySelectorAll('input, textarea, select').forEach(el => {
                    el.style.fontSize = '16px';
                    el.style.minHeight = '44px';
                });
            }
        }, 250);
    });
    
    console.log('Order page loaded successfully with mobile optimizations!');
}); 