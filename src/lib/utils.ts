import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const timeStr = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${timeStr}.${ms}`;
  } catch (e) {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const elapsedMs = Date.now() - new Date(isoString).getTime();
    if (elapsedMs < 1000) return 'Just now';
    if (elapsedMs < 60000) return `${Math.floor(elapsedMs / 1000)}s ago`;
    if (elapsedMs < 3600000) return `${Math.floor(elapsedMs / 60000)}m ago`;
    return `${Math.floor(elapsedMs / 3600000)}h ago`;
  } catch (e) {
    return 'Recently';
  }
}
