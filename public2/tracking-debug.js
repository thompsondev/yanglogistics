// Debug script for tracking functionality
console.log('🔍 Tracking Debug Script Loaded');

// Test tracking numbers from the database
const testTrackingNumbers = [
    'TRK20250712790',
    'TRK20250712430', 
    'TRK20250712352',
    'TRK20250712603'
];

// Test API connection
async function testAPIConnection() {
    console.log('🔗 Testing API Connection...');
    console.log('API Base URL:', window.API_BASE_URL);
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Health check response:', data);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error);
        return false;
    }
}

// Test tracking endpoint
async function testTrackingEndpoint(trackingNumber) {
    console.log(`🔍 Testing tracking number: ${trackingNumber}`);
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/track/${trackingNumber}`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Tracking data:', data);
            return data;
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Tracking failed:', errorData);
            return null;
        }
    } catch (error) {
        console.error('❌ Tracking request failed:', error);
        return null;
    }
}

// Test all tracking numbers
async function testAllTrackingNumbers() {
    console.log('🧪 Testing all tracking numbers...');
    
    for (const trackingNumber of testTrackingNumbers) {
        await testTrackingEndpoint(trackingNumber);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
    }
}

// Run tests when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Starting tracking debug tests...');
    
    // Test API connection first
    const apiConnected = await testAPIConnection();
    
    if (apiConnected) {
        // Test tracking functionality
        await testAllTrackingNumbers();
    } else {
        console.error('❌ Cannot test tracking - API not connected');
    }
    
    console.log('🏁 Debug tests completed');
});

// Add debug info to the tracking form
document.addEventListener('DOMContentLoaded', () => {
    const trackingForm = document.getElementById('trackingForm');
    if (trackingForm) {
        // Add debug info
        const debugInfo = document.createElement('div');
        debugInfo.innerHTML = `
            <div style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; font-size: 12px;">
                <strong>Debug Info:</strong><br>
                API URL: ${window.API_BASE_URL}<br>
                Test Numbers: ${testTrackingNumbers.join(', ')}<br>
                <button onclick="testAllTrackingNumbers()" style="margin-top: 5px; padding: 5px 10px;">Test All Numbers</button>
            </div>
        `;
        trackingForm.parentNode.insertBefore(debugInfo, trackingForm);
    }
});

// Make functions globally available
window.testAPIConnection = testAPIConnection;
window.testTrackingEndpoint = testTrackingEndpoint;
window.testAllTrackingNumbers = testAllTrackingNumbers; 