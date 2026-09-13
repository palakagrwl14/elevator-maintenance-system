export type ElevatorId = 'ALL' | 'ELEVATOR_LIFT_01' | 'ELEVATOR_LIFT_02' | 'ELEVATOR_LIFT_03';

export type StatusType = 'NORMAL' | 'CRITICAL';

export interface TelemetryLog {
  id: number;
  elevatorId: string;
  anomalyScore: number;
  status: StatusType;
  timestamp: string;
  axes: {
    x: number;
    y: number;
    z: number;
  };
  temperature: number;
  peakAcceleration: number;
}

export interface ElevatorHealthSummary {
  id: string;
  name: string;
  status: StatusType;
  lastScore: number;
  totalPackets: number;
  temperature: number;
  vibrationAmp: number;
}

export interface SystemStats {
  isBackendConnected: boolean;
  totalPackets: number;
  avgLatencyMs: number;
  lastEdgeHeartbeat: string;
  criticalAlertCount: number;
  threshold: number;
}
