import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SystemStats, TelemetryLog } from '@/types/telemetry';
import { Activity, AlertTriangle, CheckCircle2, Cpu, Gauge, Zap, Database } from 'lucide-react';

interface TopMetricsProps {
  stats: SystemStats;
  latestLog: TelemetryLog;
}

export const TopMetrics: React.FC<TopMetricsProps> = ({ stats, latestLog }) => {
  const isCritical = latestLog.anomalyScore > stats.threshold;
  const scorePercentage = Math.round((latestLog.anomalyScore / 1.0) * 100);
  const thresholdPercentage = Math.round((stats.threshold / 1.0) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. System Status Card */}
      <Card className={`relative overflow-hidden transition-all duration-300 border ${
        isCritical 
          ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/40' 
          : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/30'
      }`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              System Health State
            </span>
            {isCritical ? (
              <AlertTriangle className="h-5 w-5 text-rose-500 animate-bounce" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <h2 className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${
                isCritical ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}>
                {isCritical ? 'CRITICAL ANOMALY' : 'NORMAL'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {isCritical ? (
                  <span className="text-rose-400 font-medium">⚠️ Immediate Inspection Required</span>
                ) : (
                  <span className="text-emerald-400/90 font-medium">✓ TinyML Model Nominal</span>
                )}
              </p>
            </div>
          </div>

          {/* Bottom indicator badge */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Fault Threshold</span>
            <Badge variant={isCritical ? 'destructive' : 'success'} className="text-[10px]">
              {isCritical ? 'EXCEEDED (>0.600)' : 'STABLE (<0.600)'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 2. Current Anomaly Score Card */}
      <Card className="bg-slate-900/80 border-slate-800 hover:border-cyan-500/30 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-cyan-400" />
              Current Anomaly Score
            </span>
            <span className="text-xs font-mono font-medium text-slate-400">
              Ref: {stats.threshold.toFixed(3)}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black font-mono-num ${
              isCritical ? 'text-rose-400' : latestLog.anomalyScore > 0.45 ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {latestLog.anomalyScore.toFixed(3)}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ 1.000 max</span>
          </div>

          {/* Visual Progress gauge */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>Score Level</span>
              <span className={isCritical ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {scorePercentage}%
              </span>
            </div>
            <Progress value={scorePercentage} threshold={thresholdPercentage} />
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Model: Autoencoder TinyML</span>
            <span className="text-cyan-400 font-mono font-medium">
              {latestLog.elevatorId.replace('ELEVATOR_', '')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Total Telemetry Packets Card */}
      <Card className="bg-slate-900/80 border-slate-800 hover:border-blue-500/30 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="h-4 w-4 text-blue-400" />
              Total Telemetry Packets
            </span>
            <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30">
              Live Feed
            </Badge>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono-num tracking-tight">
              {stats.totalPackets.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">readings</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-blue-400" />
              Rate: ~0.5 pkts/sec
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Critical: <strong className="text-rose-400">{stats.criticalAlertCount}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Average Latency / Edge Health Card */}
      <Card className="bg-slate-900/80 border-slate-800 hover:border-purple-500/30 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-purple-400" />
              Edge Health & Latency
            </span>
            <Badge variant="success" className="text-[10px]">
              ESP32-S3
            </Badge>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-300 font-mono-num tracking-tight">
              ~{stats.avgLatencyMs}
            </span>
            <span className="text-xs text-slate-400 font-medium">ms inference</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              TinyML Status
            </span>
            <span className="text-emerald-400 font-medium text-[11px]">
              ● Online / Active
            </span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
