import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Activity, ShieldAlert, SlidersHorizontal } from 'lucide-react';

interface VibrationChartProps {
  chartData: Array<{
    timestamp: string;
    score: number;
    threshold: number;
    vibrationX: number;
    vibrationY: number;
    vibrationZ: number;
    temp: number;
    elevatorId: string;
  }>;
}

// Custom Tooltip Component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isAnomaly = data.score > 0.6;

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-mono text-cyan-400 font-semibold">{label}</span>
          <Badge variant={isAnomaly ? 'destructive' : 'success'} className="text-[10px] py-0">
            {isAnomaly ? 'CRITICAL' : 'NORMAL'}
          </Badge>
        </div>

        <div className="space-y-1 font-mono">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
              Anomaly Score:
            </span>
            <span className={`font-bold ${isAnomaly ? 'text-rose-400' : 'text-cyan-400'}`}>
              {data.score.toFixed(3)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Axis X Vib:
            </span>
            <span>{data.vibrationX} m/s²</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              Axis Y Vib:
            </span>
            <span>{data.vibrationY} m/s²</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-purple-400"></span>
              Temp:
            </span>
            <span>{data.temp}°C</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
          <span>Target: {data.elevatorId}</span>
          <span>Threshold: 0.600</span>
        </div>
      </div>
    );
  }
  return null;
};

export const VibrationChart: React.FC<VibrationChartProps> = ({ chartData }) => {
  const [viewMode, setViewMode] = useState<'score' | 'axes'>('score');

  return (
    <Card className="bg-slate-900/80 border-slate-800 shadow-2xl h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Real-time Telemetry & Anomaly Score Timeline
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-0.5">
            Streaming last 20 TinyML inference data points with critical threshold (y = 0.6)
          </CardDescription>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <Button
            variant={viewMode === 'score' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('score')}
            className="h-7 px-2.5 text-[11px]"
          >
            Score Stream
          </Button>
          <Button
            variant={viewMode === 'axes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('axes')}
            className="h-7 px-2.5 text-[11px]"
          >
            3-Axis Vibration
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-2 flex-grow">
        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Activity className="h-8 w-8 animate-spin text-cyan-500 mb-2" />
            Connecting to live telemetry feed...
          </div>
        ) : (
          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  domain={[0, 1.0]}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => val.toFixed(1)}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Critical Anomaly Threshold Line (y = 0.6) */}
                <ReferenceLine
                  y={0.6}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: 'FAULT THRESHOLD (0.6)',
                    fill: '#f43f5e',
                    fontSize: 10,
                    fontWeight: 700,
                    position: 'insideTopRight',
                  }}
                />

                {viewMode === 'score' ? (
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Anomaly Score"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const isFault = payload.score > 0.6;
                      return (
                        <circle
                          key={cx}
                          cx={cx}
                          cy={cy}
                          r={isFault ? 5 : 3}
                          fill={isFault ? '#f43f5e' : '#06b6d4'}
                          stroke={isFault ? '#fff' : '#0891b2'}
                          strokeWidth={isFault ? 2 : 1}
                          className={isFault ? 'animate-ping-once' : ''}
                        />
                      );
                    }}
                    activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2, fill: '#06b6d4' }}
                  />
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="vibrationX"
                      name="X-Axis (m/s²)"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="vibrationY"
                      name="Y-Axis (m/s²)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="vibrationZ"
                      name="Z-Axis Dev"
                      stroke="#a855f7"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </>
                )}
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#94a3b8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>

      <div className="px-5 py-2.5 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
          Score &gt; 0.600 automatically triggers predictive fault alert
        </span>
        <span className="text-slate-500 font-mono">Window: Last 20 Packets</span>
      </div>
    </Card>
  );
};
