import React from 'react';
import { Header } from '@/components/Header';
import { TopMetrics } from '@/components/TopMetrics';
import { VibrationChart } from '@/components/VibrationChart';
import { MachineStatus } from '@/components/MachineStatus';
import { TelemetryLogsTable } from '@/components/TelemetryLogsTable';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Cpu, Wifi, Activity } from 'lucide-react';

export function App() {
  const {
    logs,
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
    refetch,
  } = useTelemetry();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* App Header */}
      <Header
        selectedElevator={selectedElevator}
        onSelectElevator={setSelectedElevator}
        isConnected={isBackendConnected}
        isSimulatingOffline={isSimulatingOffline}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onInjectAnomaly={injectTestAnomaly}
        onRefetch={refetch}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Top Metrics Cards Row */}
        <TopMetrics stats={stats} latestLog={latestLog} />

        {/* Center Section: 2 Columns Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Real-time Vibration & Anomaly Score Chart (7 Cols on LG) */}
          <div className="lg:col-span-7 h-full">
            <VibrationChart chartData={chartData} />
          </div>

          {/* Right Column: Active Alert Banner & Machine Parameter Breakdown (5 Cols on LG) */}
          <div className="lg:col-span-5 h-full">
            <MachineStatus
              latestLog={latestLog}
              activeCriticalAlert={activeCriticalAlert}
              onAcknowledgeAlert={acknowledgeAlert}
              onAcknowledgeAll={acknowledgeAllAlerts}
            />
          </div>

        </div>

        {/* Bottom Section: Telemetry Logs Table */}
        <TelemetryLogsTable logs={logs} onClearLogs={clearLogs} />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-6 mt-12 text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>Elevator Anomaly Detection System • ESP32 TinyML Accelerometer Neural Net</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              API: http://localhost:5000/api/logs
            </span>
            <span>•</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              2000ms Polling Interval
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
