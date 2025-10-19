/**
 * Professional Error Handling Middleware for YangLogistics API
 * Provides comprehensive error handling, logging, and user-friendly responses
 */

const fs = require('fs').promises;
const path = require('path');

// Error types and their corresponding HTTP status codes
const ERROR_TYPES = {
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    RATE_LIMIT_EXCEEDED: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    DATABASE_ERROR: 500,
    NETWORK_ERROR: 503
};

// Custom Error Classes
class AppError extends Error {
    constructor(message, statusCode, errorCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        this.stack = this.stack;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, field = null) {
        super(message, ERROR_TYPES.VALIDATION_ERROR, 'VALIDATION_ERROR');
        this.field = field;
    }
}

class DatabaseError extends AppError {
    constructor(message, operation = null) {
        super(message, ERROR_TYPES.DATABASE_ERROR, 'DATABASE_ERROR');
        this.operation = operation;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, ERROR_TYPES.UNAUTHORIZED, 'AUTHENTICATION_ERROR');
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, ERROR_TYPES.FORBIDDEN, 'AUTHORIZATION_ERROR');
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, ERROR_TYPES.NOT_FOUND, 'NOT_FOUND');
        this.resource = resource;
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, ERROR_TYPES.CONFLICT, 'CONFLICT');
    }
}

// Error logging function
async function logError(error, req = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode || 500,
        errorCode: error.errorCode || 'UNKNOWN_ERROR',
        url: req ? req.originalUrl : 'Unknown',
        method: req ? req.method : 'Unknown',
        ip: req ? req.ip : 'Unknown',
        userAgent: req ? req.get('User-Agent') : 'Unknown',
        body: req ? req.body : null,
        query: req ? req.query : null,
        params: req ? req.params : null
    };

    try {
        const logDir = path.join(__dirname, '..', 'logs');
        await fs.mkdir(logDir, { recursive: true });
        
        const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);
        await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
    } catch (logError) {
        console.error('Failed to log error:', logError);
    }
}

// Development error response
function sendErrorDev(err, res) {
    res.status(err.statusCode).json({
        success: false,
        error: {
            message: err.message,
            statusCode: err.statusCode,
            errorCode: err.errorCode,
            stack: err.stack,
            timestamp: err.timestamp
        }
    });
}

// Production error response
function sendErrorProd(err, res) {
    // Operational errors: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                statusCode: err.statusCode,
                errorCode: err.errorCode,
                timestamp: err.timestamp
            }
        });
    } else {
        // Programming errors: don't leak error details
        console.error('ERROR 💥', err);
        res.status(500).json({
            success: false,
            error: {
                message: 'Something went wrong!',
                statusCode: 500,
                errorCode: 'INTERNAL_SERVER_ERROR',
                timestamp: new Date().toISOString()
            }
        });
    }
}

// Handle specific error types
function handleCastErrorDB(err) {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new ValidationError(message, err.path);
}

function handleDuplicateFieldsDB(err) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new ConflictError(message);
}

function handleValidationErrorDB(err) {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new ValidationError(message);
}

function handleJWTError() {
    return new AuthenticationError('Invalid token. Please log in again!');
}

function handleJWTExpiredError() {
    return new AuthenticationError('Your token has expired! Please log in again.');
}

// Main error handling middleware
const errorHandler = async (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

    // Log the error
    await logError(err, req);

    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Send error response
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else {
        sendErrorProd(error, res);
    }
};

// Async error wrapper
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

// Global unhandled rejection handler
process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', err);
    // Close server & exit process
    process.exit(1);
});

// Global uncaught exception handler
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

module.exports = {
    AppError,
    ValidationError,
    DatabaseError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    ERROR_TYPES,
    errorHandler,
    catchAsync,
    notFound,
    logError
};
