// simulator.js
// Simulates ESP32 TinyML micro-controller sending live vibration data to the backend

const BACKEND_URL = 'http://localhost:5000/api/alert';
const elevators = ['ELEVATOR_LIFT_01', 'ELEVATOR_LIFT_02', 'ELEVATOR_LIFT_03'];
let counter = 0;

async function sendVibrationData() {
  counter++;
  // 80% time Normal data generate hoga, 20% time Anomaly spike aayega
  const isAnomaly = Math.random() < 0.2; 
  
  const anomalyScore = isAnomaly 
    ? +(Math.random() * (0.95 - 0.62) + 0.62).toFixed(3)  // Score > 0.6 (Fault)
    : +(Math.random() * 0.35 + 0.05).toFixed(3);           // Score < 0.35 (Normal)

  const selectedElevator = elevators[counter % elevators.length];

  const payload = {
    elevatorId: selectedElevator,
    anomalyScore: anomalyScore,
    status: anomalyScore > 0.6 ? 'CRITICAL' : 'NORMAL',
    axes: {
      x: +(0.15 + (isAnomaly ? Math.random() * 3.5 + 1.2 : Math.random() * 0.4)).toFixed(2),
      y: +(0.18 + (isAnomaly ? Math.random() * 4.0 + 1.5 : Math.random() * 0.5)).toFixed(2),
      z: +(9.81 + (isAnomaly ? (Math.random() * 6.0 - 3.0) : (Math.random() * 0.8 - 0.4))).toFixed(2)
    },
    temperature: +(42.0 + (isAnomaly ? Math.random() * 22.0 + 10.0 : Math.random() * 4.0)).toFixed(1),
    peakAcceleration: +(1.1 + (isAnomaly ? Math.random() * 4.2 + 2.0 : Math.random() * 0.6)).toFixed(2)
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log(`[SIMULATOR SENT] ${payload.elevatorId} | Score: ${payload.anomalyScore} | Status: ${payload.status} | Temp: ${payload.temperature}°C`);
  } catch (error) {
    console.error('❌ Backend server unreachable at http://localhost:5000! Start server.js.');
  }
}

console.log('🚀 Virtual ESP32 TinyML Hardware Simulator Started...');
console.log('Simulating live elevator vibration telemetry every 2.5 seconds...\n');

setInterval(sendVibrationData, 2500);