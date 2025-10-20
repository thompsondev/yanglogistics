/**
 * YangLogistics Authentication Handler
 * Professional authentication management for Coolify deployment
 */

class YangLogisticsAuth {
    constructor() {
        this.config = window.YANGLOGISTICS_CONFIG;
        this.api = window.api;
        this.currentUser = null;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize authentication system
     */
    init() {
        if (this.isInitialized) return;
        
        this.currentUser = this.api.getCurrentUser();
        this.setupEventListeners();
        this.checkAuthenticationStatus();
        
        if (this.config.DEBUG) {
            console.log('🔐 YangLogistics Auth Initialized');
            console.log('👤 Current User:', this.currentUser);
        }
        
        this.isInitialized = true;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Change password form
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
        }

        // Logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="logout"]')) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    /**
     * Check authentication status
     */
    checkAuthenticationStatus() {
        const protectedPages = ['admin', 'admin-management', 'change-password'];
        const currentPage = this.getCurrentPage();
        
        if (protectedPages.includes(currentPage)) {
            if (!this.api.isAuthenticated()) {
                this.redirectToLogin();
                return;
            }
            
            // Verify token is still valid
            this.verifyToken();
        }
    }

    /**
     * Get current page name
     */
    getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop().replace('.html', '');
    }

    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        event.preventDefault();
        
