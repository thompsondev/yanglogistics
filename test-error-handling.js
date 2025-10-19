/**
 * Test script to demonstrate the professional error handling system
 * Run with: node test-error-handling.js
 */

const API_BASE_URL = 'http://localhost:3000';

// Test cases for different error scenarios
const testCases = [
    {
        name: 'Invalid Login - Wrong Email Format',
        method: 'POST',
        url: '/api/auth/login',
        data: {
            email: 'invalid-email',
            password: 'password123'
        },
        expectedError: 'VALIDATION_ERROR'
    },
    {
        name: 'Invalid Login - Missing Fields',
        method: 'POST',
        url: '/api/auth/login',
        data: {
            email: 'test@example.com'
            // Missing password
        },
        expectedError: 'MISSING_FIELDS'
    },
    {
        name: 'Invalid Login - Wrong Credentials',
        method: 'POST',
        url: '/api/auth/login',
        data: {
            email: 'test@example.com',
            password: 'wrongpassword'
        },
        expectedError: 'INVALID_CREDENTIALS'
    },
    {
        name: 'Create Order - Missing Required Fields',
        method: 'POST',
        url: '/api/orders',
        data: {
            customerName: 'John Doe'
            // Missing other required fields
        },
        expectedError: 'MISSING_FIELDS'
    },
    {
        name: 'Create Order - Invalid Email Format',
        method: 'POST',
        url: '/api/orders',
        data: {
            customerName: 'John Doe',
            customerEmail: 'invalid-email',
            customerPhone: '123-456-7890',
            pickupAddress: '123 Main St',
            deliveryAddress: '456 Oak Ave',
            serviceType: 'Standard',
            packageDetails: {
                weight: 5,
                description: 'Test package'
            }
        },
        expectedError: 'VALIDATION_ERROR'
    },
    {
        name: 'Create Order - Invalid Weight',
        method: 'POST',
        url: '/api/orders',
        data: {
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '123-456-7890',
            pickupAddress: '123 Main St',
            deliveryAddress: '456 Oak Ave',
            serviceType: 'Standard',
            packageDetails: {
                weight: -5, // Invalid negative weight
                description: 'Test package'
            }
        },
        expectedError: 'VALIDATION_ERROR'
    },
    {
        name: 'Tracking - Invalid Tracking Number',
        method: 'GET',
        url: '/api/track/INVALID123',
        data: null,
        expectedError: 'ORDER_NOT_FOUND'
    },
    {
        name: 'Tracking - Empty Tracking Number',
        method: 'GET',
        url: '/api/track/',
        data: null,
        expectedError: 'VALIDATION_ERROR'
    }
];

// Function to make HTTP requests
async function makeRequest(method, url, data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);
        const result = await response.json();
        return { response, result };
    } catch (error) {
        return { error: error.message };
    }
}

// Function to run a single test
async function runTest(testCase) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📡 ${testCase.method} ${testCase.url}`);
    
    if (testCase.data) {
        console.log(`📦 Data:`, JSON.stringify(testCase.data, null, 2));
    }
    
    const { response, result, error } = await makeRequest(
        testCase.method, 
        testCase.url, 
        testCase.data
    );
    
    if (error) {
        console.log(`❌ Network Error: ${error}`);
        return;
    }
    
    if (response.ok) {
        console.log(`✅ Unexpected Success:`, result);
        return;
    }
    
    // Check if error response has the expected format
    if (result.success === false && result.error) {
        const errorInfo = result.error;
        console.log(`📋 Error Response:`);
        console.log(`   Type: ${errorInfo.type}`);
        console.log(`   Message: ${errorInfo.message}`);
        console.log(`   Status Code: ${errorInfo.statusCode}`);
        
        if (errorInfo.details) {
            console.log(`   Details: ${errorInfo.details}`);
        }
        
        if (errorInfo.action) {
            console.log(`   Action: ${errorInfo.action}`);
        }
        
        if (errorInfo.type === testCase.expectedError) {
            console.log(`✅ Expected error type: ${testCase.expectedError}`);
        } else {
            console.log(`❌ Expected ${testCase.expectedError}, got ${errorInfo.type}`);
        }
        
        console.log(`🕒 Timestamp: ${result.timestamp}`);
        console.log(`🆔 Request ID: ${result.requestId}`);
        
    } else {
        console.log(`❌ Invalid error response format:`, result);
    }
}

// Function to run all tests
async function runAllTests() {
    console.log('🚀 Starting Error Handling Tests');
    console.log('================================');
    
    for (const testCase of testCases) {
        await runTest(testCase);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
    }
    
    console.log('\n✅ All tests completed!');
    console.log('\n📚 Check the API_ERROR_HANDLING.md file for detailed documentation.');
}

// Check if server is running
async function checkServer() {
    try {
        const { response } = await makeRequest('GET', '/api/health');
        if (response && response.ok) {
            console.log('✅ Server is running');
            return true;
        }
    } catch (error) {
        console.log('❌ Server is not running or not accessible');
        console.log('   Make sure to start the server with: npm start');
        return false;
    }
}

// Main execution
async function main() {
    console.log('🔍 Checking server status...');
    
    const serverRunning = await checkServer();
    if (!serverRunning) {
        process.exit(1);
    }
    
    await runAllTests();
}

// Run the tests
main().catch(console.error);
