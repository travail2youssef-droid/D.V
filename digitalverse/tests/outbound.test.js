import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { buildAnthropicRequest, extractAnthropicReply } from '../ai-providers.js';
import { isOutboundUrlAllowed, requestJson, resolveOutboundUrl } from '../outbound.js';

const listen = server => new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
const close = server => new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));

test('Anthropic uses the native Messages API request format', () => {
  const request = buildAnthropicRequest({
    apiKey: 'test-key',
    model: 'claude-3-5-sonnet-latest',
    systemPrompt: 'Be concise.',
    history: [
      { sender: 'user', message: 'Bonjour' },
      { sender: 'agent', message: 'Bonjour, que cherchez-vous ?' },
    ],
  });
  assert.equal(request.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(request.headers['x-api-key'], 'test-key');
  assert.equal(request.headers['anthropic-version'], '2023-06-01');
  assert.deepEqual(request.body.messages, [
    { role: 'user', content: 'Bonjour' },
    { role: 'assistant', content: 'Bonjour, que cherchez-vous ?' },
  ]);
  assert.equal(request.body.system, 'Be concise.');
});

test('Anthropic text blocks are normalized into a plain assistant reply', () => {
  assert.equal(extractAnthropicReply({ content: [
    { type: 'text', text: 'Bonjour.' },
    { type: 'tool_use', name: 'not-text' },
    { type: 'text', text: 'Que puis-je faire ?' },
  ] }), 'Bonjour.\nQue puis-je faire ?');
  assert.equal(extractAnthropicReply({ content: [] }), '');
});

test('outbound URL validation rejects local, private, reserved and mapped loopback IPs', async () => {
  for (const url of [
    'http://localhost/',
    'http://127.0.0.1/',
    'http://2130706433/',
    'http://192.168.1.10/',
    'http://[::1]/',
    'http://[::ffff:127.0.0.1]/',
    'http://user:password@example.com/',
  ]) {
    assert.equal(resolveOutboundUrl(url, '', false), null, url);
    assert.equal(await isOutboundUrlAllowed(url, { allowPrivate: false }), false, url);
  }
  assert.ok(resolveOutboundUrl('https://example.com/v1', '', false));
});

test('outbound requests do not follow redirects', async () => {
  let redirected = false;
  const server = http.createServer((req, res) => {
    if (req.url === '/redirect') {
      res.writeHead(302, { Location: '/private-target' });
      res.end();
    } else {
      redirected = true;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
    }
  });
  const port = await listen(server);
  try {
    const result = await requestJson(`http://127.0.0.1:${port}/redirect`, { body: {}, allowPrivate: true });
    assert.equal(result.ok, false);
    assert.equal(result.status, 302);
    assert.equal(redirected, false);
  } finally {
    await close(server);
  }
});

test('outbound requests cap response bodies', async () => {
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('x'.repeat(1024 * 1024 + 1));
  });
  const port = await listen(server);
  try {
    const result = await requestJson(`http://127.0.0.1:${port}/large`, { body: {}, allowPrivate: true });
    assert.equal(result.ok, false);
    assert.match(result.error, /volumineuse|interrompue/i);
  } finally {
    await close(server);
  }
});
