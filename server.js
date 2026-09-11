const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory alert logs
let alertLogs = [];

// Endpoint to receive alerts (from ESP32 or Simulator)
app.post('/api/alert', (req, res) => {
  const { elevatorId, anomalyScore, status } = req.body;
  
  const newLog = {
    id: alertLogs.length + 1,
    elevatorId: elevatorId || 'Elevator_1',
    anomalyScore: anomalyScore || 0,
    status: status || (anomalyScore > 0.6 ? 'CRITICAL' : 'NORMAL'),
    timestamp: new Date().toISOString()
  };

  alertLogs.unshift(newLog); // Add to beginning
  console.log(`[ALERT RECEIVED] ${newLog.timestamp} | Status: ${newLog.status} | Score: ${newLog.anomalyScore}`);

  // If critical, trigger alert logic here
  if (newLog.status === 'CRITICAL') {
    console.log(`⚠️ HIGH ANOMALY DETECTED! Dispatching notification...`);
  }

  res.status(200).json({ success: true, message: 'Log recorded successfully', data: newLog });
});

// Endpoint to get all logs for the Dashboard
app.get('/api/logs', (req, res) => {
  res.status(200).json(alertLogs);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Elevator Predictive Maintenance Backend Running 🚀');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});