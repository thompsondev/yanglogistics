# YangLogistics API - Professional Error Handling System

## 🎯 Overview

The YangLogistics API now includes a comprehensive, professional error handling system that provides:

- **Clear, user-friendly error messages**
- **Detailed error logging**
- **Consistent error response format**
- **Automatic error categorization**
- **Development vs Production error details**

## 📋 Error Response Format

All API errors now return a consistent JSON response format:

```json
{
  "success": false,
  "error": {
    "type": "ERROR_TYPE",
    "message": "User-friendly error message",
    "statusCode": 400,
    "details": "Additional error details",
    "action": "What the user should do next"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "abc123def"
}
```

## 🔧 Error Types and Status Codes

### 400 - Bad Request
- `VALIDATION_ERROR` - Invalid data format
- `INVALID_INPUT` - Invalid input provided
- `MISSING_FIELDS` - Required fields missing
- `INVALID_FORMAT` - Invalid data format

### 401 - Unauthorized
- `UNAUTHORIZED` - Not authenticated
- `INVALID_CREDENTIALS` - Wrong username/password
- `TOKEN_EXPIRED` - Authentication token expired
- `INVALID_TOKEN` - Invalid authentication token

### 403 - Forbidden
- `FORBIDDEN` - Access denied
- `INSUFFICIENT_PERMISSIONS` - Not enough permissions

### 404 - Not Found
- `NOT_FOUND` - Resource not found
- `RESOURCE_NOT_FOUND` - Specific resource missing
- `USER_NOT_FOUND` - User account not found
- `ORDER_NOT_FOUND` - Order not found

### 409 - Conflict
- `CONFLICT` - Resource conflict
- `DUPLICATE_ENTRY` - Entry already exists
- `ALREADY_EXISTS` - Resource already exists

### 422 - Unprocessable Entity
- `UNPROCESSABLE_ENTITY` - Cannot process request
- `INVALID_DATA` - Invalid data provided

### 429 - Too Many Requests
- `RATE_LIMIT_EXCEEDED` - Too many requests

### 500 - Internal Server Error
- `INTERNAL_ERROR` - Server error
- `DATABASE_ERROR` - Database error
- `FILE_SYSTEM_ERROR` - File system error
- `EXTERNAL_SERVICE_ERROR` - External service error

### 503 - Service Unavailable
- `SERVICE_UNAVAILABLE` - Service down
- `MAINTENANCE_MODE` - Under maintenance

## 🚀 Usage Examples

### 1. Login API Error Handling

**Request:**
```bash
POST /api/auth/login
{
  "email": "invalid-email",
  "password": ""
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "statusCode": 400,
    "details": "The email address you provided is not in a valid format.",
    "action": "Please enter a valid email address (e.g., user@example.com)."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "abc123def"
}
```

### 2. Order Creation Error Handling

**Request:**
```bash
POST /api/orders
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "123-456-7890",
  "pickupAddress": "123 Main St",
  "deliveryAddress": "456 Oak Ave",
  "serviceType": "Standard",
  "packageDetails": {
    "weight": -5,
    "description": "Test package"
  }
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Weight must be greater than 0",
    "statusCode": 400,
    "details": "Please enter a valid weight",
    "action": "Please provide a weight greater than 0"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "abc123def"
}
```

### 3. Tracking Not Found Error

**Request:**
```bash
GET /api/track/INVALID123
```

**Response:**
```json
{
  "success": false,
  "error": {
    "type": "ORDER_NOT_FOUND",
    "message": "Order not found",
    "statusCode": 404,
    "details": "No order was found with the provided tracking number or ID.",
    "action": "Please verify the order number or contact support if the issue persists."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "abc123def"
}
```

## 🛠️ Frontend Integration

### JavaScript Error Handling

```javascript
async function createOrder(orderData) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // Handle API error
      const error = result.error;
      
      // Show user-friendly error message
      showError(error.message);
      
      // Show additional details if available
      if (error.details) {
        showErrorDetails(error.details);
      }
      
      // Show action suggestion if available
      if (error.action) {
        showActionSuggestion(error.action);
      }
      
      return;
    }
    
    // Success - handle order creation
    handleOrderSuccess(result.order);
    
  } catch (error) {
    // Handle network or other errors
    showError('Network error. Please check your connection.');
  }
}

function showError(message) {
  // Display error message to user
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function showErrorDetails(details) {
  // Display additional error details
  const detailsDiv = document.getElementById('error-details');
  detailsDiv.textContent = details;
  detailsDiv.style.display = 'block';
}

function showActionSuggestion(action) {
  // Display action suggestion
  const actionDiv = document.getElementById('error-action');
  actionDiv.textContent = action;
  actionDiv.style.display = 'block';
}
```

### React Error Handling

```jsx
import React, { useState } from 'react';

function OrderForm() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error);
        return;
      }
      
      // Success
      console.log('Order created:', result.order);
      
    } catch (err) {
      setError({
        type: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        statusCode: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Form fields */}
      
      {error && (
        <div className="error-container">
          <div className="error-message">
            {error.message}
          </div>
          {error.details && (
            <div className="error-details">
              {error.details}
            </div>
          )}
          {error.action && (
            <div className="error-action">
              {error.action}
            </div>
          )}
        </div>
      )}
      
      <button 
        onClick={handleSubmit} 
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Order'}
      </button>
    </div>
  );
}
```

## 📊 Error Logging

All errors are automatically logged to:
- **Console** (development)
- **Log files** in `logs/error-YYYY-MM-DD.log` (production)

### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": {
    "name": "AppError",
    "message": "Invalid email format",
    "type": "VALIDATION_ERROR",
    "statusCode": 400,
    "stack": "Error stack trace...",
    "details": "Additional error details",
    "field": "email"
  },
  "request": {
    "method": "POST",
    "url": "/api/auth/login",
    "headers": {...},
    "body": {...},
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

## 🔧 Development vs Production

### Development Mode
- Shows detailed error information
- Includes stack traces
- Shows internal error details

### Production Mode
- Shows user-friendly messages only
- Hides sensitive information
- Provides actionable guidance

## 🎯 Best Practices

1. **Always check response status** before processing data
2. **Display user-friendly error messages** to users
3. **Log errors** for debugging purposes
4. **Provide actionable guidance** when possible
5. **Handle network errors** separately from API errors
6. **Use error types** to determine appropriate UI responses

## 🚀 Testing Error Handling

### Test Invalid Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": ""}'
```

### Test Missing Fields
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName": "John"}'
```

### Test Invalid Tracking
```bash
curl http://localhost:3000/api/track/INVALID123
```

This professional error handling system ensures your API provides clear, actionable feedback to users while maintaining detailed logging for debugging and monitoring.
