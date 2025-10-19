/**
 * Professional Error Handling System for YangLogistics API
 * Provides comprehensive error handling, logging, and user-friendly responses
 */

const fs = require('fs').promises;
const path = require('path');

// Error types and their corresponding HTTP status codes
const ERROR_TYPES = {
    // 400 - Bad Request
    VALIDATION_ERROR: { status: 400, type: 'VALIDATION_ERROR' },
    INVALID_INPUT: { status: 400, type: 'INVALID_INPUT' },
    MISSING_FIELDS: { status: 400, type: 'MISSING_FIELDS' },
    INVALID_FORMAT: { status: 400, type: 'INVALID_FORMAT' },
    
    // 401 - Unauthorized
    UNAUTHORIZED: { status: 401, type: 'UNAUTHORIZED' },
    INVALID_CREDENTIALS: { status: 401, type: 'INVALID_CREDENTIALS' },
    TOKEN_EXPIRED: { status: 401, type: 'TOKEN_EXPIRED' },
    INVALID_TOKEN: { status: 401, type: 'INVALID_TOKEN' },
    
    // 403 - Forbidden
    FORBIDDEN: { status: 403, type: 'FORBIDDEN' },
    INSUFFICIENT_PERMISSIONS: { status: 403, type: 'INSUFFICIENT_PERMISSIONS' },
    
    // 404 - Not Found
    NOT_FOUND: { status: 404, type: 'NOT_FOUND' },
    RESOURCE_NOT_FOUND: { status: 404, type: 'RESOURCE_NOT_FOUND' },
    USER_NOT_FOUND: { status: 404, type: 'USER_NOT_FOUND' },
    ORDER_NOT_FOUND: { status: 404, type: 'ORDER_NOT_FOUND' },
    
    // 409 - Conflict
    CONFLICT: { status: 409, type: 'CONFLICT' },
    DUPLICATE_ENTRY: { status: 409, type: 'DUPLICATE_ENTRY' },
    ALREADY_EXISTS: { status: 409, type: 'ALREADY_EXISTS' },
    
    // 422 - Unprocessable Entity
    UNPROCESSABLE_ENTITY: { status: 422, type: 'UNPROCESSABLE_ENTITY' },
    INVALID_DATA: { status: 422, type: 'INVALID_DATA' },
    
    // 429 - Too Many Requests
    RATE_LIMIT_EXCEEDED: { status: 429, type: 'RATE_LIMIT_EXCEEDED' },
    
    // 500 - Internal Server Error
    INTERNAL_ERROR: { status: 500, type: 'INTERNAL_ERROR' },
    DATABASE_ERROR: { status: 500, type: 'DATABASE_ERROR' },
    FILE_SYSTEM_ERROR: { status: 500, type: 'FILE_SYSTEM_ERROR' },
    EXTERNAL_SERVICE_ERROR: { status: 500, type: 'EXTERNAL_SERVICE_ERROR' },
    
    // 503 - Service Unavailable
    SERVICE_UNAVAILABLE: { status: 503, type: 'SERVICE_UNAVAILABLE' },
    MAINTENANCE_MODE: { status: 503, type: 'MAINTENANCE_MODE' }
};

// User-friendly error messages
const ERROR_MESSAGES = {
    // Validation Errors
    VALIDATION_ERROR: 'The provided data is invalid. Please check your input and try again.',
    INVALID_INPUT: 'Invalid input provided. Please ensure all fields are correctly formatted.',
    MISSING_FIELDS: 'Required fields are missing. Please provide all necessary information.',
    INVALID_FORMAT: 'Invalid format detected. Please check the data format and try again.',
    
    // Authentication Errors
    UNAUTHORIZED: 'You are not authorized to access this resource. Please log in.',
    INVALID_CREDENTIALS: 'Invalid username or password. Please check your credentials.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    INVALID_TOKEN: 'Invalid authentication token. Please log in again.',
    
    // Permission Errors
    FORBIDDEN: 'You do not have permission to perform this action.',
    INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions for this operation.',
    
    // Not Found Errors
    NOT_FOUND: 'The requested resource was not found.',
    RESOURCE_NOT_FOUND: 'The requested resource could not be found.',
    USER_NOT_FOUND: 'User account not found. Please check your credentials.',
    ORDER_NOT_FOUND: 'Order not found. Please verify the order number.',
    
    // Conflict Errors
    CONFLICT: 'A conflict occurred while processing your request.',
    DUPLICATE_ENTRY: 'This entry already exists. Please use a different value.',
    ALREADY_EXISTS: 'This resource already exists. Please choose a different option.',
    
    // Data Errors
    UNPROCESSABLE_ENTITY: 'The request data cannot be processed.',
    INVALID_DATA: 'The provided data is invalid or corrupted.',
    
    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment before trying again.',
    
    // Server Errors
    INTERNAL_ERROR: 'An internal server error occurred. Please try again later.',
    DATABASE_ERROR: 'A database error occurred. Please try again later.',
    FILE_SYSTEM_ERROR: 'A file system error occurred. Please try again later.',
    EXTERNAL_SERVICE_ERROR: 'An external service error occurred. Please try again later.',
    
    // Service Errors
    SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
    MAINTENANCE_MODE: 'The system is currently under maintenance. Please try again later.'
};

