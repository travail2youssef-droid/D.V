import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
let server, directory, origin, fakeN8n, n8nPort;
before(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'digitalverse-'));
  // A deliberately slow agent endpoint: it holds the request open long enough that a
  // read-modify-write race on orders.json becomes reproducible instead of theoretical.
  fakeN8n = http.createServer((req, res) => {
    setTimeout(() => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ output: 'pong' })); }, 150);
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => fakeN8n.once('listening', () => { n8nPort = fakeN8n.address().port; resolve(); }));
  server = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: '0', DATA_DIR: directory, ADMIN_USER: 'tester', ADMIN_PASSWORD: 'test-only-password', ALLOW_PRIVATE_WEBHOOKS: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
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
  if (fakeN8n) fakeN8n.close();
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

// --- Régressions couvertes après audit du 19/10 ---

const admin = (url, options = {}) => fetch(`${origin}${url}`, {
  ...options,
  headers: { ...options.headers, Authorization: `Basic ${Buffer.from('tester:test-only-password').toString('base64')}` },
});

test('les types inattendus renvoient 400 en JSON, sans fuite de stack', async () => {
  const responses = await Promise.all([
    admin('/api/registry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deliverableUrl: 123 }) }),
    admin('/api/registry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deliverableUrl: 'javascript:alert(1)' }) }),
    admin('/api/orders/x', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deliverable: 'non' }) }),
  ]);
  for (const response of responses) {
    const text = await response.text();
    assert.equal(response.status, 400, text.slice(0, 120));
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.ok(!text.includes('<!DOCTYPE') && !text.includes('server.js:'), `fuite de stack: ${text.slice(0, 120)}`);
  }
});

test('les réglages refusent les clés inconnues et permettent de retirer une clé API', async () => {
  const junk = await admin('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: 'sk-test', evil: 'x' }) });
  assert.equal(junk.status, 400);

  const save = await admin('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: 'sk-test-1234567890' }) });
  assert.equal(save.status, 200);
  assert.equal((await (await admin('/api/settings')).json()).settings.hasKey, true);

  await admin('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: '' }) });
  assert.equal((await (await admin('/api/settings')).json()).settings.hasKey, false, 'une chaîne vide doit effacer la clé');
});

test('un fichier de données corrompu est signalé, jamais écrasé par les valeurs par défaut', async () => {
  const file = path.join(directory, 'orders.json');
  const backup = await readFile(file, 'utf8');
  await writeFile(file, '{ json tronqué');

  const response = await admin('/api/orders');
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /illisibles/);
  assert.equal(await readFile(file, 'utf8'), '{ json tronqué', 'les données doivent rester en place pour réparation');

  await writeFile(file, backup);
});

test('deux messages simultanés sur un même brief ne s’écrasent pas', async () => {
  // Point the brief at the slow fake provider, so both requests are mid-flight at once.
  const configured = await admin('/api/settings', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'n8n', n8nWebhookUrl: `http://127.0.0.1:${n8nPort}`, n8nWebhookId: 'test-hook' }),
  });
  assert.equal(configured.status, 200);

  const created = await fetch(`${origin}/api/orders`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client: { firstName: 'Deux', lastName: 'Clients', email: 'deux@example.com' } }),
  });
  const { order } = await created.json();
  const headers = { 'Content-Type': 'application/json', 'X-Order-Token': order.clientToken };
  const messages = ['Premier besoin', 'Second besoin', 'Troisième besoin'];

  const replies = await Promise.all(messages.map(message =>
    fetch(`${origin}/api/orders/${order.id}/chat`, { method: 'POST', headers, body: JSON.stringify({ message }) }).then(r => r.json())
  ));
  assert.ok(replies.every(r => r.success), 'le fournisseur lent doit répondre');

  const stored = await (await admin(`/api/orders/${order.id}`)).json();
  const history = stored.order.chatHistory;
  const userMessages = history.filter(m => m.sender === 'user').map(m => m.message);
  const agentMessages = history.filter(m => m.sender === 'agent').map(m => m.message);
  for (const message of messages) {
    assert.ok(userMessages.includes(message), `message perdu par la course d’écriture: ${JSON.stringify(userMessages)}`);
  }
  assert.equal(agentMessages.filter(m => m === 'pong').length, 3, 'chaque réponse du provider doit être conservée');

  await admin('/api/settings', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'n8n', n8nWebhookUrl: '' }),
  });
});

test('les commandes ne fuient pas le jeton de brief vers l’administration, et la 404 API est en JSON', async () => {
  const list = await (await admin('/api/orders')).json();
  assert.ok(list.orders.length > 0);
  assert.ok(list.orders.every(o => o.clientToken === undefined), 'clientToken ne doit pas être diffusé aux onglets admin');

  const missing = await fetch(`${origin}/api/inexistant`);
  assert.equal(missing.status, 404);
  assert.match((await missing.json()).error, /introuvable/);
});

test('l’authentification Basic est limitée en débit, y compris sur les routes admin', async () => {
  let last;
  for (let i = 0; i < 12; i++) {
    last = await fetch(`${origin}/api/orders`, { headers: { Authorization: `Basic ${Buffer.from('tester:mauvais-mot-de-passe').toString('base64')}` } });
    if (last.status === 429) break;
  }
  assert.equal(last.status, 429, 'le brute-force sur Basic doit être bloqué');
  assert.ok((await last.json()).error.includes('15 minutes'));
});
