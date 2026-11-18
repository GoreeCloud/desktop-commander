/** GoreeShield privacy: no raw tool arguments, paths or outputs persisted. */
import type { ServerResult } from '../types.js';
export interface ToolCallRecord {
 timestamp: string; toolName: string; arguments: unknown;
 output: ServerResult; duration?: number;
}
export class ToolHistory {
 addCall(_name: string, _args: unknown, _result: ServerResult, _duration?: number): void {}
 getRecentCalls(_options: {maxResults?: number;toolName?: string;since?: string;}): ToolCallRecord[] { return []; }
 getRecentCallsFormatted(_options: {maxResults?: number;toolName?: string;since?: string;}): ToolCallRecord[] { return []; }
 getStats() { return {totalEntries:0, oldestEntry:undefined, newestEntry:undefined, historyFile:'disabled', queuedWrites:0}; }
 async cleanup(): Promise<void> {}
}
export const toolHistory=new ToolHistory();
