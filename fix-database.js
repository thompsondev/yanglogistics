const fs = require('fs').promises;
const path = require('path');

async function fixDatabase() {
    try {
        console.log('🔧 Fixing database stage structure...');
        
        const dbPath = path.join(__dirname, 'database.json');
        const data = await fs.readFile(dbPath, 'utf8');
        const db = JSON.parse(data);
        
        let fixedCount = 0;
        
        // Fix each order's stages
        db.orders.forEach(order => {
            if (order.stages && Array.isArray(order.stages)) {
                order.stages.forEach(stage => {
                    // If stage has 'status' property instead of 'stage', fix it
                    if (stage.status && !stage.stage) {
                        stage.stage = stage.status;
                        delete stage.status;
                        fixedCount++;
                        console.log(`✅ Fixed stage in order ${order.trackingNumber}: ${stage.stage}`);
                    }
                });
            }
        });
        
        // Write the fixed database back
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
        
        console.log(`🎉 Database fixed! Updated ${fixedCount} stages.`);
        console.log('📁 Database saved successfully.');
        
    } catch (error) {
        console.error('❌ Error fixing database:', error);
    }
}

// Run the fix
fixDatabase(); 