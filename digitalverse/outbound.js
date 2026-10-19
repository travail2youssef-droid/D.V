import { lookup } from 'node:dns/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import ipaddr from 'ipaddr.js';

const MAX_RESPONSE_BYTES = 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 30_000;
const hostnameWithoutBrackets = hostname => hostname.startsWith('[') && hostname.endsWith(']')
  ? hostname.slice(1, -1)
  : hostname;

function isPublicAddress(address) {
  try {
    // process() also normalizes IPv4-mapped IPv6 addresses before classification.
    return ipaddr.process(address).range() === 'unicast';
  } catch {
    return false;
  }
}

function isLocalHostname(hostname) {
  const normalized = hostnameWithoutBrackets(hostname).toLowerCase().replace(/\.$/, '');
  return normalized === 'localhost' || normalized.endsWith('.localhost');
}

export function resolveOutboundUrl(rawUrl, suffix = '', allowPrivate = process.env.ALLOW_PRIVATE_WEBHOOKS === '1') {
  const base = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!base) return null;

  let url;
  try {
    const target = base.endsWith('/') || suffix === '' ? `${base}${suffix}` : `${base}/${suffix}`;
    url = new URL(target);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null;
  const hostname = hostnameWithoutBrackets(url.hostname);
  if (!allowPrivate && (isLocalHostname(hostname) || (ipaddr.isValid(hostname) && !isPublicAddress(hostname)))) {
    return null;
  }
  return url.href;
}

async function lookupWithTimeout(hostname, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Résolution DNS expirée.')), timeoutMs);
    timer.unref?.();
  });
  try {
    return await Promise.race([lookup(hostname, { all: true, verbatim: true }), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

async function resolvePinnedAddress(url, { allowPrivate, timeoutMs }) {
  const hostname = hostnameWithoutBrackets(url.hostname);
  let addresses;

  if (ipaddr.isValid(hostname)) {
    const address = ipaddr.process(hostname);
    addresses = [{ address: address.toString(), family: address.kind() === 'ipv4' ? 4 : 6 }];
  } else {
    addresses = await lookupWithTimeout(hostname, timeoutMs);
  }

  if (!Array.isArray(addresses) || addresses.length === 0) throw new Error('Aucune adresse IP trouvée pour cet hôte.');
  if (!allowPrivate && addresses.some(entry => !isPublicAddress(entry.address))) {
    throw new Error('La destination résout vers une adresse privée ou réservée.');
  }

  const selected = addresses.find(entry => allowPrivate || isPublicAddress(entry.address));
  if (!selected) throw new Error('Aucune adresse publique disponible pour cet hôte.');
  return { address: selected.address, family: selected.family };
}

export async function isOutboundUrlAllowed(rawUrl, { allowPrivate = process.env.ALLOW_PRIVATE_WEBHOOKS === '1', timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const normalized = resolveOutboundUrl(rawUrl, '', allowPrivate);
  if (!normalized) return false;
  try {
    await resolvePinnedAddress(new URL(normalized), { allowPrivate, timeoutMs });
    return true;
  } catch {
    return false;
  }
}

function failure(error, status = 0, text = '') {
  return { ok: false, status, data: null, text, error: error?.message || String(error || 'Requête sortante impossible.') };
}

// Deliberately uses Node's HTTP clients instead of fetch: redirects are never followed,
// DNS is checked and pinned to the exact address used for the connection, and response
// bodies are capped. That closes both redirect-based SSRF and DNS-rebinding gaps.
export async function requestJson(rawUrl, {
  headers = {},
  body = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
  allowPrivate = process.env.ALLOW_PRIVATE_WEBHOOKS === '1',
} = {}) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return failure('URL sortante invalide.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
    return failure('URL sortante invalide.');
  }

  let pinnedAddress;
  try {
    if (!resolveOutboundUrl(url.href, '', allowPrivate)) return failure('Destination privée ou URL non autorisée.');
    pinnedAddress = await resolvePinnedAddress(url, { allowPrivate, timeoutMs });
  } catch (err) {
    return failure(err);
  }

  let payload;
  try {
    payload = Buffer.from(JSON.stringify(body));
  } catch (err) {
    return failure(err);
  }

  const transport = url.protocol === 'https:' ? httpsRequest : httpRequest;
  return new Promise(resolve => {
    let settled = false;
    let timer;
    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    let request;
    try {
      request = transport(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(payload.byteLength),
          ...headers,
        },
        // The lookup callback returns only the validated address; the original URL
        // hostname remains in place for Host and TLS certificate verification.
        lookup: (_hostname, options, callback) => {
          const result = { address: pinnedAddress.address, family: pinnedAddress.family };
          if (options && typeof options === 'object' && options.all) callback(null, [result]);
          else callback(null, result.address, result.family);
        },
      }, response => {
        const chunks = [];
        let bytes = 0;
        response.on('data', chunk => {
          bytes += chunk.length;
          if (bytes > MAX_RESPONSE_BYTES) {
            request.destroy(new Error('Réponse distante trop volumineuse.'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('error', err => finish(failure(err, response.statusCode || 0)));
        response.on('aborted', () => finish(failure('Réponse distante interrompue.', response.statusCode || 0)));
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          const status = response.statusCode || 0;
          if (status < 200 || status >= 300) {
            finish(failure(`Réponse HTTP ${status}.`, status, text.slice(0, 200)));
            return;
          }
          let data = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch {
            data = null;
          }
          finish({ ok: true, status, data, text });
        });
      });
    } catch (err) {
      finish(failure(err));
      return;
    }

    timer = setTimeout(() => request.destroy(new Error('Délai de la requête sortante dépassé.')), timeoutMs);
    timer.unref?.();
    request.on('error', err => finish(failure(err)));
    request.end(payload);
  });
}
