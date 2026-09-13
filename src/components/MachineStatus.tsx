import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TelemetryLog } from '@/types/telemetry';
import {
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Zap,
  Activity,
  Bell,
  Volume2,
  VolumeX,
  CheckSquare,
  ShieldCheck,
} from 'lucide-react';

interface MachineStatusProps {
  latestLog: TelemetryLog;
  activeCriticalAlert: TelemetryLog | undefined;
  onAcknowledgeAlert: (id: number) => void;
  onAcknowledgeAll: () => void;
}

export const MachineStatus: React.FC<MachineStatusProps> = ({
  latestLog,
  activeCriticalAlert,
  onAcknowledgeAlert,
  onAcknowledgeAll,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const isCurrentCritical = latestLog.anomalyScore > 0.6;
  const currentAlert = activeCriticalAlert || (isCurrentCritical ? latestLog : undefined);

  return (
    <div className="space-y-4 h-full flex flex-col justify-between">
      
      {/* Dynamic Warning Alert Banner (If Score > 0.6) */}
      {currentAlert ? (
        <Alert variant="destructive" className="border-rose-500/80 bg-rose-950/60 shadow-2xl relative overflow-hidden animate-pulse-glow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <AlertTitle className="text-base font-bold text-rose-200 flex items-center gap-2">
                  <span>HIGH PRIORITY FAULT ALERT</span>
                  <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0.5 px-2">
                    Score: {currentAlert.anomalyScore.toFixed(3)}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                  Elevator <strong>{currentAlert.elevatorId}</strong> exhibited abnormal vibration patterns exceeding threshold <strong>0.600</strong>.
                  Potential motor bearing misalignment or guide rail friction detected.
                </AlertDescription>
                <div className="mt-2 text-[11px] font-mono text-rose-300/80">
                  Logged at: {new Date(currentAlert.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Acknowledge Action */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onAcknowledgeAlert(currentAlert.id)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold gap-1.5 shadow-lg text-xs"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Acknowledge Alert
              </Button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-[11px] text-rose-300 hover:text-white flex items-center gap-1 opacity-80 transition-opacity"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-3 w-3" /> Muted
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3 text-rose-400" /> Audio Alarm Active
                  </>
                )}
              </button>
            </div>
          </div>
        </Alert>
      ) : (
        /* Normal Nominal Banner */
        <Alert variant="success" className="border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <AlertTitle className="text-sm font-semibold text-emerald-300">
                  Elevator Systems Operational & Safe
                </AlertTitle>
                <AlertDescription className="text-xs text-emerald-400/80">
                  Vibration harmonics within nominal 0.05 – 0.35 baseline parameters.
                </AlertDescription>
              </div>
            </div>
            <Badge variant="success" className="text-[10px]">
              NO ACTIVE FAULTS
            </Badge>
          </div>
        </Alert>
      )}

      {/* Machine Parameter Breakdown Card */}
      <Card className="bg-slate-900/80 border-slate-800 flex-grow flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              Live Edge Hardware Metrics
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
              IMU Sensor 6-DOF
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-4 space-y-4">
          
          {/* 3-Axis Acceleration Breakdown */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Vibration Acceleration Axes (m/s²)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Sampling: 100Hz</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              
              {/* X Axis */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 hover:border-emerald-500/40 transition-colors text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  X-Axis (Lateral)
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {latestLog.axes.x.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">m/s²</div>
              </div>

              {/* Y Axis */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 hover:border-amber-500/40 transition-colors text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Y-Axis (Longitudinal)
                </div>
                <div className="text-lg font-bold font-mono text-amber-400">
                  {latestLog.axes.y.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">m/s²</div>
              </div>

              {/* Z Axis */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 hover:border-purple-500/40 transition-colors text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Z-Axis (Vertical)
                </div>
                <div className="text-lg font-bold font-mono text-purple-400">
                  {latestLog.axes.z.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">m/s² (~1g)</div>
              </div>

            </div>
          </div>

          {/* Machine Parameter Row: Temperature & Peak Acceleration */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            
            {/* Operating Temperature */}
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Thermometer className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Motor Temp
                </span>
                <span className={`text-base font-bold font-mono ${
                  latestLog.temperature > 55 ? 'text-rose-400' : 'text-slate-100'
                }`}>
                  {latestLog.temperature.toFixed(1)} °C
                </span>
              </div>
            </div>

            {/* Peak Acceleration */}
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Peak Acceleration
                </span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {latestLog.peakAcceleration.toFixed(2)} g
                </span>
              </div>
            </div>

          </div>

        </CardContent>

        {/* Footer info */}
        <div className="px-5 py-2.5 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="text-slate-400">Target Lift: <strong>{latestLog.elevatorId}</strong></span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAcknowledgeAll}
            className="h-6 text-[10px] px-2 text-slate-400 hover:text-white"
          >
            Clear All Alerts
          </Button>
        </div>
      </Card>

    </div>
  );
};
