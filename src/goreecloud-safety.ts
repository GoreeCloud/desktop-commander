/**
 * GoreeCloud Desktop Commander: local MCP request policy.
 * Defense in depth, not an OS sandbox. Clients never choose these environment
 * variables; start the server from a trusted launch configuration.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type PolicyResult = { allowed: true } | { allowed: false; reason: string };

const TERMINAL_TOOLS = new Set([
  'start_process', 'interact_with_process', 'read_process_output',
  'force_terminate', 'kill_process', 'list_processes', 'list_sessions',
]);
const WRITE_TOOLS = new Set([
  'write_file', 'write_pdf', 'edit_block', 'create_directory', 'move_file',
  'set_config_value',
]);
const FS_TOOLS = new Set([
  'read_file', 'read_multiple_files', 'write_file', 'write_pdf',
  'edit_block', 'create_directory', 'move_file', 'get_file_info',
  'list_directory', 'start_search',
]);

const blocked = (reason: string): PolicyResult => ({ allowed: false, reason });
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function absolutePath(value: string, cwd: string): string {
  const expanded = value === '~' ? os.homedir()
    : value.startsWith('~/') || value.startsWith('~\\')
      ? path.join(os.homedir(), value.slice(2)) : value;
  return path.resolve(cwd, expanded);
}

/** Resolve existing symlinks, including ancestor symlinks for new paths. */
function canonicalPath(input: string, cwd: string): string {
  let current = absolutePath(input, cwd);
  const missing: string[] = [];
  while (true) {
    try {
      return path.resolve(fs.realpathSync.native(current), ...missing);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') throw error;
      // A dangling symlink is not a new file; do not let it bypass the boundary.
      try {
        if (fs.lstatSync(current).isSymbolicLink()) {
          throw new Error('Dangling symlinks are not allowed');
        }
      } catch (statError) {
        if ((statError as NodeJS.ErrnoException).code !== 'ENOENT') throw statError;
      }
      const parent = path.dirname(current);
      if (parent === current) throw new Error('No resolvable path ancestor');
      missing.unshift(path.basename(current));
      current = parent;
    }
  }
}

function allowedRoots(env: NodeJS.ProcessEnv, cwd: string): string[] {
  const configured = env.GOREECLOUD_ALLOWED_ROOTS;
  const inputs = configured === undefined ? [cwd] : configured.split(path.delimiter);
  if (inputs.length === 0 || inputs.some((entry) => !entry || !path.isAbsolute(entry))) {
    throw new Error('Allowed roots configuration is invalid');
  }
  const roots = inputs.map((entry) => canonicalPath(entry, cwd));
  if (roots.includes(path.parse(cwd).root) && env.GOREECLOUD_ALLOW_FILESYSTEM_ROOT !== '1') {
    throw new Error('Filesystem root access requires explicit operator approval');
  }
  return roots;
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === '' || (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative));
}

function filesForTool(name: string, args: Record<string, unknown>): string[] {
  if (name === 'read_multiple_files') {
    if (!Array.isArray(args.paths) || !args.paths.every((v) => typeof v === 'string')) throw new Error('Invalid path list');
    return args.paths;
  }
  if (name === 'move_file') return [args.source, args.destination].map(assertPath);
  if (name === 'edit_block') return [assertPath(args.file_path)];
  if (name === 'write_pdf') {
    const values = [assertPath(args.path)];
    if (args.outputPath !== undefined) values.push(assertPath(args.outputPath));
    if (Array.isArray(args.content)) for (const operation of args.content) {
      if (isRecord(operation) && operation.sourcePdfPath !== undefined) {
        values.push(assertPath(operation.sourcePdfPath));
      }
    }
    return values;
  }
  return [assertPath(args.path)];
}

function assertPath(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '' || value.includes(String.fromCharCode(0))) {
    throw new Error('Invalid or missing path');
  }
  return value;
}

export function evaluateLocalMcpPolicy(
  name: string, input: unknown, metadata: unknown,
  env: NodeJS.ProcessEnv = process.env, cwd: string = process.cwd()
): PolicyResult {
  // The proprietary hosted relay is deliberately unavailable. Metadata
  // originating from an MCP client cannot grant remote execution authority.
  if (isRecord(metadata) && metadata.remote) {
    return blocked('Remote tool execution is not enabled');
  }
  if (TERMINAL_TOOLS.has(name) && env.GOREECLOUD_ALLOW_TERMINAL !== '1') {
    return blocked('Terminal and process tools require GOREECLOUD_ALLOW_TERMINAL=1');
  }
  if (WRITE_TOOLS.has(name) && env.GOREECLOUD_ALLOW_WRITES !== '1') {
    return blocked('Writing and configuration changes require GOREECLOUD_ALLOW_WRITES=1');
  }
  if (name === 'read_file' && isRecord(input) && input.isUrl === true) {
    if (env.GOREECLOUD_ALLOW_URL_READS !== '1') {
      return blocked('URL reads require GOREECLOUD_ALLOW_URL_READS=1');
    }
    if (typeof input.path !== 'string' || !/^https:\/\//i.test(input.path)) {
      return blocked('Only explicit HTTPS URL reads are supported');
    }
    return { allowed: true };
  }
  if (FS_TOOLS.has(name)) {
    if (!isRecord(input)) return blocked('A valid path is required');
    try {
      const roots = allowedRoots(env, cwd);
      const entries = filesForTool(name, input);
      for (const entry of entries) {
        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(entry)) {
          return blocked('Network URLs are not filesystem paths');
        }
        const actual = canonicalPath(entry, cwd);
        if (!roots.some((root) => isWithin(root, actual))) {
          return blocked('Path is outside the operator-approved filesystem roots');
        }
      }
    } catch {
      return blocked('Invalid or inaccessible filesystem path or root configuration');
    }
  }
  return { allowed: true };
}
