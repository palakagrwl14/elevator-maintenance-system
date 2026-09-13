import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory telemetry alert logs
let alertLogs = [];

// Seed initial historical logs so the dashboard has rich sample data on startup
const now = Date.now();
const sampleElevators = ['ELEVATOR_LIFT_01', 'ELEVATOR_LIFT_02', 'ELEVATOR_LIFT_03'];

for (let i = 15; i >= 1; i--) {
  const isAnomaly = i % 7 === 0;
  const score = isAnomaly ? +(0.65 + Math.random() * 0.28).toFixed(3) : +(0.08 + Math.random() * 0.22).toFixed(3);
  const elId = sampleElevators[i % sampleElevators.length];
  
  alertLogs.push({
    id: alertLogs.length + 1,
    elevatorId: elId,
    anomalyScore: score,
    status: score > 0.6 ? 'CRITICAL' : 'NORMAL',
    timestamp: new Date(now - i * 10000).toISOString(),
    axes: {
      x: +(0.12 + Math.random() * (isAnomaly ? 2.5 : 0.4)).toFixed(2),
      y: +(0.15 + Math.random() * (isAnomaly ? 3.1 : 0.5)).toFixed(2),
      z: +(9.78 + (Math.random() * (isAnomaly ? 4.2 : 0.8) - 0.4)).toFixed(2)
    },
    temperature: +(42.5 + Math.random() * (isAnomaly ? 18.0 : 4.0)).toFixed(1),
    peakAcceleration: +(1.05 + Math.random() * (isAnomaly ? 3.8 : 0.6)).toFixed(2)
  });
}

// Endpoint to receive alerts (from ESP32 or Virtual Simulator)
app.post('/api/alert', (req, res) => {
  const { elevatorId, anomalyScore, status, axes, temperature, peakAcceleration } = req.body;
  const score = typeof anomalyScore === 'number' ? anomalyScore : 0.12;
  const isCritical = score > 0.6;

  const newLog = {
    id: alertLogs.length + 1,
    elevatorId: elevatorId || 'ELEVATOR_LIFT_01',
    anomalyScore: score,
    status: status || (isCritical ? 'CRITICAL' : 'NORMAL'),
    timestamp: new Date().toISOString(),
    axes: axes || {
      x: +(0.1 + Math.random() * (isCritical ? 2.8 : 0.4)).toFixed(2),
      y: +(0.2 + Math.random() * (isCritical ? 3.2 : 0.5)).toFixed(2),
      z: +(9.81 + (Math.random() * (isCritical ? 4.5 : 0.8) - 0.4)).toFixed(2)
    },
    temperature: typeof temperature === 'number' ? temperature : +(43.0 + Math.random() * (isCritical ? 15.0 : 3.0)).toFixed(1),
    peakAcceleration: typeof peakAcceleration === 'number' ? peakAcceleration : +(1.1 + Math.random() * (isCritical ? 3.5 : 0.5)).toFixed(2)
  };

  alertLogs.unshift(newLog); // Add newest to top
  if (alertLogs.length > 200) alertLogs.pop(); // Keep max 200 logs

  console.log(`[ALERT RECEIVED] ${newLog.timestamp} | ${newLog.elevatorId} | Status: ${newLog.status} | Score: ${newLog.anomalyScore}`);

  if (newLog.status === 'CRITICAL') {
    console.log(`⚠️ HIGH ANOMALY DETECTED! Dispatching IoT notification...`);
  }

  res.status(200).json({ success: true, message: 'Log recorded successfully', data: newLog });
});

// Endpoint to get all logs for the Dashboard
app.get('/api/logs', (req, res) => {
  let filtered = alertLogs;
  if (req.query.elevatorId && req.query.elevatorId !== 'ALL') {
    filtered = filtered.filter(l => l.elevatorId === req.query.elevatorId);
  }
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    filtered = filtered.slice(0, limit);
  }
  res.status(200).json(filtered);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Elevator Predictive Maintenance Backend Running 🚀');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});