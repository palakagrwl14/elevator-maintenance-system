import { useState, useEffect, useCallback, useRef } from 'react';
import { TelemetryLog, ElevatorId, SystemStats } from '@/types/telemetry';

const BACKEND_LOGS_URL = 'http://localhost:5000/api/logs';
const BACKEND_ALERT_URL = 'http://localhost:5000/api/alert';
const POLLING_INTERVAL_MS = 2000;

const INITIAL_ELEVATORS: string[] = ['ELEVATOR_LIFT_01', 'ELEVATOR_LIFT_02', 'ELEVATOR_LIFT_03'];

export function useTelemetry() {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [selectedElevator, setSelectedElevator] = useState<ElevatorId>('ALL');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<number[]>([]);
  const [lastLatencyMs, setLastLatencyMs] = useState<number>(14);
  const [totalProcessedCount, setTotalProcessedCount] = useState<number>(0);
  const [isSimulatingOffline, setIsSimulatingOffline] = useState<boolean>(false);

  const localIdCounterRef = useRef<number>(1000);

  // Helper to generate a realistic mock telemetry packet when server is disconnected
  const generateMockLog = useCallback((forcedAnomaly = false): TelemetryLog => {
    localIdCounterRef.current += 1;
    const isAnomaly = forcedAnomaly || Math.random() < 0.18;
    const elId = INITIAL_ELEVATORS[Math.floor(Math.random() * INITIAL_ELEVATORS.length)];
    const anomalyScore = isAnomaly
      ? +(0.62 + Math.random() * 0.32).toFixed(3)
      : +(0.06 + Math.random() * 0.28).toFixed(3);

    return {
      id: localIdCounterRef.current,
      elevatorId: elId,
      anomalyScore,
      status: anomalyScore > 0.6 ? 'CRITICAL' : 'NORMAL',
      timestamp: new Date().toISOString(),
      axes: {
        x: +(0.12 + Math.random() * (isAnomaly ? 2.8 : 0.35)).toFixed(2),
        y: +(0.15 + Math.random() * (isAnomaly ? 3.4 : 0.45)).toFixed(2),
        z: +(9.81 + (Math.random() * (isAnomaly ? 5.2 : 0.7) - 0.35)).toFixed(2),
      },
      temperature: +(41.5 + Math.random() * (isAnomaly ? 19.0 : 4.0)).toFixed(1),
      peakAcceleration: +(1.08 + Math.random() * (isAnomaly ? 3.9 : 0.5)).toFixed(2),
    };
  }, []);

  // Poll backend API or fallback mock
  const fetchTelemetryLogs = useCallback(async () => {
    if (isPaused) return;

    const startTime = performance.now();

    try {
      const response = await fetch(BACKEND_LOGS_URL);
      const elapsed = Math.round(performance.now() - startTime);
      setLastLatencyMs(elapsed > 0 ? elapsed : Math.floor(12 + Math.random() * 6));

      if (response.ok) {
        const data: TelemetryLog[] = await response.json();
        setIsBackendConnected(true);
        setIsSimulatingOffline(false);

        if (Array.isArray(data) && data.length > 0) {
          setLogs(data);
          setTotalProcessedCount((prev) => Math.max(prev, data.length));
        }
      } else {
        throw new Error('Backend returned non-200 status');
      }
    } catch (error) {
      // Backend unreachable -> Use fallback offline mode seamlessly
      setIsBackendConnected(false);
      setIsSimulatingOffline(true);
      setLastLatencyMs(Math.floor(11 + Math.random() * 7));

      const newMock = generateMockLog();
      setLogs((prev) => {
        const updated = [newMock, ...prev];
        return updated.slice(0, 100); // keep top 100
      });
      setTotalProcessedCount((prev) => prev + 1);
    }
  }, [isPaused, generateMockLog]);

  useEffect(() => {
    fetchTelemetryLogs();
    const interval = setInterval(fetchTelemetryLogs, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchTelemetryLogs]);

  // Filter logs by selected elevator
  const filteredLogs = logs.filter((log) => {
    if (selectedElevator === 'ALL') return true;
    return log.elevatorId === selectedElevator;
  });

  const latestLog = filteredLogs[0] || logs[0] || {
    id: 0,
    elevatorId: 'ELEVATOR_LIFT_01',
    anomalyScore: 0.124,
    status: 'NORMAL',
    timestamp: new Date().toISOString(),
    axes: { x: 0.12, y: 0.18, z: 9.81 },
    temperature: 42.5,
    peakAcceleration: 1.05,
  };

  // Recharts data points (last 20 logs reversed for timeline x-axis)
  const chartData = filteredLogs
    .slice(0, 20)
    .reverse()
    .map((log) => ({
      timestamp: new Date(log.timestamp).toLocaleTimeString('en-US', {
        hour12: false,
        minute: '2-digit',
        second: '2-digit',
      }),
      score: log.anomalyScore,
      threshold: 0.6,
      vibrationX: log.axes.x,
      vibrationY: log.axes.y,
      vibrationZ: Math.abs(log.axes.z - 9.81), // Deviation from standard gravity
      temp: log.temperature,
      elevatorId: log.elevatorId,
    }));

  const activeCriticalAlert = filteredLogs.find(
    (log) => log.anomalyScore > 0.6 && !acknowledgedAlertIds.includes(log.id)
  );

  const acknowledgeAlert = (logId: number) => {
    setAcknowledgedAlertIds((prev) => [...prev, logId]);
  };

  const acknowledgeAllAlerts = () => {
    const criticalIds = logs.filter((l) => l.anomalyScore > 0.6).map((l) => l.id);
    setAcknowledgedAlertIds((prev) => Array.from(new Set([...prev, ...criticalIds])));
  };

  const injectTestAnomaly = async () => {
    if (isBackendConnected) {
      try {
        await fetch(BACKEND_ALERT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elevatorId: selectedElevator === 'ALL' ? 'ELEVATOR_LIFT_01' : selectedElevator,
            anomalyScore: +(0.75 + Math.random() * 0.2).toFixed(3),
            status: 'CRITICAL',
          }),
        });
        fetchTelemetryLogs();
      } catch (err) {
        console.error('Failed to post test anomaly:', err);
      }
    } else {
      const mock = generateMockLog(true);
      setLogs((prev) => [mock, ...prev]);
      setTotalProcessedCount((prev) => prev + 1);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const stats: SystemStats = {
    isBackendConnected,
    totalPackets: totalProcessedCount || logs.length,
    avgLatencyMs: lastLatencyMs,
    lastEdgeHeartbeat: latestLog ? latestLog.timestamp : new Date().toISOString(),
    criticalAlertCount: logs.filter((l) => l.anomalyScore > 0.6).length,
    threshold: 0.6,
  };

  return {
    logs: filteredLogs,
    allLogs: logs,
    latestLog,
    chartData,
    selectedElevator,
    setSelectedElevator,
    isBackendConnected,
    isSimulatingOffline,
    isPaused,
    setIsPaused,
    stats,
    activeCriticalAlert,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    injectTestAnomaly,
    clearLogs,
    refetch: fetchTelemetryLogs,
  };
}
