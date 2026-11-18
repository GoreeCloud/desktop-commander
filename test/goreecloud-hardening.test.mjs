import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');

test('upstream MIT provenance retained', () => {
  assert.match(read('LICENSE'), /Eduard Ruzga and Desktop Commander Contributors/);
  assert.match(read('NOTICE.md'), /325a203412612e3be98ea4400d9df59d153068b6/);
});
test('npm install does not run upstream tracking hook', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.name, '@goreecloud/desktop-commander');
  assert.equal(pkg.scripts.postinstall, undefined);
  assert.equal(pkg.scripts.prepare, undefined);
  assert.equal(existsSync(resolve(root, 'track-installation.js')), false);
});
test('telemetry and sensitive tool histories disabled', () => {
  assert.match(read('src/config-manager.ts'), /telemetryEnabled: false/);
  assert.match(read('src/utils/capture.ts'), /return true;/);
  assert.doesNotMatch(read('src/utils/toolHistory.ts'), /appendFile|writeFileSync/);
  assert.match(read('src/utils/toolHistory.ts'), /getRecentCalls/);
});
test('upstream remote and bootstrap network startup disabled', () => {
  const main = read('src/index.ts');
  assert.match(main, /Remote relay is unavailable/);
  assert.doesNotMatch(main, /await runRemote\(/);
  assert.doesNotMatch(main, /featureFlagManager.initialize\(/);
  assert.doesNotMatch(main, /ensureChromeAvailable\(/);
  assert.match(read('src/server.ts'), /tool.name !== 'give_feedback_to_desktop_commander'/);
});
test('mandatory root and docs files exist', () => {
  for (const name of ['LICENSE','README.md','NOTICE.md','SECURITY.md','PRIVACY.md',
                      'docs/FEATURES.md','docs/ROADMAP.md','docs/OBJECTIVES.md']) {
    assert.ok(existsSync(resolve(root, name)), name);
  }
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.mcpName, 'app.goreecloud/desktop-commander');
});
