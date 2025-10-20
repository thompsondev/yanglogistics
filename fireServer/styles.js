/**
 * YangLogistics Professional Styles
 * Professional UI components for notifications and loading states
 */

const professionalStyles = `
/* Professional Notification System */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    min-width: 300px;
    max-width: 500px;
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    animation: slideInRight 0.3s ease-out;
    backdrop-filter: blur(10px);
}

.notification-success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border-left: 4px solid #047857;
}

.notification-error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border-left: 4px solid #b91c1c;
}

.notification-warning {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    border-left: 4px solid #b45309;
}

.notification-info {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border-left: 4px solid #1d4ed8;
}

.notification-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
}

.notification-message {
    flex: 1;
    font-weight: 500;
}

.notification-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
    margin-left: 12px;
    opacity: 0.8;
    transition: opacity 0.2s ease;
}

.notification-close:hover {
    opacity: 1;
}

/* Professional Loading Overlay */
#loadingOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: none;
    align-items: center;
    justify-content: center;
}

.loading-content {
    background: white;
    padding: 40px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    max-width: 300px;
    width: 90%;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

.loading-message {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #374151;
    margin: 0;
}

/* Professional Form Enhancements */
.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
    font-size: 14px;
}

.form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.2s ease;
    background: white;
}

.form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-error {
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
    font-weight: 500;
}

/* Professional Button Styles */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;
    font-family: inherit;
}

.btn-primary {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
    background: #e5e7eb;
    border-color: #d1d5db;
}

.btn-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
}

.btn-danger:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}

/* Professional Card Styles */
.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.card-header {
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
}

.card-body {
    padding: 20px;
}

.card-footer {
    padding: 20px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

/* Professional Table Styles */
.table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.table th,
.table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}

.table th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.table tbody tr:hover {
    background: #f9fafb;
}

/* Professional Status Badges */
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.status-badge-success {
    background: #dcfce7;
    color: #166534;
}

.status-badge-warning {
    background: #fef3c7;
    color: #92400e;
}

.status-badge-error {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge-info {
    background: #dbeafe;
    color: #1e40af;
}

/* Professional Animations */
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .notification {
        top: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
    }
    
    .notification-content {
        padding: 12px 16px;
    }
    
    .loading-content {
        padding: 30px 20px;
        margin: 0 20px;
    }
    
    .form-input {
        font-size: 16px; /* Prevents zoom on iOS */
    }
    
    .btn {
        width: 100%;
        margin-bottom: 10px;
    }
    
    .table {
        font-size: 12px;
    }
    
    .table th,
    .table td {
        padding: 8px 12px;
    }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
    .loading-content {
        background: #1f2937;
        color: #f9fafb;
    }
    
    .loading-message {
        color: #f9fafb;
    }
    
    .form-input {
        background: #374151;
        border-color: #4b5563;
        color: #f9fafb;
    }
    
    .form-input:focus {
        border-color: #3b82f6;
    }
    
    .form-label {
        color: #f9fafb;
    }
    
    .card {
        background: #1f2937;
        border-color: #374151;
    }
    
    .card-header,
    .card-footer {
        background: #111827;
        border-color: #374151;
    }
    
    .card-title {
        color: #f9fafb;
    }
    
    .table th {
        background: #111827;
        color: #f9fafb;
    }
    
    .table td {
        color: #f9fafb;
    }
    
    .table tbody tr:hover {
        background: #111827;
    }
}

/* Print Styles */
@media print {
    .notification,
    #loadingOverlay {
        display: none !important;
    }
    
    .btn {
        background: none !important;
        border: 1px solid #000 !important;
        color: #000 !important;
    }
}
`;

// Inject styles into the page
function injectProfessionalStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = professionalStyles;
    document.head.appendChild(styleElement);
}

// Initialize styles when DOM is loaded
document.addEventListener('DOMContentLoaded', injectProfessionalStyles);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { injectProfessionalStyles };
}
