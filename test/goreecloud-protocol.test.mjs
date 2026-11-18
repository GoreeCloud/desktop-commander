import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('MCP handshake and tool schema discovery in an isolated home', { timeout: 25000 }, async () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'gc-dc-mcp-smoke-'));
  let client;
  const samplePath = path.join(sandbox, 'example.txt');
  fs.writeFileSync(samplePath, 'GoreeCloud local MCP smoke test');
  try {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [path.join(projectRoot, 'dist/index.js'), '--no-onboarding'],
      cwd: sandbox,
      env: {
        ...process.env,
        HOME: sandbox,
        USERPROFILE: sandbox,
        DESKTOP_COMMANDER_DISABLE_TELEMETRY: '1',
        GOREECLOUD_ALLOWED_ROOTS: sandbox,
        GOREECLOUD_ALLOW_WRITES: '1',
      },
      stderr: 'pipe',
    });
    client = new Client({ name: 'goreecloud-ci-smoke', version: '0.1.0' });
    await client.connect(transport);
    const response = await client.listTools();
    assert.ok(Array.isArray(response.tools));
    const names = new Set(response.tools.map((tool) => tool.name));
    assert.ok(names.has('read_file'));
    assert.ok(names.has('start_process'));
    assert.ok(!names.has('give_feedback_to_desktop_commander'));
    const read = response.tools.find((tool) => tool.name === 'read_file');
    assert.equal(read.inputSchema.type, 'object');
    assert.ok(read.inputSchema.properties.path);
    const first = await client.callTool({ name: 'read_file', arguments: { path: samplePath } });
    assert.notEqual(first.isError, true, JSON.stringify(first));
    assert.match(JSON.stringify(first.content), /GoreeCloud local MCP smoke test/);
    const changed = await client.callTool({ name: 'write_file', arguments: { path: samplePath, content: 'MCP trusted sandbox write', mode: 'rewrite' } });
    assert.notEqual(changed.isError, true, JSON.stringify(changed));
    assert.equal(fs.readFileSync(samplePath, 'utf8'), 'MCP trusted sandbox write');
  } finally {
    if (client) await client.close();
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});

test('actual stdio MCP dispatcher fails closed for unapproved operations', { timeout: 25000 }, async () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'gc-dc-mcp-denied-'));
  const inside = path.join(sandbox, 'inside.txt');
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'gc-dc-mcp-outside-'));
  const outsideFile = path.join(outside, 'outside.txt');
  fs.writeFileSync(inside, 'local test content');
  fs.writeFileSync(outsideFile, 'outside test content');
  const attemptedFile = path.join(sandbox, 'should-not-exist.txt');
  let client;
  try {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [path.join(projectRoot, 'dist/index.js'), '--no-onboarding'],
      cwd: sandbox,
      env: {
        ...process.env,
        HOME: sandbox,
        USERPROFILE: sandbox,
        DESKTOP_COMMANDER_DISABLE_TELEMETRY: '1',
        GOREECLOUD_ALLOWED_ROOTS: sandbox,
        GOREECLOUD_ALLOW_WRITES: '0',
        GOREECLOUD_ALLOW_TERMINAL: '0',
        GOREECLOUD_ALLOW_URL_READS: '0',
      },
      stderr: 'pipe',
    });
    client = new Client({ name: 'goreecloud-ci-denied', version: '0.1.0' });
    await client.connect(transport);
    const deniedWrite = await client.callTool({
      name: 'write_file', arguments: { path: attemptedFile, content: 'should never be written' },
    });
    assert.equal(deniedWrite.isError, true, JSON.stringify(deniedWrite));
    assert.equal(fs.existsSync(attemptedFile), false);
    const deniedShell = await client.callTool({
      name: 'start_process', arguments: { command: 'echo should-not-run' },
    });
    assert.equal(deniedShell.isError, true, JSON.stringify(deniedShell));
    const deniedOutside = await client.callTool({
      name: 'read_file', arguments: { path: outsideFile },
    });
    assert.equal(deniedOutside.isError, true, JSON.stringify(deniedOutside));
    assert.doesNotMatch(JSON.stringify(deniedOutside.content), /outside test content/);
    const insideRead = await client.callTool({
      name: 'read_file', arguments: { path: inside },
    });
    assert.notEqual(insideRead.isError, true, JSON.stringify(insideRead));
    assert.match(JSON.stringify(insideRead.content), /local test content/);
    const deniedRemote = await client.callTool({
      name: 'get_config', arguments: {}, _meta: { remote: true },
    });
    assert.equal(deniedRemote.isError, true, JSON.stringify(deniedRemote));
  } finally {
    if (client) await client.close();
    fs.rmSync(sandbox, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});
