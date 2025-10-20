// Enhanced Tracking Page with Mobile Responsiveness

// Form elements
const trackingForm = document.getElementById('trackingForm');
const trackingResult = document.getElementById('trackingResult');
const noResult = document.getElementById('noResult');

// Enhanced form submission with mobile optimizations
trackingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const trackingNumber = document.getElementById('trackingNumber').value.trim();
    
    if (!trackingNumber) {
        showNotification('Please enter a tracking number.', 'error');
        return;
    }
    
    try {
        showLoading();
        
        // Enhanced tracking with mobile-friendly error handling
        const response = await window.api.trackOrder(trackingNumber);
        
        if (response.success) {
            const order = response.order;
            console.log('📦 Order received:', order);
            
            // Check if order exists and has required properties
            if (order && order.trackingNumber) {
                console.log('✅ Valid order found, displaying result');
                displayTrackingResult(order);
            } else {
                console.log('❌ No valid order found, showing no result');
                showNoResult();
            }
        } else {
            console.log('❌ API returned error:', response.message);
            showNoResult();
        }
        
    } catch (error) {
        console.error('❌ Error tracking package:', error);
        
        // Professional error handling
        let errorMessage = 'Error tracking package. Please try again.';
        
        if (error.message.includes('404') || error.message.includes('not found')) {
            errorMessage = 'Tracking number not found. Please check the number and try again.';
        } else if (error.message.includes('500')) {
            errorMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
        showNoResult();
    } finally {
        hideLoading();
    }
});

// Enhanced order finding with mobile optimization
async function findOrderByTrackingNumber(trackingNumber) {
    try {
        console.log('🔍 Searching for tracking number:', trackingNumber);
        console.log('🔗 API URL:', window.API_BASE_URL);
        
        const response = await api.trackPackage(trackingNumber);
        console.log('✅ Tracking response:', response);
        
        // Validate the response
        if (!response) {
            console.log('❌ No response received');
            return null;
        }
        
        // Check if response has the expected structure
        if (typeof response === 'object' && response.trackingNumber) {
            console.log('✅ Valid order response received');
            return response;
        } else {
            console.log('❌ Invalid response structure:', response);
            return null;
        }
        
    } catch (error) {
        console.error('❌ API Error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            apiUrl: window.API_BASE_URL
        });
        throw error;
    }
}

// Enhanced tracking result display with modern UI
function displayTrackingResult(order) {
    // Hide no result message
    noResult.style.display = 'none';
    
    // Populate tracking information
    document.getElementById('displayTrackingNumber').textContent = order.trackingNumber;
    document.getElementById('orderStatus').textContent = order.status;
    document.getElementById('serviceType').textContent = order.serviceType;
    
    // Enhanced date formatting
    const estimatedDelivery = new Date(order.estimatedDelivery);
    const actualDelivery = order.actualDelivery ? new Date(order.actualDelivery) : null;
    
    const formatDate = (date) => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };
    
    document.getElementById('estimatedDelivery').textContent = formatDate(estimatedDelivery);
    
    // Package details
    document.getElementById('packageWeight').textContent = order.packageDetails.weight;
    document.getElementById('packageDescription').textContent = order.packageDetails.description;
    document.getElementById('packageQuantity').textContent = order.packageDetails.quantity;
    
    // Addresses
    document.getElementById('pickupAddress').textContent = order.pickupAddress;
    document.getElementById('deliveryAddress').textContent = order.deliveryAddress;
    
    // Update status dot color
    const statusDot = document.getElementById('statusDot');
    const status = order.status.toLowerCase();
    
    if (status.includes('delivered')) {
        statusDot.style.background = '#10b981';
    } else if (status.includes('transit') || status.includes('shipped')) {
        statusDot.style.background = '#667eea';
    } else if (status.includes('pending')) {
        statusDot.style.background = '#f59e0b';
    } else {
        statusDot.style.background = '#64748b';
    }
    
    // Enhanced timeline display
    displayTimeline(order.stages);
    
    // Show result
    trackingResult.style.display = 'block';
    
    // Smooth scroll to result
    trackingResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Enhanced professional timeline display with mobile optimization
