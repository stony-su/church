# Water Temperature Monitor

A comprehensive web application for monitoring water temperature, designed to run on a Raspberry Pi with Arduino sensor integration.

## Features

- 🌡️ Real-time temperature monitoring
- 📊 Live graphing with Chart.js
- 📧 Gmail email alerts for low temperature warnings
- 🔄 WebSocket-based real-time updates
- 📱 Responsive web interface
- 🎯 Configurable temperature thresholds
- 📈 Temperature history tracking

## Project Structure

```
church/
├── server.js                 # Main Express.js server
├── temperature-simulator.js  # Temperature data generator
├── package.json              # Node.js dependencies
├── public/
│   └── index.html            # Web dashboard
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and edit it with your settings:

```bash
copy .env.example .env
```

Edit `.env` with your Gmail credentials:
- `GMAIL_USER`: Your Gmail address
- `GMAIL_APP_PASSWORD`: Your Gmail App Password (see setup below)
- `ALERT_EMAIL`: Email address to receive alerts
- `MIN_TEMPERATURE_THRESHOLD`: Temperature below which to send alerts (default: 15°C)

### 3. Gmail App Password Setup

To send email alerts, you need to set up a Gmail App Password:

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. At the bottom, select "App passwords"
4. Generate a password for "Mail"
5. Use this 16-character password in your `.env` file

### 4. Running the Application

#### Start the Server
```bash
npm start
```

#### Start the Temperature Simulator (for testing)
```bash
npm run temp-simulator
```

#### Development Mode (with auto-restart)
```bash
npm run dev
```

## Usage

1. **Start the server**: Run `npm start` to start the Express.js server
2. **Open the dashboard**: Navigate to `http://localhost:3000` in your browser
3. **Start temperature simulation**: Run `npm run temp-simulator` to begin sending simulated temperature data
4. **Monitor temperatures**: The dashboard will show real-time temperature updates and graphs
5. **Test alerts**: The simulator occasionally generates low temperatures to test the alert system

## Arduino Integration (Currently Commented Out)

To integrate with an Arduino temperature sensor:

1. Uncomment the Arduino endpoint in `server.js`
2. Configure your Arduino to send POST requests to `http://your-pi-ip:3000/api/temperature`
3. Send JSON data: `{"temperature": 23.5}`

Example Arduino HTTP request format:
```json
POST /api/temperature HTTP/1.1
Content-Type: application/json

{"temperature": 23.5}
```

## API Endpoints

- `GET /` - Web dashboard
- `POST /api/temperature` - Receive temperature data
- `GET /api/temperature/history` - Get temperature history
- `GET /api/config` - Get current configuration

## Configuration Variables

Edit these variables at the top of `server.js`:

- `MIN_TEMPERATURE_THRESHOLD`: Temperature below which to send alerts (°C)
- `MAX_HISTORY_LENGTH`: Number of temperature readings to keep in memory
- `ALERT_COOLDOWN`: Minimum time between alert emails (milliseconds)

## Raspberry Pi Deployment

### 1. Install Node.js on Raspberry Pi
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone and Setup Project
```bash
git clone <your-repo-url>
cd church
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env  # Edit with your settings
```

### 4. Run as Service (Optional)
Create a systemd service for automatic startup:

```bash
sudo nano /etc/systemd/system/temperature-monitor.service
```

Service file content:
```ini
[Unit]
Description=Water Temperature Monitor
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/church
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable temperature-monitor
sudo systemctl start temperature-monitor
```

## Troubleshooting

### Email Alerts Not Working
- Verify Gmail App Password is correct
- Check that 2-Step Verification is enabled on your Google account
- Ensure environment variables are set correctly

### Temperature Data Not Appearing
- Check that the temperature simulator is running
- Verify the server is accessible on the correct port
- Check browser console for WebSocket connection errors

### Arduino Connection Issues
- Ensure Arduino can reach the Raspberry Pi network
- Verify the IP address and port in Arduino code
- Check that the JSON format matches expected structure

## License

This project is licensed under the ISC License.

