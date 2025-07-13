// API Configuration
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

// API Service Class
class LogisticsAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('adminToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('adminToken', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('adminToken');
    }

    // Get headers for API requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: this.getHeaders(),
                ...options
            };

            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async signup(userData) {
        return await this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Orders CRUD methods
    async getOrders(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.serviceType) params.append('serviceType', filters.serviceType);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const endpoint = `/orders${params.toString() ? '?' + params.toString() : ''}`;
        return await this.request(endpoint);
    }

    async getOrder(orderId) {
        return await this.request(`/orders/${orderId}`);
    }

    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrder(orderId, updateData) {
        return await this.request(`/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    async deleteOrder(orderId) {
        return await this.request(`/orders/${orderId}`, {
            method: 'DELETE'
        });
    }

    async updateOrderStatus(orderId, statusData) {
        return await this.request(`/orders/${orderId}/status`, {
            method: 'POST',
            body: JSON.stringify(statusData)
        });
    }

    // Tracking method (public)
    async trackPackage(trackingNumber) {
        return await this.request(`/track/${trackingNumber}`);
    }

    // Dashboard methods
    async getDashboardStats() {
        return await this.request('/dashboard/stats');
    }

    async exportOrders(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.status) params.append('status', filters.status);
        if (filters.serviceType) params.append('serviceType', filters.serviceType);

        const endpoint = `/orders/export/csv${params.toString() ? '?' + params.toString() : ''}`;
        
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

            return { success: true };
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        return await this.request('/health');
    }
}

// Create global API instance
const api = new LogisticsAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LogisticsAPI, api };
} else {
    window.api = api;
    window.LogisticsAPI = LogisticsAPI;
} 