        try {
            this.showLoading('Signing in...');
            
            const formData = new FormData(event.target);
            const credentials = Object.fromEntries(formData.entries());
            
            // Validate input
            if (!this.validateLoginData(credentials)) {
                this.hideLoading();
                return;
            }
            
            // Make API call
            const response = await this.api.login(credentials);
            
            // Handle response
            if (response.success) {
                this.currentUser = this.api.getCurrentUser();
                this.showNotification(response.message || 'Login successful! Redirecting...', 'success');
                
                // Redirect after delay
                setTimeout(() => {
                    this.redirectToAdmin();
                }, this.config.NOTIFICATION_DURATION / 2);
                
            } else {
                this.showNotification(response.message || 'Login failed. Please check your credentials.', 'error');
            }
            
        } catch (error) {
            this.handleAuthError(error, 'login');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle signup form submission
     */
    async handleSignup(event) {
        event.preventDefault();
        
        try {
            this.showLoading('Creating account...');
            
            const formData = new FormData(event.target);
            const userData = Object.fromEntries(formData.entries());
            
            // Validate input
            if (!this.validateSignupData(userData)) {
                this.hideLoading();
                return;
            }
            
            // Make API call
            const response = await this.api.signup(userData);
            
            // Handle response
            if (response.success) {
                this.showNotification(response.message || 'Account created successfully! Please check your email for verification.', 'success');
                
                // Redirect to login after delay
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, this.config.NOTIFICATION_DURATION);
                
            } else {
                this.showNotification(response.message || 'Signup failed. Please try again.', 'error');
            }
            
        } catch (error) {
            this.handleAuthError(error, 'signup');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle change password form submission
     */
    async handleChangePassword(event) {
        event.preventDefault();
        
        try {
            this.showLoading('Updating password...');
            
            const formData = new FormData(event.target);
            const passwordData = Object.fromEntries(formData.entries());
            
            // Validate input
            if (!this.validatePasswordData(passwordData)) {
                this.hideLoading();
                return;
            }
            
            // Make API call
            const response = await this.api.changePassword(passwordData);
            
            // Handle response
            if (response.success) {
                this.showNotification(response.message || 'Password updated successfully!', 'success');
                
                // Clear form
                event.target.reset();
                
            } else {
                this.showNotification(response.message || 'Password update failed. Please try again.', 'error');
            }
            
        } catch (error) {
            this.handleAuthError(error, 'change-password');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        this.api.logout();
        this.currentUser = null;
        this.showNotification('Logged out successfully!', 'success');
    }

    /**
     * Verify token validity
     */
    async verifyToken() {
        try {
            await this.api.healthCheck();
        } catch (error) {
            if (error.status === 401) {
                this.api.clearToken();
                this.redirectToLogin();
            }
        }
    }

    /**
     * Validate login data
     */
    validateLoginData(data) {
        const errors = [];
        
        if (!data.email || !data.email.trim()) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!data.password || !data.password.trim()) {
            errors.push('Password is required');
        }
        
        if (errors.length > 0) {
            this.showNotification(errors.join('. '), 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Validate signup data
     */
    validateSignupData(data) {
        const errors = [];
        
        // Required fields
        const requiredFields = [
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'company', label: 'Company' },
            { key: 'role', label: 'Role' },
            { key: 'password', label: 'Password' },
            { key: 'confirmPassword', label: 'Confirm Password' }
        ];
        
        requiredFields.forEach(field => {
            if (!data[field.key] || !data[field.key].trim()) {
                errors.push(`${field.label} is required`);
            }
        });
        
        // Email validation
        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Phone validation
        if (data.phone && !this.isValidPhone(data.phone)) {
            errors.push('Please enter a valid phone number');
        }
        
        // Password validation
        if (data.password) {
            if (data.password.length < 8) {
                errors.push('Password must be at least 8 characters long');
            } else if (!this.isStrongPassword(data.password)) {
                errors.push('Password must contain letters, numbers, and symbols');
            }
        }
        
        // Password confirmation
        if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        if (errors.length > 0) {
            this.showNotification(errors.join('. '), 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Validate password change data
     */
    validatePasswordData(data) {
        const errors = [];
        
        if (!data.email || !data.email.trim()) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!data.currentPassword || !data.currentPassword.trim()) {
            errors.push('Current password is required');
        }
        
        if (!data.newPassword || !data.newPassword.trim()) {
            errors.push('New password is required');
        } else if (data.newPassword.length < 8) {
            errors.push('New password must be at least 8 characters long');
        } else if (!this.isStrongPassword(data.newPassword)) {
            errors.push('New password must contain letters, numbers, and symbols');
        }
        
        if (!data.confirmPassword || !data.confirmPassword.trim()) {
            errors.push('Confirm password is required');
        } else if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
            errors.push('New passwords do not match');
        }
        
        if (errors.length > 0) {
            this.showNotification(errors.join('. '), 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Handle authentication errors
     */
    handleAuthError(error, action) {
        let message = 'An unexpected error occurred. Please try again.';
        
        if (error.code === 'OFFLINE') {
            message = 'You are currently offline. Please check your internet connection.';
        } else if (error.code === 'TIMEOUT') {
            message = 'Request timeout. Please try again.';
        } else if (error.status === 401) {
            message = 'Invalid credentials. Please check your email and password.';
        } else if (error.status === 403) {
            message = 'Access denied. You do not have permission to perform this action.';
        } else if (error.status === 404) {
            message = 'Service not found. Please contact support.';
        } else if (error.status >= 500) {
            message = 'Server error. Please try again later.';
        } else if (error.message) {
            message = error.message;
        }
        
        this.showNotification(message, 'error');
        
        if (this.config.DEBUG) {
            console.error(`❌ ${action} Error:`, error);
        }
    }

    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        // Create or update loading overlay
        let loadingOverlay = document.getElementById('loadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loadingOverlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-message">${message}</div>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        } else {
            loadingOverlay.querySelector('.loading-message').textContent = message;
        }
        
        loadingOverlay.style.display = 'flex';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, this.config.NOTIFICATION_DURATION);
        
        // Scroll to notification on mobile
        if (window.innerWidth <= 768) {
            notification.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        window.location.href = '/login.html';
    }

    /**
     * Redirect to admin page
     */
    redirectToAdmin() {
        window.location.href = '/admin.html';
    }

    /**
     * Utility: Validate email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Utility: Validate phone
     */
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/\s/g, '');
        return phoneRegex.test(cleanPhone);
    }

    /**
     * Utility: Check password strength
     */
    isStrongPassword(password) {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasLetter && hasNumber && hasSymbol;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.api.isAuthenticated();
    }
}

// Initialize authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new YangLogisticsAuth();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YangLogisticsAuth;
}