// Detailed error messages for specific scenarios
const DETAILED_ERROR_MESSAGES = {
    // Authentication
    'INVALID_CREDENTIALS': {
        message: 'Invalid username or password',
        details: 'Please check your email and password. Make sure caps lock is off.',
        action: 'Try logging in again or reset your password if needed.'
    },
    'TOKEN_EXPIRED': {
        message: 'Your session has expired',
        details: 'For security reasons, your session expires after a period of inactivity.',
        action: 'Please log in again to continue.'
    },
    
    // Validation
    'MISSING_FIELDS': {
        message: 'Required information is missing',
        details: 'Some required fields were not provided in your request.',
        action: 'Please fill in all required fields and try again.'
    },
    'INVALID_EMAIL': {
        message: 'Invalid email address format',
        details: 'The email address you provided is not in a valid format.',
        action: 'Please enter a valid email address (e.g., user@example.com).'
    },
    'INVALID_PHONE': {
        message: 'Invalid phone number format',
        details: 'The phone number you provided is not in a valid format.',
        action: 'Please enter a valid phone number (e.g., +1234567890).'
    },
    
    // Orders
    'ORDER_NOT_FOUND': {
        message: 'Order not found',
        details: 'No order was found with the provided tracking number or ID.',
        action: 'Please verify the order number or contact support if the issue persists.'
    },
    'INVALID_TRACKING_NUMBER': {
        message: 'Invalid tracking number format',
        details: 'The tracking number format is not recognized.',
        action: 'Please check the tracking number format and try again.'
    },
    
    // Database
    'DATABASE_CONNECTION_ERROR': {
        message: 'Database connection failed',
        details: 'Unable to connect to the database at this time.',
        action: 'Please try again in a few moments. If the problem persists, contact support.'
    },
    'DATABASE_QUERY_ERROR': {
        message: 'Database query failed',
        details: 'An error occurred while processing your request in the database.',
        action: 'Please try again. If the problem persists, contact support.'
    }
};

class AppError extends Error {
    constructor(errorType, message, details = null, field = null) {
        super(message || ERROR_MESSAGES[errorType] || 'An error occurred');
        this.name = 'AppError';
        this.type = errorType;
        this.statusCode = ERROR_TYPES[errorType]?.status || 500;
        this.details = details;
        this.field = field;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// Create specific error instances
const createError = {
    validation: (message, field = null, details = null) => 
        new AppError('VALIDATION_ERROR', message, details, field),
    
    invalidInput: (message, field = null, details = null) => 
        new AppError('INVALID_INPUT', message, details, field),
    
    missingFields: (fields, details = null) => 
        new AppError('MISSING_FIELDS', `Missing required fields: ${fields.join(', ')}`, details),
    
    unauthorized: (message = null) => 
        new AppError('UNAUTHORIZED', message),
    
    invalidCredentials: (details = null) => 
        new AppError('INVALID_CREDENTIALS', null, details),
    
    tokenExpired: (details = null) => 
        new AppError('TOKEN_EXPIRED', null, details),
    
    forbidden: (message = null) => 
        new AppError('FORBIDDEN', message),
    
    notFound: (resource = 'Resource') => 
        new AppError('NOT_FOUND', `${resource} not found`),
    
    orderNotFound: (trackingNumber = null) => 
        new AppError('ORDER_NOT_FOUND', null, trackingNumber ? `Tracking number: ${trackingNumber}` : null),
    
    conflict: (message, details = null) => 
        new AppError('CONFLICT', message, details),
    
    duplicateEntry: (field, value = null) => 
        new AppError('DUPLICATE_ENTRY', `${field} already exists`, value),
    
    rateLimitExceeded: (retryAfter = null) => 
        new AppError('RATE_LIMIT_EXCEEDED', null, retryAfter ? `Retry after ${retryAfter} seconds` : null),
    
    internal: (message = null, details = null) => 
        new AppError('INTERNAL_ERROR', message, details),
    
    database: (operation = null, details = null) => 
        new AppError('DATABASE_ERROR', `Database error${operation ? ` during ${operation}` : ''}`, details),
    
    fileSystem: (operation = null, details = null) => 
        new AppError('FILE_SYSTEM_ERROR', `File system error${operation ? ` during ${operation}` : ''}`, details)
};

// Logging function
const logError = async (error, req = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        error: {
            name: error.name,
            message: error.message,
            type: error.type || 'UNKNOWN',
            statusCode: error.statusCode || 500,
            stack: error.stack,
            details: error.details,
            field: error.field
        },
        request: req ? {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        } : null
    };
    
    try {
        const logDir = path.join(__dirname, 'logs');
        await fs.mkdir(logDir, { recursive: true });
        
        const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);
        await fs.appendFile(logFile, JSON.stringify(logEntry, null, 2) + '\n');
    } catch (logError) {
        console.error('Failed to log error:', logError);
    }
};

