import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
let server, directory, origin;
before(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'digitalverse-'));
  server = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: '0', DATA_DIR: directory, ADMIN_USER: 'tester', ADMIN_PASSWORD: 'test-only-password' }, stdio: ['ignore', 'pipe', 'pipe'] });
  // Read the assigned port from the startup log, without hardcoding a test port.
  origin = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timed out')), 10000);
    server.once('error', reject);
    server.stdout.on('data', data => {
      const match = String(data).match(/0\.0\.0\.0:(\d+)/);
      if (match) { clearTimeout(timer); resolve(`http://127.0.0.1:${match[1]}`); }
    });
  });
});
after(async () => {
  if (server && server.exitCode === null) await new Promise(resolve => { server.once('exit', resolve); server.kill(); });
  if (directory) await rm(directory, { recursive: true, force: true });
});
const body = { name: 'Test Client', email: 'test@example.com', message: 'Un site pour mon activité', consent: true };
const submit = data => fetch(`${origin}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
test('contact rejects invalid data and missing consent', async () => {
  for (const invalid of [{ ...body, consent: false }, { ...body, email: 'invalid' }, { ...body, name: 42 }]) assert.equal((await submit(invalid)).status, 400);
});
test('contact acknowledges only after persistence', async () => {
  const response = await submit(body);
  assert.equal(response.status, 201);
  const result = await response.json();
  const contacts = JSON.parse(await readFile(path.join(directory, 'contacts.json'), 'utf8'));
  assert.equal(contacts[0].id, result.id);
  assert.equal(contacts[0].email, body.email);
});
test('administrative endpoints require credentials', async () => {
  for (const url of ['/api/orders', '/api/settings', '/api/registry', '/api/events', '/api/contacts']) {
    assert.equal((await fetch(origin + url)).status, 401, url);
  }
  const response = await fetch(`${origin}/api/contacts`, { headers: { Authorization: `Basic ${Buffer.from('tester:test-only-password').toString('base64')}` } });
  assert.equal(response.status, 200);
});
test('all public page URLs can be loaded directly', async () => {
  for (const url of ['/', '/expertises', '/realisations', '/offres', '/agence', '/contact', '/admin']) {
    const response = await fetch(origin + url);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /id="root"/);
  }
});
test('contact requests are rate limited', async () => {
  for (let i = 0; i < 4; i++) assert.equal((await submit(body)).status, 201);
  assert.equal((await submit(body)).status, 429);
});
test('briefing requires the private token returned at order creation', async () => {
  const response = await fetch(`${origin}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client: { firstName: 'Test', lastName: 'Client', email: 'test@example.com' }, projectType: 'site' }) });
  assert.equal(response.status, 201);
  const { order } = await response.json();
  assert.ok(order.clientToken);
  const url = `${origin}/api/orders/${order.id}/finalize`;
  assert.equal((await fetch(url, { method: 'POST' })).status, 403);
  assert.equal((await fetch(url, { method: 'POST', headers: { 'X-Order-Token': order.clientToken } })).status, 200);
});

test('admin login creates a revocable HttpOnly session', async () => {
  const login = credentials => fetch(`${origin}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
  assert.equal((await login({ username: 'tester', password: 'wrong' })).status, 401);
  const response = await login({ username: 'tester', password: 'test-only-password' });
  assert.equal(response.status, 200);
  const setCookie = response.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  const cookie = setCookie.split(';')[0];
  assert.equal((await fetch(`${origin}/api/orders`, { headers: { cookie } })).status, 200);
  assert.equal((await (await fetch(`${origin}/api/auth/session`, { headers: { cookie } })).json()).authenticated, true);
  assert.equal((await fetch(`${origin}/api/auth/logout`, { method: 'POST', headers: { cookie } })).status, 200);
  assert.equal((await fetch(`${origin}/api/orders`, { headers: { cookie } })).status, 401);
});
