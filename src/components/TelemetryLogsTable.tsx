import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TelemetryLog } from '@/types/telemetry';
import { formatTimestamp, formatRelativeTime } from '@/lib/utils';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface TelemetryLogsTableProps {
  logs: TelemetryLog[];
  onClearLogs: () => void;
}

export const TelemetryLogsTable: React.FC<TelemetryLogsTableProps> = ({ logs, onClearLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'NORMAL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter logs by search term & status
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.elevatorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toString().includes(searchTerm) ||
      log.anomalyScore.toFixed(3).includes(searchTerm);

    const matchesStatus =
      statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Export CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Log ID', 'Elevator ID', 'Anomaly Score', 'Status', 'Timestamp', 'Axis X', 'Axis Y', 'Axis Z', 'Temperature (°C)'];
    const rows = logs.map((l) => [
      l.id,
      l.elevatorId,
      l.anomalyScore,
      l.status,
      l.timestamp,
      l.axes.x,
      l.axes.y,
      l.axes.z,
      l.temperature,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `elevator_telemetry_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-slate-900/80 border-slate-800 shadow-2xl mt-6">
      
      {/* Header & Actions */}
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <CardTitle className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <History className="h-4 w-4 text-cyan-400" />
            Historical Inference Telemetry Logs
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-0.5">
            Audit log of TinyML edge predictions with timestamped vibration signatures
          </CardDescription>
        </div>

        {/* Filter Controls & CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Log ID / Lift..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => { setStatusFilter('CRITICAL'); setCurrentPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-rose-400/70 hover:text-rose-300'
              }`}
            >
              Critical ({logs.filter((l) => l.status === 'CRITICAL').length})
            </button>
            <button
              onClick={() => { setStatusFilter('NORMAL'); setCurrentPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === 'NORMAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-emerald-400/70 hover:text-emerald-300'
              }`}
            >
              Normal
            </button>
          </div>

          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 text-xs gap-1.5 border-slate-700 hover:border-cyan-500/50"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            Export CSV
          </Button>

          {/* Clear Logs */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearLogs}
            className="h-8 text-xs gap-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </CardHeader>

      {/* Table Content */}
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="w-[90px]">Log ID</TableHead>
              <TableHead>Elevator ID</TableHead>
              <TableHead>Anomaly Score</TableHead>
              <TableHead>3-Axis Vibration (m/s²)</TableHead>
              <TableHead>Temp (°C)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Timestamp / Time Ago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500 text-xs">
                  No telemetry logs found matching filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => {
                const isCritical = log.status === 'CRITICAL' || log.anomalyScore > 0.6;
                return (
                  <TableRow
                    key={`${log.id}-${log.timestamp}`}
                    className={`transition-colors ${
                      isCritical ? 'bg-rose-950/20 hover:bg-rose-950/40' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Log ID */}
                    <TableCell className="font-mono font-medium text-slate-400">
                      #{log.id}
                    </TableCell>

                    {/* Elevator ID */}
                    <TableCell className="font-semibold text-slate-200">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                        {log.elevatorId}
                      </span>
                    </TableCell>

                    {/* Anomaly Score */}
                    <TableCell className="font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : log.anomalyScore > 0.4
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {log.anomalyScore.toFixed(3)}
                      </span>
                    </TableCell>

                    {/* 3-Axis breakdown */}
                    <TableCell className="font-mono text-[11px] text-slate-400">
                      X: <strong className="text-emerald-400">{log.axes?.x ?? '0.00'}</strong> | Y: <strong className="text-amber-400">{log.axes?.y ?? '0.00'}</strong> | Z: <strong className="text-purple-400">{log.axes?.z ?? '9.81'}</strong>
                    </TableCell>

                    {/* Motor Temp */}
                    <TableCell className="font-mono text-xs text-slate-300">
                      {log.temperature ? `${log.temperature.toFixed(1)}°C` : '42.0°C'}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      {isCritical ? (
                        <Badge variant="destructive" className="gap-1 text-[11px]">
                          <AlertTriangle className="h-3 w-3" /> CRITICAL
                        </Badge>
                      ) : (
                        <Badge variant="success" className="gap-1 text-[11px]">
                          <CheckCircle2 className="h-3 w-3" /> NORMAL
                        </Badge>
                      )}
                    </TableCell>

                    {/* Timestamp */}
                    <TableCell className="text-right font-mono text-xs text-slate-400">
                      <div>{formatTimestamp(log.timestamp)}</div>
                      <div className="text-[10px] text-slate-500">{formatRelativeTime(log.timestamp)}</div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pagination Footer */}
      <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <strong>{filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
          <strong>{Math.min(currentPage * pageSize, filteredLogs.length)}</strong> of{' '}
          <strong>{filteredLogs.length}</strong> logs
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="h-7 text-xs border-slate-800"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </Button>

          <span className="text-xs font-mono px-2">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="h-7 text-xs border-slate-800"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

    </Card>
  );
};
