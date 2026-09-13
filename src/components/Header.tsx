import React from 'react';
import { Cpu, Activity, RefreshCw, AlertTriangle, Pause, Play, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ElevatorId } from '@/types/telemetry';

interface HeaderProps {
  selectedElevator: ElevatorId;
  onSelectElevator: (id: ElevatorId) => void;
  isConnected: boolean;
  isSimulatingOffline: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onInjectAnomaly: () => void;
  onRefetch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedElevator,
  onSelectElevator,
  isConnected,
  isSimulatingOffline,
  isPaused,
  onTogglePause,
  onInjectAnomaly,
  onRefetch,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl px-4 lg:px-8 py-3.5 shadow-2xl transition-all">
      <div className="mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title & Edge Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-950/40">
            <Cpu className="h-6 w-6 animate-pulse text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Elevator Vibration Telemetry & Health Monitor
              </h1>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400 inline" />
                Edge TinyML ESP32 Live Stream
              </p>

              <span className="text-slate-700">•</span>

              {/* Live Connection Status Badge */}
              {isConnected ? (
                <Badge variant="success" className="gap-1.5 text-[11px] py-0.5 px-2.5 font-medium shadow-sm shadow-emerald-950/50">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ● Connected (Port 5000)
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1.5 text-[11px] py-0.5 px-2.5 font-medium shadow-sm shadow-amber-950/50">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                  ● Virtual Edge Stream (Offline Fallback)
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Elevator Dropdown Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Elevator Dropdown Selector */}
          <div className="relative min-w-[190px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Layers className="h-4 w-4 text-cyan-400" />
            </div>
            <select
              value={selectedElevator}
              onChange={(e) => onSelectElevator(e.target.value as ElevatorId)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer hover:border-slate-600 shadow-inner"
            >
              <option value="ALL">🏢 All Elevator Lifts</option>
              <option value="ELEVATOR_LIFT_01">🛗 Elevator Lift 01 (North Tower)</option>
              <option value="ELEVATOR_LIFT_02">🛗 Elevator Lift 02 (South Tower)</option>
              <option value="ELEVATOR_LIFT_03">🛗 Elevator Lift 03 (Express Bay)</option>
            </select>
          </div>

          {/* Test Anomaly Spike Injector */}
          <Button
            variant="outline"
            size="sm"
            onClick={onInjectAnomaly}
            title="Inject simulated vibration spike (>0.6 score)"
            className="border-rose-500/40 text-rose-300 hover:bg-rose-950/40 hover:border-rose-500/60 hover:text-rose-200 gap-1.5 shadow-sm text-xs"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            Inject Spike
          </Button>

          {/* Pause / Resume Live Stream */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onTogglePause}
            className="gap-1.5 text-xs font-medium"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                Resume Stream
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                Pause Stream
              </>
            )}
          </Button>

          {/* Refresh Data Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefetch}
            title="Refresh Telemetry"
            className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

      </div>
    </header>
  );
};