// Format error response for client
const formatErrorResponse = (error, isDevelopment = false) => {
    const response = {
        success: false,
        error: {
            type: error.type || 'UNKNOWN_ERROR',
            message: error.message || 'An error occurred',
            statusCode: error.statusCode || 500
        },
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9)
    };
    
    // Add detailed information in development mode
    if (isDevelopment) {
        response.error.details = error.details;
        response.error.field = error.field;
        response.error.stack = error.stack;
    } else {
        // In production, provide user-friendly details
        const detailedError = DETAILED_ERROR_MESSAGES[error.type];
        if (detailedError) {
            response.error.details = detailedError.details;
            response.error.action = detailedError.action;
        }
    }
    
    return response;
};

// Main error handling middleware
const errorHandler = async (error, req, res, next) => {
    // Log the error
    await logError(error, req);
    
    // Determine if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
        const validationError = createError.validation(
            'Validation failed',
            null,
            error.details || error.message
        );
        return res.status(validationError.statusCode).json(formatErrorResponse(validationError, isDevelopment));
    }
    
    if (error.name === 'JsonWebTokenError') {
        const tokenError = createError.invalidToken('Invalid authentication token');
        return res.status(tokenError.statusCode).json(formatErrorResponse(tokenError, isDevelopment));
    }
    
    if (error.name === 'TokenExpiredError') {
        const expiredError = createError.tokenExpired('Authentication token has expired');
        return res.status(expiredError.statusCode).json(formatErrorResponse(expiredError, isDevelopment));
    }
    
    if (error.name === 'MulterError') {
        const multerError = createError.validation(
            'File upload error',
            'file',
            error.message
        );
        return res.status(multerError.statusCode).json(formatErrorResponse(multerError, isDevelopment));
    }
    
    // Handle custom AppError
    if (error instanceof AppError) {
        return res.status(error.statusCode).json(formatErrorResponse(error, isDevelopment));
    }
    
    // Handle unexpected errors
    const internalError = createError.internal(
        'An unexpected error occurred',
        isDevelopment ? error.message : null
    );
    
    return res.status(internalError.statusCode).json(formatErrorResponse(internalError, isDevelopment));
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
    const notFoundError = createError.notFound(`Route ${req.method} ${req.originalUrl}`);
    res.status(notFoundError.statusCode).json(formatErrorResponse(notFoundError, process.env.NODE_ENV === 'development'));
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Validation helper
const validateRequired = (data, requiredFields) => {
    const missing = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '');
    if (missing.length > 0) {
        throw createError.missingFields(missing);
    }
};

// Email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw createError.validation('Invalid email format', 'email', 'Please provide a valid email address');
    }
};

// Phone validation
const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        throw createError.validation('Invalid phone number format', 'phone', 'Please provide a valid phone number');
    }
};

module.exports = {
    AppError,
    createError,
    errorHandler,
    notFoundHandler,
    asyncHandler,
    validateRequired,
    validateEmail,
    validatePhone,
    ERROR_TYPES,
    ERROR_MESSAGES,
    DETAILED_ERROR_MESSAGES
};
