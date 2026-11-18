import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { evaluateLocalMcpPolicy as policy } from '../dist/goreecloud-safety.js';

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'gc-dc-policy-'));
const allowed = path.join(work, 'allowed');
const outside = path.join(work, 'outside');
fs.mkdirSync(allowed);
fs.mkdirSync(outside);
fs.writeFileSync(path.join(allowed, 'example.txt'), 'safe');
fs.writeFileSync(path.join(outside, 'private.txt'), 'private');
fs.symlinkSync(outside, path.join(allowed, 'escape'));
fs.symlinkSync(path.join(outside, 'not-existing.txt'), path.join(allowed, 'dangling'));
const env = Object.freeze({ GOREECLOUD_ALLOWED_ROOTS: allowed });
const root = (name, args, options = {}) => policy(name, args, options.meta ?? null, options.env ?? env, options.cwd ?? allowed);
const yes = (result) => assert.equal(result.allowed, true, JSON.stringify(result));
const no = (result) => assert.equal(result.allowed, false, JSON.stringify(result));
test.after(() => fs.rmSync(work, { recursive: true, force: true }));

test('read inside operator root and relative inside root allowed', () => {
  yes(root('read_file', { path: path.join(allowed,'example.txt') }));
  yes(root('read_file', { path: 'example.txt' }));
});
test('parent traversal and absolute path outside denied', () => {
  no(root('read_file', { path: '../outside/private.txt' }));
  no(root('list_directory', { path: outside }));
});
test('symlink traversal and dangling symlinks denied', () => {
  no(root('read_file', { path: path.join(allowed, 'escape', 'private.txt') }));
  no(root('read_file', { path: path.join(allowed, 'dangling') }));
});
test('new valid paths stay within allowed root', () => {
  yes(root('write_file', { path: path.join(allowed, 'newfolder', 'new.txt') },
    { env: {...env,GOREECLOUD_ALLOW_WRITES:'1'} }));
});
test('reading multiple files fails closed if any is outside', () => {
  no(root('read_multiple_files', { paths: [path.join(allowed, 'example.txt'),path.join(outside, 'private.txt')] }));
  yes(root('read_multiple_files', { paths: [path.join(allowed, 'example.txt')] }));
});
test('mutations including configuration are off by default', () => {
  for (const [name, arg] of [
    ['write_file', {path:path.join(allowed,'example.txt')}],
    ['edit_block',{file_path:path.join(allowed,'example.txt')}],
    ['set_config_value',{key:'allowedDirectories',value: ['/']}],
    ['create_directory',{path:path.join(allowed,'new')}],
    ['move_file',{source:path.join(allowed,'example.txt'),destination:path.join(allowed,'new')}],
  ]) no(root(name, arg));
});
test('terminal and process tools are off by default', () => {
  for (const name of ['start_process','interact_with_process','list_processes','read_process_output','kill_process'])
    no(root(name, {command:'whoami'}));
  yes(root('start_process',{command:'whoami'},{env:{...env,GOREECLOUD_ALLOW_TERMINAL:'1'}}));
});
test('URL reads are disabled without explicit opt-in', () => {
  no(root('read_file',{path:'https://example.org/a',isUrl:true}));
});
test('hosted remote metadata never authorizes MCP tools', () => {
  no(root('get_config',{}, {meta:{remote:true},env:{...env,GOREECLOUD_ALLOW_TERMINAL:'1',GOREECLOUD_ALLOW_WRITES:'1'}}));
});
test('empty and relative filesystem root configuration fail closed', () => {
  no(root('read_file',{path:path.join(allowed,'example.txt')},{env:{GOREECLOUD_ALLOWED_ROOTS:''}}));
  no(root('read_file',{path:path.join(allowed,'example.txt')},{env:{GOREECLOUD_ALLOWED_ROOTS:'relative/path'}}));
});
test('filesystem root requires explicit separate operator approval', () => {
  no(root('read_file',{path:path.join(allowed,'example.txt')},{env:{GOREECLOUD_ALLOWED_ROOTS:path.parse(allowed).root}}));
  yes(root('read_file',{path:path.join(allowed,'example.txt')},{env:{GOREECLOUD_ALLOWED_ROOTS:path.parse(allowed).root,GOREECLOUD_ALLOW_FILESYSTEM_ROOT:'1'}}));
});
test('nested PDF source/destination checked', () => {
  no(root('write_pdf',{path:path.join(allowed,'doc.pdf'),content:[{type:'insert',pageIndex:0,sourcePdfPath:path.join(outside,'private.txt')}]},{env:{...env,GOREECLOUD_ALLOW_WRITES:'1'}}));
});
test('missing and malformed path arguments fail closed', () => {
  no(root('read_file',{}));
  no(root('read_multiple_files',{paths:'hello'}));
});
test('new operator approval is required to edit files even in the approved root', () => {
  yes(root('edit_block',{file_path:path.join(allowed,'example.txt')},{env:{...env,GOREECLOUD_ALLOW_WRITES:'1'}}));
});
