const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Configuration variables - Edit these as needed
const PORT = process.env.PORT || 3000;
const MIN_TEMPERATURE_THRESHOLD = 15; // Temperature below which to send warning (in Celsius)
const GMAIL_USER = process.env.GMAIL_USER || 'your-email@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'your-app-password';
const ALERT_EMAIL = process.env.ALERT_EMAIL || 'alert-recipient@gmail.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store recent temperature readings
let temperatureHistory = [];
const MAX_HISTORY_LENGTH = 100;

// Email configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    }
});

// Track if alert was recently sent to avoid spam
let lastAlertTime = 0;
const ALERT_COOLDOWN = 10 * 60 * 1000; // 10 minutes in milliseconds

// Function to send temperature alert email
async function sendTemperatureAlert(temperature) {
    const now = Date.now();
    
    // Check if enough time has passed since last alert
    if (now - lastAlertTime < ALERT_COOLDOWN) {
        console.log('Alert cooldown active, skipping email');
        return;
    }

    const mailOptions = {
        from: GMAIL_USER,
        to: ALERT_EMAIL,
        subject: '🚨 Water Temperature Alert - Low Temperature Detected',
        html: `
            <h2>Water Temperature Alert</h2>
            <p><strong>Warning:</strong> Water temperature has dropped below the threshold!</p>
            <p><strong>Current Temperature:</strong> ${temperature.toFixed(1)}°C</p>
            <p><strong>Threshold:</strong> ${MIN_TEMPERATURE_THRESHOLD}°C</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p>Please check your water heating system immediately.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Alert email sent - Temperature: ${temperature}°C`);
        lastAlertTime = now;
    } catch (error) {
        console.error('Failed to send alert email:', error);
    }
}

// Arduino temperature endpoint (commented out for now)
/*
app.post('/api/temperature', (req, res) => {
    const { temperature } = req.body;
    
    if (typeof temperature !== 'number') {
        return res.status(400).json({ error: 'Invalid temperature data' });
    }
    
    console.log(`Received temperature from Arduino: ${temperature}°C`);
    
    const reading = {
        temperature: temperature,
        timestamp: new Date().toISOString(),
        source: 'arduino'
    };
    
    // Add to history
    temperatureHistory.push(reading);
    if (temperatureHistory.length > MAX_HISTORY_LENGTH) {
        temperatureHistory.shift();
    }
    
    // Check if temperature is below threshold
    if (temperature < MIN_TEMPERATURE_THRESHOLD) {
        sendTemperatureAlert(temperature);
    }
    
    // Broadcast to all connected clients
    io.emit('temperatureUpdate', reading);
    
    res.json({ status: 'success', received: reading });
});
*/

// External script temperature endpoint
app.post('/api/temperature', (req, res) => {
    const { temperature } = req.body;
    
    if (typeof temperature !== 'number') {
        return res.status(400).json({ error: 'Invalid temperature data' });
    }
    
    console.log(`Received temperature: ${temperature}°C`);
    
    const reading = {
        temperature: temperature,
        timestamp: new Date().toISOString(),
        source: 'simulator'
    };
    
    // Add to history
    temperatureHistory.push(reading);
    if (temperatureHistory.length > MAX_HISTORY_LENGTH) {
        temperatureHistory.shift();
    }
    
    // Check if temperature is below threshold
    if (temperature < MIN_TEMPERATURE_THRESHOLD) {
        sendTemperatureAlert(temperature);
    }
    
    // Broadcast to all connected clients
    io.emit('temperatureUpdate', reading);
    
    res.json({ status: 'success', received: reading });
});

// Get temperature history
app.get('/api/temperature/history', (req, res) => {
    res.json(temperatureHistory);
});

// Get current configuration
app.get('/api/config', (req, res) => {
    res.json({
        minTemperatureThreshold: MIN_TEMPERATURE_THRESHOLD,
        maxHistoryLength: MAX_HISTORY_LENGTH,
        alertCooldown: ALERT_COOLDOWN / 1000 / 60 // in minutes
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Send current temperature history to new client
    socket.emit('temperatureHistory', temperatureHistory);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Temperature threshold: ${MIN_TEMPERATURE_THRESHOLD}°C`);
    console.log(`Access the dashboard at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
