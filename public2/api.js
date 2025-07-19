// API Configuration
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

// API Service Class (Public Access)
class LogisticsAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Set authentication token (no longer needed)
    setToken(token) {
        // Token storage disabled for public access
    }

    // Clear authentication token (no longer needed)
    clearToken() {
        // Token clearing disabled for public access
    }

    // Get headers for API requests (public access)
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
            console.log('🔑 Adding Authorization header with token:', this.token.substring(0, 20) + '...');
        } else {
            console.log('⚠️ No token available for request');
        }
        
        return headers;
    }

    // Generic API request method (public access)
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: this.getHeaders(),
                ...options
            };

            console.log('🌐 Making API request to:', url);
            console.log('📋 Request config:', {
                method: config.method || 'GET',
                headers: config.headers,
                hasBody: !!config.body
            });

            const response = await fetch(url, config);
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API request failed:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ API request successful:', data);
            return data;
        } catch (error) {
            console.error('❌ API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(loginData) {
        console.log('API login called with:', loginData);
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        console.log('API login response:', response);

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

    async changePassword(email, currentPassword, newPassword, confirmPassword) {
        return await this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ email, currentPassword, newPassword, confirmPassword })
        });
    }

    // Admin management methods
    async getAdmins() {
        return await this.request('/admins');
    }

    async getAdmin(adminId) {
        return await this.request(`/admins/${adminId}`);
    }

    async changeAdminPassword(adminId, newPassword, confirmPassword) {
        return await this.request(`/admins/${adminId}/change-password`, {
            method: 'POST',
            body: JSON.stringify({ newPassword, confirmPassword })
        });
    }

    // Orders CRUD methods (public access)
    async getOrders(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.serviceType) params.append('serviceType', filters.serviceType);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const endpoint = `/orders${params.toString() ? '?' + params.toString() : ''}`;
        
        // Use public request without authentication
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
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

    async getOrder(orderId) {
        try {
            const url = `${this.baseURL}/orders/${orderId}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
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

    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrder(orderId, updateData) {
        try {
            const url = `${this.baseURL}/orders/${orderId}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
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

    async deleteOrder(orderId) {
        try {
            const url = `${this.baseURL}/orders/${orderId}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
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

    async updateOrderStatus(orderId, statusData) {
        try {
            const url = `${this.baseURL}/orders/${orderId}/status`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(statusData)
            });
            
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

    // Tracking method (public)
    async trackPackage(trackingNumber) {
        try {
            console.log('🔍 API: Tracking package:', trackingNumber);
            const url = `${this.baseURL}/track/${trackingNumber}`;
            console.log('🔗 API: Request URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 API: Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API: Error response:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ API: Success response:', data);
            return data;
        } catch (error) {
            console.error('❌ API: Tracking request failed:', error);
            throw error;
        }
    }

    // Dashboard methods (public access)
    async getDashboardStats() {
        try {
            const url = `${this.baseURL}/dashboard/stats`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Dashboard stats request failed:', error);
            throw error;
        }
    }

    async exportOrders(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.status) params.append('status', filters.status);
        if (filters.serviceType) params.append('serviceType', filters.serviceType);

        const endpoint = `/orders/export/csv${params.toString() ? '?' + params.toString() : ''}`;
        
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json'
                }
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

    // Health check (public endpoint, no auth required)
    async healthCheck() {
        try {
            const url = `${this.baseURL}/health`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
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