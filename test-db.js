const fs = require('fs');

try {
    const db = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    console.log('📊 Database Check - Orders with Stages:\n');
    
    db.orders.forEach(order => {
        console.log(`📦 Order: ${order.trackingNumber} (${order.customerName})`);
        console.log(`   Status: ${order.status}`);
        console.log('   Stages:');
        
        order.stages.forEach((stage, index) => {
            console.log(`     ${index + 1}. ${stage.stage}`);
            console.log(`        📍 Location: ${stage.location}`);
            console.log(`        📝 Description: ${stage.description}`);
            console.log(`        ⏰ Time: ${new Date(stage.timestamp).toLocaleString()}`);
            console.log('');
        });
        console.log('---');
    });
    
} catch (error) {
    console.error('Error reading database:', error.message);
} 