// simulator.js
// Ye script ESP32 ki tarah data backend ko post karegi

const BACKEND_URL = 'http://localhost:5000/api/alert';

async function sendVibrationData() {
  // 80% time Normal data generate hoga, 20% time Anomaly spike aayega
  const isAnomaly = Math.random() < 0.2; 
  
  const anomalyScore = isAnomaly 
    ? +(Math.random() * (2.5 - 0.7) + 0.7).toFixed(3)  // Score > 0.7 (Fault)
    : +(Math.random() * 0.3).toFixed(3);                // Score < 0.3 (Normal)

  const payload = {
    elevatorId: 'ELEVATOR_LIFT_01',
    anomalyScore: anomalyScore,
    status: anomalyScore > 0.6 ? 'CRITICAL' : 'NORMAL'
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log(`[SIMULATOR SENT] Score: ${payload.anomalyScore} | Status: ${payload.status}`);
  } catch (error) {
    console.error('❌ Server not reachable! Make sure server.js is running.');
  }
}

console.log('🚀 Virtual ESP32 Hardware Simulator Started...');
console.log('Simulating live vibration inference every 3 seconds...\n');

// Har 3 second mein payload bhejega
setInterval(sendVibrationData, 3000);