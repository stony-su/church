const axios = require('axios');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const TEMPERATURE_ENDPOINT = `${SERVER_URL}/api/temperature`;
const UPDATE_INTERVAL = 2000; // Send temperature every 2 seconds

// Temperature simulation parameters
let baseTemperature = 22; // Base temperature in Celsius
let temperatureTrend = 0; // Current trend (positive = warming, negative = cooling)
let lastTemperature = baseTemperature;

// Function to generate realistic fluctuating temperature
function generateTemperature() {
    // Random fluctuation (-1.5 to +1.5 degrees)
    const randomFluctuation = (Math.random() - 0.5) * 5.0;
    
    // Occasional trend changes (5% chance each update)
    if (Math.random() < 0.05) {
        temperatureTrend = (Math.random() - 0.5) * 0.2; // New trend between -0.1 and +0.1
    }
    
    // Apply trend and fluctuation
    let newTemperature = lastTemperature + temperatureTrend + randomFluctuation;
    
    // Keep temperature in realistic range (10°C to 35°C)
    if (newTemperature > 35) {
        newTemperature = 35;
        temperatureTrend = -Math.abs(temperatureTrend); // Force cooling trend
    } else if (newTemperature < 10) {
        newTemperature = 10;
        temperatureTrend = Math.abs(temperatureTrend); // Force warming trend
    }
    
    // Occasionally simulate system failures (temperature drops)
    if (Math.random() < 0.002) { // 0.2% chance per update
        console.log('🚨 Simulating system failure - temperature drop!');
        newTemperature = Math.random() * 8 + 5; // Random temp between 5-13°C
        temperatureTrend = 0;
    }
    
    lastTemperature = newTemperature;
    return parseFloat(newTemperature.toFixed(2));
}

// Function to send temperature to server
async function sendTemperature() {
    try {
        const temperature = generateTemperature();
        
        const response = await axios.post(TEMPERATURE_ENDPOINT, {
            temperature: temperature
        });
        
        console.log(`📊 Sent temperature: ${temperature}°C - Status: ${response.data.status}`);
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('⚠️  Server not running - retrying in next cycle...');
        } else {
            console.error('❌ Error sending temperature:', error.message);
        }
    }
}

// Start the temperature simulation
console.log('🌡️  Water Temperature Simulator Starting...');
console.log(`📡 Server URL: ${SERVER_URL}`);
console.log(`⏰ Update interval: ${UPDATE_INTERVAL}ms`);
console.log(`🌡️  Base temperature: ${baseTemperature}°C`);
console.log('📊 Starting temperature simulation...\n');

// Send initial temperature
sendTemperature();

// Set up interval to send temperature readings
const intervalId = setInterval(sendTemperature, UPDATE_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping temperature simulator...');
    clearInterval(intervalId);
    console.log('✅ Temperature simulator stopped');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    clearInterval(intervalId);
    process.exit(1);
});

// Display help information
console.log('💡 Tips:');
console.log('   - Make sure the server is running on port 3000');
console.log('   - Press Ctrl+C to stop the simulator');
console.log('   - Temperature will occasionally drop below threshold to test alerts\n');
