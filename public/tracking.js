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

// Tracking form submission
const trackingForm = document.getElementById('trackingForm');
const trackingResult = document.getElementById('trackingResult');
const noResult = document.getElementById('noResult');

trackingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const trackingNumber = document.getElementById('trackingNumber').value.trim();
    
    if (!trackingNumber) {
        showNotification('Please enter a tracking number', 'error');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        const order = await findOrderByTrackingNumber(trackingNumber);
        
        if (order) {
            displayTrackingResult(order);
        } else {
            showNoResult();
        }
    } catch (error) {
        console.error('Error tracking package:', error);
        showNotification('Error tracking package. Please try again.', 'error');
        hideLoading();
    }
});

// Find order by tracking number
async function findOrderByTrackingNumber(trackingNumber) {
    try {
        const order = await api.trackPackage(trackingNumber);
        return order;
    } catch (error) {
        console.error('Error tracking package:', error);
        throw error;
    }
}

// Display tracking result
function displayTrackingResult(order) {
    // Hide no result message
    noResult.style.display = 'none';
    
    // Populate tracking information
    document.getElementById('displayTrackingNumber').textContent = order.trackingNumber;
    document.getElementById('orderStatus').textContent = order.status;
    document.getElementById('serviceType').textContent = order.serviceType;
    
    // Format dates
    const estimatedDelivery = new Date(order.estimatedDelivery);
    const actualDelivery = order.actualDelivery ? new Date(order.actualDelivery) : null;
    
    document.getElementById('estimatedDelivery').textContent = estimatedDelivery.toLocaleDateString() + ' ' + estimatedDelivery.toLocaleTimeString();
    document.getElementById('actualDelivery').textContent = actualDelivery ? 
        (actualDelivery.toLocaleDateString() + ' ' + actualDelivery.toLocaleTimeString()) : 'Not delivered yet';
    
    // Package details
    document.getElementById('packageWeight').textContent = order.packageDetails.weight;
    document.getElementById('packageDescription').textContent = order.packageDetails.description;
    document.getElementById('packageQuantity').textContent = order.packageDetails.quantity;
    
    // Addresses
    document.getElementById('pickupAddress').textContent = order.pickupAddress;
    document.getElementById('deliveryAddress').textContent = order.deliveryAddress;
    
    // Update status badge color
    const statusBadge = document.getElementById('orderStatus');
    statusBadge.className = 'status-badge status-' + order.status.toLowerCase().replace(' ', '-');
    
    // Display timeline
    displayTimeline(order.stages);
    
    // Show result
    trackingResult.style.display = 'block';
    hideLoading();
    
    // Scroll to result
    trackingResult.scrollIntoView({ behavior: 'smooth' });
}

// Display timeline
function displayTimeline(stages) {
    const timelineContainer = document.getElementById('timelineContainer');
    timelineContainer.innerHTML = '';
    
    stages.forEach((stage, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        const date = new Date(stage.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        timelineItem.innerHTML = `
            <div class="timeline-marker ${index === stages.length - 1 ? 'active' : ''}"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <h4>${stage.stage}</h4>
                    <span class="timeline-date">${formattedDate}</span>
                </div>
                <p class="timeline-location">${stage.location}</p>
                <p class="timeline-description">${stage.description}</p>
            </div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
}

// Show no result message
function showNoResult() {
    trackingResult.style.display = 'none';
    noResult.style.display = 'block';
    hideLoading();
    
    // Scroll to no result
    noResult.scrollIntoView({ behavior: 'smooth' });
}

// Clear tracking form
function clearTracking() {
    trackingForm.reset();
    trackingResult.style.display = 'none';
    noResult.style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show loading state
function showLoading() {
    const submitBtn = trackingForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
    submitBtn.disabled = true;
}

// Hide loading state
function hideLoading() {
    const submitBtn = trackingForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-search"></i> Track Package';
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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation to page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Check for tracking number in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const trackingNumber = urlParams.get('tracking');
    
    if (trackingNumber) {
        document.getElementById('trackingNumber').value = trackingNumber;
        // Auto-submit the form
        setTimeout(() => {
            trackingForm.dispatchEvent(new Event('submit'));
        }, 500);
    }
    
    console.log('Tracking page loaded successfully!');
}); 