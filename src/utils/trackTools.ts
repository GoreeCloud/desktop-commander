/**
 * GoreeShield privacy boundary: no tool inputs, command strings, paths,
 * or file names are written to persistent tool-call history by default.
 * Import preserves the interface without the original argument logger.
 */
export async function trackToolCall(_toolName: string, _args?: unknown): Promise<void> {
  return;
}