function displayTimeline(stages) {
    const timelineContainer = document.getElementById('timelineContainer');
    timelineContainer.innerHTML = '';
    
    const isMobile = window.innerWidth <= 768;
    
    // Update summary information
    if (stages.length > 0) {
        const currentStage = stages[stages.length - 1];
        const lastUpdate = new Date(currentStage.timestamp);
        
        document.getElementById('currentLocation').textContent = currentStage.location;
        document.getElementById('lastUpdate').textContent = isMobile ? 
            lastUpdate.toLocaleDateString() + ' ' + lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
            lastUpdate.toLocaleDateString() + ' ' + lastUpdate.toLocaleTimeString();
    }
    
    stages.forEach((stage, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        const date = new Date(stage.timestamp);
        const formattedDate = isMobile ? 
            date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
            date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        // Determine marker class based on position
        let markerClass = '';
        if (index === stages.length - 1) {
            markerClass = 'active';
        } else if (index < stages.length - 1) {
            markerClass = 'completed';
        }
        
        timelineItem.innerHTML = `
            <div class="timeline-marker ${markerClass}"></div>
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

// Enhanced no result display with mobile optimization
function showNoResult() {
    trackingResult.style.display = 'none';
    noResult.style.display = 'block';
    hideLoading();
    
    // Enhanced scroll behavior for mobile
    if (window.innerWidth <= 768) {
        const offset = 80;
        const elementPosition = noResult.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    } else {
        noResult.scrollIntoView({ behavior: 'smooth' });
    }
}

// Enhanced clear tracking with mobile optimization
function clearTracking() {
    trackingForm.reset();
    trackingResult.style.display = 'none';
    noResult.style.display = 'none';
    
    // Enhanced scroll behavior for mobile
    if (window.innerWidth <= 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Enhanced loading states with mobile optimization
function showLoading() {
    const submitBtn = trackingForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
    submitBtn.disabled = true;
    
    // Add mobile-specific loading indicator
    if (window.innerWidth <= 768) {
        showNotification('Searching for your package...', 'info');
    }
}

function hideLoading() {
    const submitBtn = trackingForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-search"></i> Track Package';
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

// FAQ Toggle Function
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all other FAQ items
    const allFaqItems = document.querySelectorAll('.faq-item');
    allFaqItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        faqItem.classList.add('active');
        
        // Smooth scroll to the opened FAQ item on mobile
        if (window.innerWidth <= 768) {
            const offset = 100;
            const elementPosition = faqItem.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// Initialize FAQ functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add click event listeners to FAQ questions for better accessibility
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQ(this);
            }
        });
        
        // Add ARIA attributes for accessibility
        const faqItem = question.parentElement;
        const answer = faqItem.querySelector('.faq-answer');
        
        question.setAttribute('role', 'button');
        question.setAttribute('tabindex', '0');
        question.setAttribute('aria-expanded', 'false');
        question.setAttribute('aria-controls', `faq-answer-${Array.from(faqQuestions).indexOf(question)}`);
        
        answer.setAttribute('id', `faq-answer-${Array.from(faqQuestions).indexOf(question)}`);
        answer.setAttribute('aria-hidden', 'true');
    });
});

// Enhanced navbar background change with mobile optimization
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

// Enhanced mobile-specific initializations
document.addEventListener('DOMContentLoaded', () => {
    // Mobile-specific optimizations
    if (window.innerWidth <= 768) {
        // Optimize form inputs for mobile
        document.querySelectorAll('input, textarea, select').forEach(el => {
            el.style.fontSize = '16px'; // Prevents iOS zoom
            el.style.minHeight = '44px'; // Touch-friendly height
        });
        
        // Optimize buttons for touch
        document.querySelectorAll('.btn').forEach(btn => {
            btn.style.minHeight = '48px';
            btn.style.minWidth = '44px';
        });
        
        // Enhance tracking form for mobile
        const trackingInput = document.getElementById('trackingNumber');
        if (trackingInput) {
            trackingInput.style.fontSize = '16px';
            trackingInput.style.padding = '12px 16px';
            trackingInput.style.minHeight = '48px';
        }
        
        // Optimize timeline for mobile
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.style.padding = '1rem 0';
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
    
    // Check for tracking number in URL parameters with mobile optimization
    const urlParams = new URLSearchParams(window.location.search);
    const trackingNumber = urlParams.get('tracking');
    
    if (trackingNumber) {
        document.getElementById('trackingNumber').value = trackingNumber;
        // Auto-submit the form with delay for mobile
        setTimeout(() => {
            trackingForm.dispatchEvent(new Event('submit'));
        }, window.innerWidth <= 768 ? 1000 : 500); // Longer delay on mobile for better UX
    }
    
    console.log('Tracking page loaded successfully with mobile optimizations!');
}); 