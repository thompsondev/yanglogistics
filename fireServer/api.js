/**
 * YangLogistics API Service
 * Professional API client for Coolify deployment
 */

class YangLogisticsAPI {
    constructor() {
        this.config = window.YANGLOGISTICS_CONFIG;
        this.baseURL = this.config.API_BASE_URL;
        this.token = this.getStoredToken();
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
        
        // Setup online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        if (this.config.DEBUG) {
            console.log('🔌 YangLogistics API Service Initialized');
            console.log('🌐 Base URL:', this.baseURL);
            console.log('🔑 Token:', this.token ? 'Present' : 'Not found');
        }
    }

    /**
     * Get stored authentication token
     */
    getStoredToken() {
        try {
            return localStorage.getItem('yanglogistics_token');
        } catch (error) {
            console.warn('Failed to retrieve stored token:', error);
            return null;
        }
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        try {
            if (token) {
                localStorage.setItem('yanglogistics_token', token);
            } else {
                localStorage.removeItem('yanglogistics_token');
            }
        } catch (error) {
            console.warn('Failed to store token:', error);
        }
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
        try {
            localStorage.removeItem('yanglogistics_token');
        } catch (error) {
            console.warn('Failed to clear token:', error);
        }
    }

    /**
     * Get request headers
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Make API request with retry logic and error handling
     */
    async request(endpoint, options = {}) {
        const requestId = this.generateRequestId();
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: this.getHeaders(),
            ...options
        };

        if (this.config.DEBUG) {
            console.log(`🌐 [${requestId}] API Request:`, {
                url,
                method: config.method,
                headers: config.headers,
                hasBody: !!config.body
            });
        }

        // Check if offline
        if (!this.isOnline) {
            const error = new Error('You are currently offline. Please check your internet connection.');
            error.code = 'OFFLINE';
            error.requestId = requestId;
            throw error;
        }

        let lastError;
        
        // Retry logic
        for (let attempt = 1; attempt <= this.config.API_RETRY_ATTEMPTS; attempt++) {
            try {
                const response = await this.makeRequest(url, config, requestId);
                
                if (this.config.DEBUG) {
                    console.log(`✅ [${requestId}] API Success (attempt ${attempt}):`, response);
                }
                
                return response;
                
            } catch (error) {
                lastError = error;
                
                if (this.config.DEBUG) {
                    console.warn(`⚠️ [${requestId}] API Error (attempt ${attempt}):`, error.message);
                }
                
                // Don't retry for certain error types
                if (error.code === 'OFFLINE' || 
                    error.status === 401 || 
                    error.status === 403 || 
                    error.status === 404) {
                    break;
                }
                
                // Wait before retry
                if (attempt < this.config.API_RETRY_ATTEMPTS) {
                    await this.delay(this.config.API_RETRY_DELAY * attempt);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Make the actual HTTP request
     */
    async makeRequest(url, config, requestId) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.API_TIMEOUT);
        
        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (this.config.DEBUG) {
                console.log(`📡 [${requestId}] Response Status:`, response.status);
            }
            
            // Handle different response types
            if (!response.ok) {
                const errorData = await this.parseResponse(response);
                const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.data = errorData;
                error.requestId = requestId;
                throw error;
            }
            
            return await this.parseResponse(response);
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                const timeoutError = new Error('Request timeout. Please try again.');
                timeoutError.code = 'TIMEOUT';
                timeoutError.requestId = requestId;
                throw timeoutError;
            }
            
            throw error;
        }
    }

    /**
     * Parse response based on content type
     */
    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    }

    /**
     * Process queued requests when back online
     */
    processQueue() {
        if (this.requestQueue.length > 0) {
            console.log('🔄 Processing queued requests...');
            // Implementation for queuing requests when offline
        }
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ==================== AUTHENTICATION METHODS ====================

    /**
     * User login
     */
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.success && response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    /**
     * User signup
     */
    async signup(userData) {
        return await this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    /**
     * Change password
     */
    async changePassword(passwordData) {
        return await this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    }

    /**
     * Logout
     */
    logout() {
        this.clearToken();
        // Redirect to login page
        window.location.href = '/login.html';
    }

    // ==================== ORDER METHODS ====================

    /**
     * Get all orders
     */
    async getOrders(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        const endpoint = queryParams.toString() ? `/orders?${queryParams}` : '/orders';
        return await this.request(endpoint);
    }

    /**
     * Get single order
     */
    async getOrder(orderId) {
        return await this.request(`/orders/${orderId}`);
    }

    /**
     * Create new order
     */
    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    /**
     * Update order
     */
    async updateOrder(orderId, orderData) {
        return await this.request(`/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify(orderData)
        });
    }

    /**
     * Update order status (specific method for status updates)
     */
    async updateOrderStatus(orderId, statusData) {
        return await this.request(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify(statusData)
        });
    }

    /**
     * Delete order
     */
    async deleteOrder(orderId) {
        return await this.request(`/orders/${orderId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Track order by tracking number
     */
    async trackOrder(trackingNumber) {
        return await this.request(`/track/${trackingNumber}`);
    }

    // ==================== ADMIN METHODS ====================

    /**
     * Get all admins
     */
    async getAdmins() {
        return await this.request('/admins');
    }

    /**
     * Get single admin
     */
    async getAdmin(adminId) {
        return await this.request(`/admins/${adminId}`);
    }

    /**
     * Update admin
     */
    async updateAdmin(adminId, adminData) {
        return await this.request(`/admins/${adminId}`, {
            method: 'PUT',
            body: JSON.stringify(adminData)
        });
    }

    /**
     * Delete admin
     */
    async deleteAdmin(adminId) {
        return await this.request(`/admins/${adminId}`, {
            method: 'DELETE'
        });
    }

    // ==================== DASHBOARD METHODS ====================

    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        return await this.request('/dashboard/stats');
    }

    /**
     * Export orders to CSV
     */
    async exportOrdersCSV(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        const endpoint = queryParams.toString() ? `/orders/export/csv?${queryParams}` : '/orders/export/csv';
        return await this.request(endpoint);
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Health check
     */
    async healthCheck() {
        return await this.request('/health');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Get current user info from token
     */
    getCurrentUser() {
        if (!this.token) return null;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            return {
                id: payload.id,
                email: payload.email,
                role: payload.role,
                firstName: payload.firstName,
                lastName: payload.lastName
            };
        } catch (error) {
            console.warn('Failed to parse token:', error);
            return null;
        }
    }
}

// Create global API instance
window.api = new YangLogisticsAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YangLogisticsAPI;
}