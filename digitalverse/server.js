import express from 'express';
import cors from 'cors';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Set TRUST_PROXY_HOPS to the number of reverse proxies in front of Node (nginx,
// Caddy, PaaS...). Left at 0 on purpose: trusting X-Forwarded-For without a real
// proxy in front would let any client spoof its IP and bypass the rate limits.
const TRUST_PROXY_HOPS = Number.parseInt(process.env.TRUST_PROXY_HOPS ?? '0', 10);
app.set('trust proxy', Number.isFinite(TRUST_PROXY_HOPS) ? TRUST_PROXY_HOPS : 0);

// The site calls this API same-origin, so no CORS headers are emitted by default.
// Set CORS_ORIGIN="https://a.example,https://b.example" to open specific origins.
const CORS_ORIGINS = (process.env.CORS_ORIGIN || '').split(',').map(v => v.trim()).filter(Boolean);
if (CORS_ORIGINS.length) app.use(cors({ origin: CORS_ORIGINS, credentials: true }));

// A 64kb cap is far above any legitimate payload here (chat messages are capped at
// 10 000 characters) and keeps a hostile body from being parsed for nothing.
app.use(express.json({ limit: '64kb' }));

// Ensure data directory exists
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const REGISTRY_FILE = path.join(DATA_DIR, 'registry.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const N8N_WORKFLOW_FILE = path.join(DATA_DIR, 'n8n-agent-workflow.json');

// Default settings with pre-configured n8n and Groq support
const defaultSettings = {
  provider: 'n8n', // 'n8n' | 'groq' | 'openai' | 'anthropic' | 'custom'
  
  // n8n Webhook details from user workflow
  n8nWebhookUrl: '', // e.g. "https://n8n.your-domain.com"
  n8nWebhookId: 'b639adfd-6c4b-48cd-af68-fb21384fcc52', // From user's n8n workflow
  n8nMode: 'webhook', // 'webhook' (production) or 'webhook-test' (test mode in n8n UI)
  
  // Groq direct details from user workflow
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile', // or openai/gpt-oss-20b as in node

  // OpenAI / standard details
  apiKey: '',
  model: 'gpt-4o-mini',
  customEndpoint: 'https://api.openai.com/v1',

  systemPrompt: `Tu es Nova, l'Architecte Conseil et Stratège Digital de l'agence DigitalVerse (agence web haut de gamme et solutions IA).
Ton rôle est de mener un brief concis, ultra-professionnel et bienveillant avec le client qui vient de souscrire un forfait chez DigitalVerse.
RÈGLES IMPORTANTES :
1. Pose une seule question clé à la fois pour ne pas submerger le client.
2. Récolte les informations indispensables : cible/secteur, fonctionnalités attendues, style visuel souhaité, contenus existants.
3. Sache t'arrêter après 3 à 4 questions au total. Ne pose pas de questions inutiles.
4. Dès que tu as assez d'éléments, annonce que le brief est complet et vérifie la compatibilité de sa demande avec le forfait choisi.`
};

// Initial sample orders if file doesn't exist
const initialOrders = [
  {
    id: "DV-9102",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    client: {
      firstName: "Alexandre",
      lastName: "de Montmirail",
      email: "alexandre@velora-paris.com",
      phone: "+33 6 12 34 56 78"
    },
    projectType: "site",
    planId: "business-fonctionnel",
    planName: "Business Fonctionnel (600 €)",
    deadline: "2 à 3 semaines",
    initialNotes: "Création du site e-commerce vitrine pour notre maison d'artisanat de luxe Maison Vélora. Besoin d'un catalogue épuré et d'un formulaire de contact privé.",
    status: "Prête & Livrée",
    chatHistory: [
      {
        id: "msg-1",
        sender: "agent",
        message: "Bonjour Alexandre, bienvenue chez DigitalVerse. Je suis Nova, votre architecte digital dédié. Vous avez choisi notre forfait Business Fonctionnel (600 €). Pour commencer notre cadrage, pourriez-vous me décrire l'ambiance et la cible principale de la Maison Vélora ?",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: "msg-2",
        sender: "user",
        message: "C'est une clientèle haut de gamme qui recherche des pièces de maroquinerie d'exception. Nous voulons un style minimaliste, fond sombre ou crème avec une typographie avec empattements moderne.",
        timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString()
      },
      {
        id: "msg-3",
        sender: "agent",
        message: "Parfaitement noté. Concernant l'architecture du site, quelles sont les sections ou pages prioritaires nécessaires au lancement ?",
        timestamp: new Date(Date.now() - 3600000 * 4.6).toISOString()
      },
      {
        id: "msg-4",
        sender: "user",
        message: "Une page d'accueil immersive avec vidéo d'atelier, une page collection avec filtres simples, une page histoire et un formulaire de prise de rendez-vous en salon privé.",
        timestamp: new Date(Date.now() - 3600000 * 4.3).toISOString()
      },
      {
        id: "msg-5",
        sender: "agent",
        message: "Excellent. Avez-vous déjà vos visuels haute définition et textes rédigés, ou souhaitez-vous un accompagnement sur la mise en page éditoriale ?",
        timestamp: new Date(Date.now() - 3600000 * 4.1).toISOString()
      },
      {
        id: "msg-6",
        sender: "user",
        message: "Les photos d'atelier et les fiches descriptives sont prêtes dans un Drive partagé.",
        timestamp: new Date(Date.now() - 3600000 * 3.9).toISOString()
      }
    ],
    questionsAskedCount: 4,
    isBriefComplete: true,
    compatibilityReport: {
      status: "compatible",
      score: 95,
      verdictTitle: "100% Compatible avec le forfait Business Fonctionnel",
      verdictText: "Le périmètre décrit (vitrine de luxe, catalogue d'artisanat, formulaire de prise de RDV privé et mise en page responsive) correspond parfaitement aux prestations du forfait Business Fonctionnel à 600 €.",
      recommendations: [
        "Intégration d'un sélecteur de créneaux Calendly ou formulaire sur mesure inclus.",
        "Optimisation des photographies haute résolution pour garantir un score Web Vitals supérieur à 95.",
        "Hébergement ultra-rapide recommandé : Vercel / Cloudflare Pages."
      ],
      completedAt: new Date(Date.now() - 3600000 * 3.8).toISOString()
    },
    deliverable: {
      type: "website",
      url: "https://maison-velora.digitalverse.app",
      title: "Maison Vélora — Boutique & Salon Privé",
      deliveredAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      notes: "Site déployé en production. Accès administrateur et guide de mise à jour transmis par email."
    }
  },
  {
    id: "DV-8840",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    client: {
      firstName: "Claire",
      lastName: "Vasseur",
      email: "c.vasseur@nexora-tech.io",
      phone: "+33 7 88 99 00 11"
    },
    projectType: "agent_ai",
    planId: "agent-automation",
    planName: "Automatisations Personnalisées (100 €/mois)",
    deadline: "Moins d'une semaine (urgent)",
    initialNotes: "Automatisation de la qualification de leads B2B entrants depuis notre formulaire web vers Notion et Slack avec enrichissement d'entreprise.",
    status: "En production",
    chatHistory: [
      {
        id: "msg-10",
        sender: "agent",
        message: "Bonjour Claire ! Vous avez choisi notre offre Automatisations Personnalisées (100 €/mois). Quels sont les outils exacts que vous souhaitez interconnecter pour votre workflow ?",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: "msg-11",
        sender: "user",
        message: "Notre site reçoit des demandes via Tally. On veut que chaque lead soit analysé par IA, classé par taille d'entreprise dans Notion, et qu'une alerte personnalisée parte dans le canal Slack #leads.",
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString()
      },
      {
        id: "msg-12",
        sender: "agent",
        message: "Très clair. Quel volume moyen de leads recevez-vous par mois, et avez-vous déjà les clés API de vos outils Notion et Slack ?",
        timestamp: new Date(Date.now() - 3600000 * 1.6).toISOString()
      },
      {
        id: "msg-13",
        sender: "user",
        message: "Environ 150 à 300 leads par mois. Oui les accès API sont configurés côté admin.",
        timestamp: new Date(Date.now() - 3600000 * 1.4).toISOString()
      }
    ],
    questionsAskedCount: 3,
    isBriefComplete: true,
    compatibilityReport: {
      status: "compatible",
      score: 98,
      verdictTitle: "100% Compatible avec le forfait Automatisations (100 €/mois)",
      verdictText: "Le flux Tally -> n8n / IA -> Notion -> Slack correspond exactement au périmètre de notre offre d'automatisation sur mesure.",
      recommendations: [
        "Mise en place d'un scénario n8n hébergé et monitoré 24/7.",
        "Gestion automatique des erreurs avec notification d'alerte en cas de clé expirée.",
        "Audit mensuel de délivrabilité inclus."
      ],
      completedAt: new Date(Date.now() - 3600000 * 1.3).toISOString()
    },
    deliverable: null
  }
];

const initialRegistry = [
  {
    id: "REG-01",
    orderId: "DV-9102",
    clientName: "Alexandre de Montmirail",
    projectName: "Maison Vélora — Haute Maroquinerie",
    planName: "Business Fonctionnel (600 €)",
    deliverableType: "Site Web",
    deliverableUrl: "https://maison-velora.digitalverse.app",
    deliveredAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "Actif en production",
    notes: "Site déployé avec SSL, DNS OVH configuré et temps de chargement 0.6s."
  },
  {
    id: "REG-02",
    orderId: "DV-7721",
    clientName: "Sophie Martin",
    projectName: "Pulse — Assistant IA Conseiller",
    planName: "Chatbot IA Entreprise (40 €/mois)",
    deliverableType: "Agent IA & Widget",
    deliverableUrl: "https://agent.digitalverse.app/pulse-advisor",
    deliveredAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: "Actif en production",
    notes: "Script widget JS intégré dans le header client. 1400 conversations traitées."
  }
];

// Helper functions for reading/writing JSON files.
// A read never rewrites the file, and unreadable data is never silently replaced by
// the defaults: the previous behaviour turned one truncated write into permanent data
// loss, because the catch returned the seed value and the next write persisted it.
class StorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StorageError';
    this.statusCode = 503;
  }
}

function readJson(filePath, defaultValue) {
  if (!fs.existsSync(filePath)) {
    if (defaultValue === undefined) {
      throw new StorageError(`Fichier de données absent : ${path.basename(filePath)}`);
    }
    return structuredClone(defaultValue);
  }
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    throw new StorageError(`Lecture impossible (${path.basename(filePath)}).`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Corrupt JSON in ${filePath}:`, err.message);
    throw new StorageError(`Données illisibles dans ${path.basename(filePath)} : laissez-les en place et réparez le fichier.`);
  }
}

// Atomic: write beside the target then rename, so a crash mid-write cannot truncate
// the live file. mode 0o600 because these files hold client PII and API keys.
function writeJson(filePath, data) {
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), { encoding: 'utf-8', mode: 0o600 });
    fs.renameSync(tmpPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    try {
      fs.rmSync(tmpPath, { force: true });
    } catch {
      /* the temp file may not exist; nothing to clean */
    }
    return false;
  }
}

// Run a route handler (sync or async) so that a throw always reaches the error
// middleware instead of escaping as an unhandled rejection.
const route = handler => (req, res, next) => {
  try {
    const out = handler(req, res, next);
    if (out && typeof out.catch === 'function') out.catch(next);
  } catch (err) {
    next(err);
  }
};

// In-memory throttling, keyed per client IP. Bounded: the old Maps grew forever, and
// every entry was a free memory leak for anyone willing to rotate source IPs.
function createThrottle({ windowMs, max }) {
  const hits = new Map();
  const MAX_TRACKED = 4096;
  const sweep = now => {
    if (hits.size <= MAX_TRACKED) return;
    for (const [key, entry] of hits) if (entry.until <= now) hits.delete(key);
  };
  const bump = req => {
    const now = Date.now();
    sweep(now);
    const key = req.ip || 'unknown';
    const entry = hits.get(key) || { count: 0, until: now + windowMs };
    entry.count += 1;
    hits.set(key, entry);
  };
  return {
    isLimited: req => {
      const entry = hits.get(req.ip || 'unknown');
      return !!entry && entry.count >= max && entry.until > Date.now();
    },
    bump,
    reset: req => hits.delete(req.ip || 'unknown'),
    size: () => hits.size,
  };
}

const contactThrottle = createThrottle({ windowMs: 10 * 60 * 1000, max: 5 });
const authThrottle = createThrottle({ windowMs: 15 * 60 * 1000, max: 10 });
const orderThrottle = createThrottle({ windowMs: 10 * 60 * 1000, max: 10 });

// Validation helpers — every public write goes through them, so a bad type can no
// longer reach `.trim()` and turn into a 500 with a stack trace.
const isPlainObject = value => typeof value === 'object' && value !== null && !Array.isArray(value);
const asText = (value, max = 254) => (typeof value === 'string' ? value.trim().slice(0, max) : undefined);
const isHttpUrl = value => {
  if (typeof value !== 'string') return false;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
const badRequest = (res, error) => res.status(400).json({ success: false, error });

// Clients do not need to see each other's private brief tokens, and the admin does
// not need them at all.
const redactOrder = order => {
  if (!isPlainObject(order)) return order;
  const rest = { ...order };
  delete rest.clientToken;
  return rest;
};

const tokenMatches = (provided, expected) => {
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(expected));
  return a.length === b.length && timingSafeEqual(a, b);
};

function findOrder(id) {
  const stored = readJson(ORDERS_FILE, initialOrders);
  const orders = Array.isArray(stored) ? stored : [];
  return { orders, order: orders.find(item => item && item.id === id) || null };
}

// Orders are a single JSON array rewritten in full, so every mutation must be
// serialised: without this queue, two clients briefing at the same time (or an admin
// PATCH landing during a 30s provider call) silently dropped each other's messages.
// The mutator receives a freshly read list; returning `false` skips the write.
let ordersQueue = Promise.resolve();
async function withOrders(mutator) {
  const run = async () => {
    const stored = readJson(ORDERS_FILE, initialOrders);
    const orders = Array.isArray(stored) ? stored : [];
    const result = await mutator(orders);
    if (result === false) return false;
    if (!writeJson(ORDERS_FILE, orders)) {
      throw Object.assign(new Error('Enregistrement des commandes impossible.'), { statusCode: 500 });
    }
    return result;
  };
  const next = ordersQueue.then(run, run);
  ordersQueue = next.then(() => undefined, () => undefined);
  return next;
}

// Initialize files if not existing.
// The two demo orders and the demo registry entries exist to make the interface
// reviewable; seeding them into a production data directory would hand your clients'
// admin a dashboard full of invented leads, so they only land in a non-production boot.
const SEED_DEMO = process.env.NODE_ENV !== 'production' || process.env.DV_SEED_DEMO === '1';
if (!fs.existsSync(SETTINGS_FILE)) writeJson(SETTINGS_FILE, defaultSettings);
if (!fs.existsSync(ORDERS_FILE)) writeJson(ORDERS_FILE, SEED_DEMO ? initialOrders : []);
if (!fs.existsSync(REGISTRY_FILE)) writeJson(REGISTRY_FILE, SEED_DEMO ? initialRegistry : []);

// Short-lived server-side sessions. Credentials never enter the client bundle.
const adminSessions = new Map();
const MAX_SESSIONS = 200;
const sessionId = req => (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('dv_admin='))?.slice(9);
const hasSession = req => {
  const token = sessionId(req);
  const expiry = adminSessions.get(token);
  if (expiry && expiry > Date.now()) return true;
  if (token) adminSessions.delete(token);
  return false;
};
const credentialsMatch = body => {
  const expected = Buffer.from(`${process.env.ADMIN_USER}:${process.env.ADMIN_PASSWORD}`);
  const provided = Buffer.from(body);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
};
const authFailure = res => res.status(429).json({ success: false, error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
const adminDisabled = res => res.status(503).json({ success: false, error: 'Administration désactivée : configurez ADMIN_USER et ADMIN_PASSWORD.' });

app.post('/api/auth/login', route((req, res) => {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'Administration non configurée. Définissez ADMIN_USER et ADMIN_PASSWORD sur le serveur, puis redémarrez-le.' });
  if (authThrottle.isLimited(req)) return authFailure(res);
  const body = isPlainObject(req.body) ? req.body : {};
  const username = asText(body.username, 200) ?? '';
  const password = typeof body.password === 'string' ? body.password.slice(0, 500) : '';
  if (!credentialsMatch(`${username}:${password}`)) {
    authThrottle.bump(req);
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }
  authThrottle.reset(req);
  const now = Date.now();
  for (const [key, expiry] of adminSessions) if (expiry < now) adminSessions.delete(key);
  while (adminSessions.size >= MAX_SESSIONS) adminSessions.delete(adminSessions.keys().next().value);
  const token = randomUUID();
  adminSessions.set(token, now + 8 * 3600000);
  const secure = req.secure || req.get('x-forwarded-proto') === 'https';
  res.setHeader('Set-Cookie', `dv_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure ? '; Secure' : ''}`);
  res.json({ success: true });
}));
app.post('/api/auth/logout', route((req, res) => {
  adminSessions.delete(sessionId(req));
  res.setHeader('Set-Cookie', 'dv_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ success: true });
}));
app.get('/api/auth/session', route((req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ authenticated: hasSession(req) }); }));

// Administration is locked unless credentials are explicitly configured.
function adminGuard(req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  if (hasSession(req)) return next();
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) return adminDisabled(res);
  // Basic auth used to bypass the login throttle entirely, which made the admin
  // password brute-forceable one request at a time with no lockout. Only requests
  // carrying an actual credential count as failures, so anonymous probes cannot lock
  // the real admin out of their own back office.
  const header = req.headers.authorization || '';
  if (!/^Basic /.test(header)) return res.status(401).json({ success: false, error: 'Authentification requise.' });
  if (authThrottle.isLimited(req)) return authFailure(res);
  if (!credentialsMatch(Buffer.from(header.slice(6), 'base64').toString('utf8'))) {
    authThrottle.bump(req);
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }
  authThrottle.reset(req);
  next();
}
app.use(route((req, res, next) => {
  const administrative = req.path.startsWith('/api/settings') || req.path.startsWith('/api/registry') || req.path === '/api/events' || (req.path.startsWith('/api/orders') && ['GET', 'PATCH'].includes(req.method)) || req.path === '/api/contacts';
  if (administrative) return adminGuard(req, res, next);
  next();
}));
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
app.get('/api/contacts', route((req, res) => {
  const stored = readJson(CONTACTS_FILE, []);
  res.json({ success: true, contacts: Array.isArray(stored) ? stored : [] });
}));

// --- SSE Setup for real-time live events ---
let sseClients = [];
const SSE_MAX_CLIENTS = Number.parseInt(process.env.SSE_MAX_CLIENTS ?? '32', 10);
const SSE_HEARTBEAT_MS = 25000;

// A client that vanished mid-flight used to make `.write()` throw inside the order
// handlers: the admin got a 500 for an update that had already been saved, and every
// remaining subscriber lost the event.
function sendSseEvent(eventType, data) {
  let payload;
  try {
    payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  } catch (err) {
    console.error(`Cannot serialise SSE event ${eventType}:`, err.message);
    return;
  }
  sseClients = sseClients.filter(client => {
    try {
      client.res.write(payload);
      return true;
    } catch {
      return false;
    }
  });
}

app.get('/api/events', route((req, res) => {
  if (sseClients.length >= SSE_MAX_CLIENTS) {
    return res.status(503).json({ success: false, error: 'Trop de flux temps réel ouverts. Fermez un onglet d’administration.' });
  }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = `${Date.now()}-${randomUUID()}`;
  sseClients.push({ id: clientId, res });
  // Without a periodic comment, proxies silently drop an idle stream and the "live"
  // dashboard stops being live with no visible error.
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, SSE_HEARTBEAT_MS);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
}));

// --- API ROUTES ---

// Persist contact requests before acknowledging receipt.
app.post('/api/contact', route((req, res) => {
  const body = isPlainObject(req.body) ? req.body : {};
  const fields = ['name', 'email', 'message', 'company', 'projectType', 'budget'];
  if (fields.some(key => body[key] !== undefined && typeof body[key] !== 'string')) {
    return badRequest(res, 'Format de formulaire invalide.');
  }
  const { name = '', email = '', message = '', consent } = body;
  if (!name.trim() || name.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !message.trim() || message.length > 10000 || consent !== true) {
    return badRequest(res, 'Vérifiez votre nom, votre email, votre message et votre consentement.');
  }
  if (contactThrottle.isLimited(req)) {
    return res.status(429).json({ success: false, error: 'Trop de demandes. Réessayez dans quelques minutes.' });
  }
  contactThrottle.bump(req);
  try {
    const stored = readJson(CONTACTS_FILE, []);
    const contacts = Array.isArray(stored) ? stored : [];
    const request = { id: randomUUID(), createdAt: new Date().toISOString(), consent: true };
    for (const field of fields) request[field] = asText(body[field], field === 'message' ? 10000 : 254) ?? '';
    contacts.unshift(request);
    if (!writeJson(CONTACTS_FILE, contacts)) throw new Error('write failed');
    return res.status(201).json({ success: true, id: request.id });
  } catch (err) {
    console.error('Contact persistence failed:', err.message);
    return res.status(500).json({ success: false, error: 'Votre demande n’a pas pu être enregistrée. Veuillez réessayer.' });
  }
}));

// 1. GET /api/orders - List all orders
app.get('/api/orders', route((req, res) => {
  const orders = readJson(ORDERS_FILE, initialOrders);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, count: orders.length, orders: orders.map(redactOrder) });
}));

// 2. GET /api/orders/:id - Get single order
app.get('/api/orders/:id', route((req, res) => {
  const orders = readJson(ORDERS_FILE, initialOrders);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: "Commande introuvable" });
  }
  res.json({ success: true, order: redactOrder(order) });
}));

// 3. POST /api/orders - Create new order
// Public write: it needs both a size cap and a rate limit, otherwise a script could
// fill orders.json (which is rewritten in full on every chat message) at no cost.
app.post('/api/orders', route((req, res) => {
  const body = isPlainObject(req.body) ? req.body : {};
  const { client } = body;
  if (orderThrottle.isLimited(req)) {
    return res.status(429).json({ success: false, error: 'Trop de demandes simultanées. Réessayez dans quelques minutes.' });
  }

  if (!isPlainObject(client)
    || ['firstName', 'lastName', 'email'].some(key => typeof client[key] !== 'string' || !client[key].trim())
    || (client.phone !== undefined && typeof client.phone !== 'string')
    || (body.initialNotes !== undefined && typeof body.initialNotes !== 'string')
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email.trim())
    || ['planId', 'planName', 'deadline'].some(key => body[key] !== undefined && typeof body[key] !== 'string')) {
    return badRequest(res, "Coordonnées incomplètes (prénom, nom et email valide obligatoires)");
  }

  const firstName = asText(client.firstName, 120);
  const planName = asText(body.planName, 200) || "Vitrine Starter (300 €)";
  const projectType = asText(body.projectType, 24) === 'agent_ai' ? 'agent_ai' : 'site';
  const newId = `DV-${randomUUID()}`;

  const openingMessage = projectType === 'agent_ai'
    ? `Bonjour ${firstName} ! Bienvenue chez DigitalVerse. Je suis Nova, votre architecte en intelligence artificielle et automatisation. Vous avez sélectionné le forfait "${planName}". Pour initier notre cadrage technique, pouvez-vous me décrire brièvement le rôle principal que vous souhaitez confier à votre agent ou à vos automatisations ?`
    : `Bonjour ${firstName} ! Bienvenue chez DigitalVerse. Je suis Nova, votre architecte digital dédié. Vous avez sélectionné le forfait "${planName}". Pour concevoir la solution idéale, pouvez-vous me décrire en quelques mots l'activité de votre entreprise et l'objectif numéro un de votre futur site web ?`;

  const newOrder = {
    id: newId,
    clientToken: randomUUID(),
    createdAt: new Date().toISOString(),
    client: {
      firstName,
      lastName: asText(client.lastName, 120),
      email: asText(client.email, 254),
      phone: asText(client.phone, 60) || "Non renseigné"
    },
    projectType,
    planId: asText(body.planId, 80) || "vitrine-starter",
    planName,
    deadline: asText(body.deadline, 120) || "Standard (2 à 3 semaines)",
    initialNotes: asText(body.initialNotes, 4000) ?? "",
    status: "Nouveau — En cours de cadrage IA",
    chatHistory: [
      {
        id: `msg-${Date.now()}-1`,
        sender: "agent",
        message: openingMessage,
        timestamp: new Date().toISOString()
      }
    ],
    questionsAskedCount: 1,
    isBriefComplete: false,
    compatibilityReport: null,
    deliverable: null
  };

  const orders = readJson(ORDERS_FILE, initialOrders);
  if (!Array.isArray(orders)) throw new StorageError('orders.json ne contient pas une liste.');
  orders.unshift(newOrder);
  if (!writeJson(ORDERS_FILE, orders)) {
    return res.status(500).json({ success: false, error: "La commande n’a pas pu être enregistrée. Réessayez." });
  }
  orderThrottle.bump(req);

  // Never broadcast the private brief token to every open admin tab.
  sendSseEvent('new_order', redactOrder(newOrder));

  res.status(201).json({ success: true, order: newOrder });
}));

// 4. POST /api/orders/:id/chat — the client brief has its own access path, separate
// from administrative credentials.
app.use('/api/orders/:id', route((req, res, next) => {
  if (req.method !== 'POST' || !['/chat', '/finalize'].includes(req.path)) return next();
  const { order } = findOrder(req.params.id);
  const token = req.get('X-Order-Token') || '';
  if (!order || !order.clientToken || !token || !tokenMatches(token, order.clientToken)) {
    return res.status(403).json({ success: false, error: 'Accès au brief non autorisé. Contactez notre équipe pour reprendre une ancienne demande.' });
  }
  next();
}));

// 4b. Conversation helpers
// One HTTP helper for every outbound provider call: the three duplicated fetch blocks
// each had their own half-handling of errors, and none of them checked the URL host.
async function requestJson(url, { headers = {}, body, timeoutMs = 30000 }) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    return { ok: false, status: 0, data: null, text: '', error: err.message };
  }
  const text = await response.text().catch(() => '');
  if (!response.ok) return { ok: false, status: response.status, data: null, text: text.slice(0, 200) };
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { ok: true, status: response.status, data, text };
}

// The webhook/endpoint base URL is stored as free text by the admin UI and then
// fetched from the server, so it used to be a plain SSRF into the internal network.
// Literal private hosts are refused unless ALLOW_PRIVATE_WEBHOOKS=1 (self-hosted n8n
// on a LAN). Note this only covers literal names: a public hostname resolving to a
// private IP still needs the network layer to be locked down.
const PRIVATE_HOST = /^(localhost$|.*\.localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.|0\.0\.0\.0$|100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:|\[?fe80:)/i;
function resolveOutboundUrl(rawUrl, suffix = '') {
  const base = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!base) return null;
  let url;
  try {
    url = new URL(base.endsWith('/') || suffix === '' ? `${base}${suffix}` : `${base}/${suffix}`);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (process.env.ALLOW_PRIVATE_WEBHOOKS !== '1' && PRIVATE_HOST.test(url.hostname)) {
    console.warn(`Refused outbound call to a private host: ${url.hostname}`);
    return null;
  }
  return url.href;
}

function buildN8nTarget(settings) {
  const base = typeof settings.n8nWebhookUrl === 'string' ? settings.n8nWebhookUrl.trim() : '';
  if (!base) return null;
  if (base.includes('/webhook')) return resolveOutboundUrl(base);
  const mode = settings.n8nMode === 'webhook-test' ? 'webhook-test' : 'webhook';
  const hookId = typeof settings.n8nWebhookId === 'string' ? settings.n8nWebhookId.trim() : '';
  return resolveOutboundUrl(base.replace(/\/+$/, ''), `${mode}/${encodeURIComponent(hookId)}/chat`);
}

const extractN8nReply = data => {
  if (typeof data === 'string') return data;
  if (!data || typeof data !== 'object') return '';
  if (data.output) return String(data.output);
  if (data.text) return String(data.text);
  if (Array.isArray(data) && data[0]?.output) return String(data[0].output);
  if (data.data) return typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
  return '';
};

async function callChatCompletion({ endpoint, apiKey, model, systemPrompt, history }) {
  const url = resolveOutboundUrl(endpoint.replace(/\/+$/, ''), 'chat/completions');
  if (!url) return '';
  const out = await requestJson(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.sender === 'agent' ? 'assistant' : 'user', content: m.message })),
      ],
      temperature: 0.7,
      max_tokens: 350,
    },
  });
  if (!out.ok) {
    console.warn(`LLM call failed (${out.status || out.error}), fallback to native engine.`);
    return '';
  }
  return out.data?.choices?.[0]?.message?.content || '';
}

app.post('/api/orders/:id/chat', route(async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message || message.length > 10000) {
    return badRequest(res, 'Message vide ou trop long (10 000 caractères maximum).');
  }

  const snapshot = findOrder(req.params.id);
  if (!snapshot.order) return res.status(404).json({ success: false, error: 'Commande introuvable' });
  const order = snapshot.order;
  const historyBefore = Array.isArray(order.chatHistory) ? order.chatHistory : [];

  const userMsg = {
    id: `msg-${Date.now()}-${randomUUID().slice(0, 8)}-u`,
    sender: 'user',
    message,
    timestamp: new Date().toISOString(),
  };
  // The new message is counted exactly like before (history + this one), but the
  // on-disk object is no longer mutated in place while the provider call is pending.
  const history = [...historyBefore, userMsg];
  const userResponsesCount = history.filter(m => m.sender === 'user').length;

  // Brief already complete: no provider call, just acknowledge through the queue.
  if (order.isBriefComplete) {
    const endMsg = {
      id: `msg-${Date.now()}-${randomUUID().slice(0, 8)}-a`,
      sender: 'agent',
      message: 'Votre cadrage est déjà complet et transmis à nos équipes de développement. Vous pouvez suivre l\'avancement depuis votre tableau de bord ou contacter notre équipe directement.',
      timestamp: new Date().toISOString(),
    };
    const updated = await withOrders(orders => {
      const target = orders.find(o => o.id === req.params.id);
      if (!target) return false;
      if (!Array.isArray(target.chatHistory)) target.chatHistory = [];
      target.chatHistory.push(userMsg, endMsg);
      return target;
    });
    if (!updated) return res.status(404).json({ success: false, error: 'Commande introuvable' });
    sendSseEvent('order_updated', redactOrder(updated));
    return res.json({ success: true, order: updated, agentReply: endMsg });
  }

  const settings = readJson(SETTINGS_FILE, defaultSettings);
  let agentReplyText = '';

  // --- 1. n8n webhook, if configured ---
  const n8nTarget = settings.provider === 'n8n' ? buildN8nTarget(settings) : null;
  if (n8nTarget) {
    const out = await requestJson(n8nTarget, {
      body: {
        action: 'sendMessage',
        chatInput: message,
        sessionId: order.id,
        orderInfo: {
          id: order.id,
          clientName: `${order.client?.firstName ?? ''} ${order.client?.lastName ?? ''}`.trim(),
          email: order.client?.email ?? '',
          phone: order.client?.phone ?? '',
          planName: order.planName,
          projectType: order.projectType,
          deadline: order.deadline,
          questionsCount: userResponsesCount,
        },
      },
    });
    if (out.ok) {
      agentReplyText = extractN8nReply(out.data ?? out.text);
    } else {
      console.warn(out.status
        ? `n8n Webhook a répondu HTTP ${out.status}, repli sur le moteur natif.`
        : `n8n Webhook injoignable (${out.error}), repli sur le moteur natif.`);
    }
  }

  // --- 2. Groq, then 3. any OpenAI-compatible endpoint ---
  const contextBlock = `\n\nContexte :\nClient : ${order.client?.firstName ?? ''} ${order.client?.lastName ?? ''}\nForfait choisi : ${order.planName}\nÉchéance : ${order.deadline}\nQuestions posées : ${userResponsesCount}/4.\nSi ${userResponsesCount} >= 4, conclus chaleureusement et annonce la génération de l'audit de compatibilité.`;
  const groqKey = typeof settings.groqApiKey === 'string' ? settings.groqApiKey.trim() : '';
  if (!agentReplyText && (settings.provider === 'groq' || groqKey) && groqKey.length > 5) {
    agentReplyText = await callChatCompletion({
      endpoint: 'https://api.groq.com/openai/v1',
      apiKey: groqKey,
      model: asText(settings.groqModel, 120) || 'llama-3.3-70b-versatile',
      systemPrompt: `${settings.systemPrompt}${contextBlock}`,
      history,
    });
  }
  const openaiKey = typeof settings.apiKey === 'string' ? settings.apiKey.trim() : '';
  if (!agentReplyText && openaiKey.length > 5) {
    agentReplyText = await callChatCompletion({
      endpoint: asText(settings.customEndpoint, 500) || 'https://api.openai.com/v1',
      apiKey: openaiKey,
      model: asText(settings.model, 120) || 'gpt-4o-mini',
      systemPrompt: `${settings.systemPrompt}${contextBlock}`,
      history,
    });
  }

  // --- 4. Built-in conversational engine, so the brief never stalls without a key ---
  if (!agentReplyText) agentReplyText = generateSmartAgentReply(order, userResponsesCount, message);

  const agentMsg = {
    id: `msg-${Date.now()}-${randomUUID().slice(0, 8)}-a`,
    sender: 'agent',
    message: String(agentReplyText).slice(0, 8000),
    timestamp: new Date().toISOString(),
  };
  const shouldFinalize = userResponsesCount >= 4;

  // The write happens after the slow provider call, inside the queue, on a freshly
  // read copy: two clients briefing at the same time used to overwrite each other.
  const updated = await withOrders(orders => {
    const target = orders.find(o => o.id === req.params.id);
    if (!target) return false;
    if (!Array.isArray(target.chatHistory)) target.chatHistory = [];
    target.chatHistory.push(userMsg, agentMsg);
    target.questionsAskedCount = (target.questionsAskedCount || 1) + 1;
    if (shouldFinalize && !target.isBriefComplete) {
      target.isBriefComplete = true;
      target.status = 'Brief finalisé — En analyse';
      target.compatibilityReport = generateCompatibilityAudit(target);
    }
    return target;
  });
  if (!updated) return res.status(404).json({ success: false, error: 'Commande introuvable' });

  sendSseEvent('order_updated', redactOrder(updated));

  // The client keeps its own token from the response, so the order is returned as is;
  // only the broadcast to other tabs is redacted.
  res.json({
    success: true,
    order: updated,
    agentReply: agentMsg,
    isComplete: updated.isBriefComplete,
    compatibilityReport: updated.compatibilityReport,
  });
}));

// Helper for Smart Conversational Agent
function generateSmartAgentReply(order, count, userText) {
  const isAgent = order.projectType === 'agent_ai';

  if (isAgent) {
    if (count === 1) {
      return `C'est très clair. Quels sont les canaux ou outils clés avec lesquels votre agent ou vos automatisations doivent dialoguer (par exemple : widget web sur votre site, WhatsApp, formulaire, Notion, Slack, ou un CRM comme HubSpot) ?`;
    } else if (count === 2) {
      return `Parfait. Avez-vous déjà de la documentation existante (FAQ, fiches produits, grille tarifaire, procédures internes) sur laquelle entraîner l'IA, et quel volume approximatif de requêtes ou de leads estimez-vous par mois ?`;
    } else if (count === 3) {
      return `Dernière précision stratégique : quel ton souhaitez-vous que l'agent adopte avec vos interlocuteurs (chaleureux et expert, ultra-concis et direct, ou corporate premium), et avez-vous des règles strictes sur ce qu'il ne doit jamais aborder ?`;
    } else {
      return `Merci infiniment ${order.client.firstName} ! J'ai réuni l'ensemble des informations indispensables pour nos ingénieurs IA. Je procède immédiatement à l'audit de compatibilité avec votre forfait ${order.planName}...`;
    }
  } else {
    // Website project
    if (count === 1) {
      return `Très bien noté. Pour structurer la navigation, quelles sont les sections ou pages indispensables que vos visiteurs doivent absolument trouver (ex : page d'accueil avec présentation de l'offre, galerie de réalisations, page tarifs, formulaire de devis ou prise de rendez-vous) ?`;
    } else if (count === 2) {
      return `Entendu. Concernant l'univers visuel et la direction artistique, avez-vous déjà une charte graphique (logo, typographies, couleurs) ou des sites de référence dont l'esthétique vous inspire particulièrement ?`;
    } else if (count === 3) {
      return `Dernière question pour cadrer le projet : disposez-vous déjà de vos contenus textuels et photographies en haute définition, ou aurez-vous besoin que l'équipe DigitalVerse vous accompagne sur la rédaction et la sélection d'assets visuels ?`;
    } else {
      return `Excellent ! Merci beaucoup ${order.client.firstName}. J'ai maintenant une vision limpide et détaillée de votre futur site web. Je transmets l'ensemble du cahier des charges à l'équipe de production et je génère l'audit de faisabilité et compatibilité...`;
    }
  }
}

// Helper to calculate realistic, intelligent compatibility audit
function generateCompatibilityAudit(order) {
  const history = Array.isArray(order.chatHistory) ? order.chatHistory : [];
  const fullText = history.filter(m => m.sender === 'user').map(m => m.message ?? '').join(' ').toLowerCase();
  const plan = order.planId;
  const isAgent = order.projectType === 'agent_ai';

  let status = "compatible";
  let score = 98;
  let verdictTitle = `Préqualification indicative — forfait ${order.planName}`;
  let verdictText = "";
  const recommendations = [];

  if (isAgent) {
    if (plan === 'agent-chatbot') {
      verdictText = `Votre projet d'agent conversationnel correspond parfaitement au forfait Chatbot IA Entreprise (40 €/mois). Nous allons configurer votre widget, ingérer vos données et calibrer les réponses selon vos consignes.`;
      recommendations.push("Intégration d'un script widget JS ultra-léger sans impact sur la vitesse de votre site.");
      recommendations.push("Paramétrage de la relance intelligente des coordonnées pour maximiser vos leads.");
      recommendations.push("Mises à jour mensuelles incluses de la base de connaissances.");
    } else {
      verdictText = `Votre demande de flux d'automatisation sur mesure s'inscrit pleinement dans notre offre Automatisations Personnalisées (100 €/mois).`;
      recommendations.push("Création de scénarios fiables avec reprise sur erreur automatique.");
      recommendations.push("Connexion sécurisée via Webhooks et tokens chiffrés.");
      recommendations.push("Dashboard de suivi et monitoring régulier.");
    }
  } else {
    // Check for complex feature requests that exceed Starter
    const wantsEcommerce = fullText.includes('boutique') || fullText.includes('paiement') || fullText.includes('panier') || fullText.includes('stripe') || fullText.includes('produits à vendre');
    const wantsPortal = fullText.includes('espace client') || fullText.includes('connexion membre') || fullText.includes('compte utilisateur');
    const wantsAiModule = fullText.includes('chatbot') || fullText.includes('intelligence artificielle');

    if (plan === 'vitrine-starter') {
      if (wantsEcommerce || wantsPortal || wantsAiModule) {
        status = "warning";
        score = 75;
        verdictTitle = "⚠️ Ajustement de périmètre recommandé";
        verdictText = "Votre projet mentionne des fonctionnalités avancées (commerce, module dynamique ou espace privé) qui dépassent le cadre du forfait Vitrine Starter (300 €).";
        recommendations.push("Recommandation : Évolution vers notre forfait 'Business Fonctionnel' (600 €) pour intégrer ces briques sereinement.");
        recommendations.push("Alternative : Conserver un site vitrine épuré dans le cadre Starter avec formulaire de contact optimisé.");
        recommendations.push("Un conseiller DigitalVerse prendra contact avec vous pour ajuster le périmètre sans surcoût imprévu.");
      } else {
        verdictText = "Votre besoin correspond idéalement au forfait Vitrine Starter (300 €) : site vitrine responsive, rapide, élégant avec formulaire de contact fonctionnel.";
        recommendations.push("Design sur-mesure validé avant développement.");
        recommendations.push("Optimisation SEO technique de premier plan incluse.");
        recommendations.push("Mise en ligne sur votre hébergement avec certificat SSL.");
      }
    } else {
      // Business Fonctionnel or Care
      verdictText = `Votre vision s'aligne rigoureusement avec le forfait ${order.planName}. Nous disposons de toutes les briques pour créer une expérience complète et performante.`;
      recommendations.push("Architecture sur-mesure validée sous 5 jours ouvrés.");
      recommendations.push("Intégration des formulaires et modules dynamiques convenus.");
      recommendations.push("Accompagnement dédié jusqu'à la mise en ligne finale.");
    }
  }

  return {
    status,
    score,
    verdictTitle,
    verdictText,
    recommendations,
    completedAt: new Date().toISOString()
  };
}

// 5. POST /api/orders/:id/finalize - Manual or forced finalization
app.post('/api/orders/:id/finalize', route(async (req, res) => {
  const updated = await withOrders(orders => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return false;
    order.isBriefComplete = true;
    order.status = 'Brief finalisé — En analyse';
    order.compatibilityReport = generateCompatibilityAudit(order);
    return order;
  });
  if (!updated) return res.status(404).json({ success: false, error: 'Commande introuvable' });

  sendSseEvent('order_updated', redactOrder(updated));
  res.json({ success: true, order: updated });
}));

// 6. PATCH /api/orders/:id - Update order status, notes, deliverable
app.patch('/api/orders/:id', route(async (req, res) => {
  const body = isPlainObject(req.body) ? req.body : {};
  const { status, adminNotes } = body;
  if ((status !== undefined && (typeof status !== 'string' || status.length > 150)) || (adminNotes !== undefined && (typeof adminNotes !== 'string' || adminNotes.length > 20000))) {
    return badRequest(res, 'Statut ou notes invalides.');
  }
  let deliverable = body.deliverable;
  if (deliverable !== undefined && deliverable !== null && !isPlainObject(deliverable)) {
    return badRequest(res, 'Livrable invalide.');
  }
  if (deliverable) {
    deliverable = {
      type: deliverable.type === 'agent_ai' ? 'agent_ai' : 'website',
      url: asText(deliverable.url, 2000) ?? '',
      title: asText(deliverable.title, 300) ?? '',
      notes: asText(deliverable.notes, 4000) ?? '',
    };
    if (deliverable.url && !isHttpUrl(deliverable.url)) {
      return badRequest(res, 'URL de livrable invalide : http(s) uniquement.');
    }
  }

  const patchRegistry = async order => {
    if (!deliverable?.url) return null;
    let registry;
    try {
      const stored = readJson(REGISTRY_FILE, initialRegistry);
      registry = Array.isArray(stored) ? stored : [];
    } catch (err) {
      console.warn('Registry unreadable, skipping the automatic entry:', err.message);
      return null;
    }
    const existingIdx = registry.findIndex(r => r.orderId === order.id);
    const regEntry = {
      id: existingIdx >= 0 ? registry[existingIdx].id : `REG-${randomUUID()}`,
      orderId: order.id,
      clientName: `${order.client?.firstName ?? ''} ${order.client?.lastName ?? ''}`.trim(),
      projectName: deliverable.title || `${order.planName} - ${order.client?.lastName ?? ''}`.trim(),
      planName: order.planName,
      deliverableType: deliverable.type === 'agent_ai' ? 'Agent IA & Automatisation' : 'Site Web',
      deliverableUrl: deliverable.url,
      deliveredAt: new Date().toISOString(),
      status: 'Actif en production',
      notes: deliverable.notes || "Livré et validé par l'équipe DigitalVerse.",
    };
    if (existingIdx >= 0) registry[existingIdx] = regEntry;
    else registry.unshift(regEntry);
    // The registry entry is best-effort: if it cannot be written, the order itself is
    // still saved and the admin is told, instead of a 500 on already-applied changes.
    if (!writeJson(REGISTRY_FILE, registry)) return 'registry';
    return registry;
  };

  let updated;
  try {
    updated = await withOrders(orders => {
      const order = orders.find(o => o.id === req.params.id);
      if (!order) return false;
      if (status !== undefined) order.status = status;
      if (adminNotes !== undefined) order.adminNotes = adminNotes;
      if (deliverable !== undefined) order.deliverable = deliverable;
      return order;
    });
  } catch (err) {
    if (err instanceof StorageError) throw err;
    return res.status(500).json({ success: false, error: 'Enregistrement impossible.' });
  }
  if (!updated) return res.status(404).json({ success: false, error: 'Commande introuvable' });

  const registry = await patchRegistry(updated);
  const failedRegistry = registry === 'registry';
  if (Array.isArray(registry)) sendSseEvent('registry_updated', registry);
  sendSseEvent('order_updated', redactOrder(updated));
  res.json({
    success: true,
    order: updated,
    ...(failedRegistry ? { warning: 'Commande enregistrée, mais le registre des livrables na pas pu être mis à jour.' } : {}),
  });
}));

// 7. GET & POST /api/registry - Ready deliverables registry
const readRegistry = () => {
  const stored = readJson(REGISTRY_FILE, initialRegistry);
  return Array.isArray(stored) ? stored : [];
};
let registryQueue = Promise.resolve();
async function withRegistry(mutator) {
  const run = async () => {
    const registry = readRegistry();
    const result = await mutator(registry);
    if (result === false) return false;
    if (!writeJson(REGISTRY_FILE, registry)) {
      throw Object.assign(new Error('Enregistrement du registre impossible.'), { statusCode: 500 });
    }
    return Array.isArray(result) ? result : registry;
  };
  const next = registryQueue.then(run, run);
  registryQueue = next.then(() => undefined, () => undefined);
  return next;
}

app.get('/api/registry', route((req, res) => {
  const registry = readRegistry();
  res.json({ success: true, count: registry.length, registry });
}));

// `deliverableUrl` reaches an <a href> in the admin UI, so the scheme is checked here
// rather than trusting the caller: a stored javascript: link is a click away from
// running in the admin's session.
const REGISTRY_FIELDS = { orderId: 120, clientName: 240, projectName: 300, planName: 240, deliverableType: 120, deliverableUrl: 2000, notes: 4000 };
app.post('/api/registry', route(async (req, res) => {
  const body = isPlainObject(req.body) ? req.body : {};
  const invalidKey = Object.keys(REGISTRY_FIELDS).find(key => body[key] !== undefined && typeof body[key] !== 'string');
  const url = asText(body.deliverableUrl, REGISTRY_FIELDS.deliverableUrl);
  if (invalidKey) return badRequest(res, `Champ ${invalidKey} invalide.`);
  if (!url || !isHttpUrl(url)) return badRequest(res, "URL livrable obligatoire (http ou https).");

  const newEntry = {
    id: `REG-${randomUUID()}`,
    deliveredAt: new Date().toISOString(),
    status: 'Actif en production',
    deliverableUrl: url,
  };
  for (const [key, max] of Object.entries(REGISTRY_FIELDS)) {
    if (key === 'deliverableUrl') continue;
    newEntry[key] = asText(body[key], max) || ({ orderId: 'DIRECT', clientName: 'Client Partenaire', projectName: 'Projet DigitalVerse', planName: 'Sur mesure', deliverableType: 'Site Web', notes: '' }[key] ?? '');
  }

  const registry = await withRegistry(list => {
    list.unshift(newEntry);
    return list;
  });
  sendSseEvent('registry_updated', registry);
  res.status(201).json({ success: true, entry: newEntry });
}));

// 8. GET & POST /api/settings - AI API Configuration
const maskKey = value => (typeof value === 'string' && value
  ? (value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : '••••••••')
  : '');
const PROVIDERS = ['n8n', 'groq', 'openai', 'anthropic', 'custom'];

app.get('/api/settings', route((req, res) => {
  const settings = readJson(SETTINGS_FILE, defaultSettings);
  const n8nUrl = asText(settings.n8nWebhookUrl, 500) ?? '';
  res.json({
    success: true,
    settings: {
      provider: PROVIDERS.includes(settings.provider) ? settings.provider : defaultSettings.provider,
      n8nWebhookUrl: n8nUrl,
      n8nWebhookId: asText(settings.n8nWebhookId, 200) ?? '',
      n8nMode: settings.n8nMode === 'webhook-test' ? 'webhook-test' : 'webhook',
      hasN8n: n8nUrl.length > 0,

      hasGroqKey: Boolean(asText(settings.groqApiKey, 400)),
      maskedGroqKey: maskKey(settings.groqApiKey),
      groqModel: asText(settings.groqModel, 120) ?? '',

      hasKey: Boolean(asText(settings.apiKey, 400)),
      maskedKey: maskKey(settings.apiKey),
      model: asText(settings.model, 120) ?? '',
      customEndpoint: asText(settings.customEndpoint, 500) ?? '',
      systemPrompt: asText(settings.systemPrompt, 8000) ?? '',
    },
  });
}));

// Field -> max length. Anything not listed here is refused, so the settings payload
// can no longer smuggle arbitrary keys into the data file.
const SETTINGS_LIMITS = {
  provider: 20,
  n8nWebhookUrl: 500,
  n8nWebhookId: 200,
  n8nMode: 20,
  groqApiKey: 400,
  groqModel: 120,
  apiKey: 400,
  model: 120,
  customEndpoint: 500,
  systemPrompt: 8000,
};
app.post('/api/settings', route((req, res) => {
  const body = isPlainObject(req.body) ? req.body : {};
  const unknown = Object.keys(body).filter(key => !(key in SETTINGS_LIMITS));
  const wrongType = Object.keys(body).filter(key => key in SETTINGS_LIMITS && body[key] !== null && typeof body[key] !== 'string');
  if (unknown.length || wrongType.length) {
    return badRequest(res, `Paramètres non reconnus ou de type inattendu : ${[...unknown, ...wrongType].slice(0, 4).join(', ')}.`);
  }
  if (body.provider !== undefined && !PROVIDERS.includes(body.provider)) {
    return badRequest(res, `Fournisseur inconnu. Valeurs acceptées : ${PROVIDERS.join(', ')}.`);
  }
  if (body.n8nWebhookUrl) {
    const probe = /^https?:\/\//i.test(body.n8nWebhookUrl.trim()) ? body.n8nWebhookUrl.trim() : `https://${body.n8nWebhookUrl.trim()}`;
    if (!resolveOutboundUrl(probe)) return badRequest(res, 'URL n8n invalide (http/https, hôte public).');
  }
  if (body.customEndpoint && !resolveOutboundUrl(body.customEndpoint.trim())) {
    return badRequest(res, 'Endpoint invalide (http/https, hôte public).');
  }

  const settings = { ...readJson(SETTINGS_FILE, defaultSettings) };
  for (const [key, max] of Object.entries(SETTINGS_LIMITS)) {
    if (body[key] === undefined) continue;
    // An empty string now really clears a stored key; it used to be ignored, which
    // made it impossible to remove a key once saved.
    settings[key] = key.endsWith('ApiKey') || key === 'apiKey'
      ? (body[key] === '' ? '' : body[key].trim())
      : asText(body[key], max) ?? '';
  }
  if (body.n8nMode !== undefined) settings.n8nMode = body.n8nMode === 'webhook-test' ? 'webhook-test' : 'webhook';

  if (!writeJson(SETTINGS_FILE, settings)) {
    return res.status(500).json({ success: false, error: 'Enregistrement des paramètres impossible.' });
  }
  res.json({ success: true, message: "Paramètres de l'Agent IA & n8n enregistrés avec succès." });
}));

// 9. GET /api/settings/n8n-workflow - Get current n8n workflow file
app.get('/api/settings/n8n-workflow', route((req, res) => {
  const workflow = readJson(N8N_WORKFLOW_FILE, {});
  res.json({ success: true, workflow });
}));

// 10. POST /api/settings/test-n8n - Test n8n Webhook connectivity
app.post('/api/settings/test-n8n', route(async (req, res) => {
  const body = isPlainObject(req.body) ? req.body : {};
  const settings = readJson(SETTINGS_FILE, defaultSettings);
  const candidate = {
    n8nWebhookUrl: asText(body.n8nWebhookUrl, 500) || asText(settings.n8nWebhookUrl, 500) || '',
    n8nWebhookId: asText(body.n8nWebhookId, 200) || asText(settings.n8nWebhookId, 200) || '',
    n8nMode: (asText(body.n8nMode, 20) || asText(settings.n8nMode, 20) || 'webhook') === 'webhook-test' ? 'webhook-test' : 'webhook',
  };
  if (!candidate.n8nWebhookUrl) {
    return badRequest(res, "Veuillez renseigner l'URL de votre instance n8n (ex: https://n8n.votre-domaine.com).");
  }
  const targetUrl = buildN8nTarget(candidate);
  if (!targetUrl) {
    return badRequest(res, "URL n8n invalide : hôte http/https public (autorisez les hôtes privés avec ALLOW_PRIVATE_WEBHOOKS=1).");
  }

  const startTime = Date.now();
  const out = await requestJson(targetUrl, {
    body: {
      action: 'sendMessage',
      chatInput: 'Ping test de connectivité DigitalVerse. Réponds en un mot : "Connecté"',
      sessionId: 'test-ping-01',
    },
  });
  const elapsed = Date.now() - startTime;

  if (!out.ok) {
    if (out.status === 0) {
      return res.status(400).json({ success: false, error: `Impossible de contacter l'instance n8n : ${out.error}` });
    }
    return res.status(400).json({
      success: false,
      error: `n8n a répondu avec le statut HTTP ${out.status}. Vérifiez que le workflow est activé dans n8n.`,
    });
  }
  const reply = (extractN8nReply(out.data ?? out.text) || 'OK').slice(0, 150);
  res.json({ success: true, message: `Webhook n8n joint avec succès en ${elapsed}ms ! Réponse de l'Agent : "${reply}"` });
}));

// 11. POST /api/settings/test - Test API Key connectivity (OpenAI / Groq)
app.post('/api/settings/test', route(async (req, res) => {
  const body = isPlainObject(req.body) ? req.body : {};
  const settings = readJson(SETTINGS_FILE, defaultSettings);
  const isGroq = body.provider === 'groq';
  const targetKey = (asText(body.apiKey, 400) || (isGroq ? asText(settings.groqApiKey, 400) : asText(settings.apiKey, 400)) || '').trim();

  if (!targetKey) {
    return badRequest(res, "Aucune clé API fournie. Le moteur de fallback heuristique DigitalVerse reste actif.");
  }

  const endpoint = isGroq
    ? 'https://api.groq.com/openai/v1'
    : (asText(body.customEndpoint, 500) || asText(settings.customEndpoint, 500) || 'https://api.openai.com/v1');
  const testUrl = resolveOutboundUrl(endpoint.replace(/\/+$/, ''), 'chat/completions');
  if (!testUrl) return badRequest(res, 'Endpoint invalide : hôte http/https public attendu.');
  const chosenModel = asText(body.model, 120) || (isGroq ? asText(settings.groqModel, 120) : asText(settings.model, 120)) || (isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

  const startTime = Date.now();
  const out = await requestJson(testUrl, {
    headers: { Authorization: `Bearer ${targetKey}` },
    body: {
      model: chosenModel,
      messages: [{ role: 'user', content: 'Ping test. Réponds en un mot : "Connecté"' }],
      max_tokens: 10,
    },
  });
  const elapsed = Date.now() - startTime;

  if (!out.ok) {
    if (out.status === 0) return res.status(400).json({ success: false, error: `Impossible de contacter le serveur distant : ${out.error}` });
    return res.status(400).json({ success: false, error: `Erreur fournisseur (${out.status}) : ${out.text.slice(0, 150)}` });
  }
  const reply = out.data?.choices?.[0]?.message?.content?.trim() || 'OK';
  res.json({ success: true, message: `API ${isGroq ? 'Groq' : 'LLM'} opérationnelle en ${elapsed}ms ! Réponse du modèle : "${reply}"` });
}));

// Unknown API route -> JSON 404, never the SPA shell.
app.use('/api', (req, res) => res.status(404).json({ success: false, error: 'Route API introuvable' }));

// Serve Vite static files if dist exists
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { maxAge: '1h', index: false }));
  app.get('*', (req, res, next) => res.sendFile(path.join(DIST_DIR, 'index.html'), err => (err ? next(err) : undefined)));
}

// Single error funnel. Before this, any unexpected throw (a non-string field reaching
// `.trim()`, a corrupt data file) was answered by Express' default HTML page leaking
// stack frames and absolute paths, and a throw inside the async chat handler escaped
// as an unhandled rejection.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  if (status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, err?.stack || err);
  if (res.headersSent) return next(err);
  // A StorageError is an operator-facing diagnosis (unreadable data file), so it is
  // safe to show; anything else stays generic so a crash cannot leak paths or frames.
  const explain = status < 500 || err instanceof StorageError;
  res.status(status).json({
    success: false,
    error: explain ? (err?.message || 'Requête invalide.') : 'Erreur interne du serveur. Les données n’ont pas été modifiées.',
    ...(explain || status < 500 ? {} : { hint: 'Consultez les journaux du serveur.' }),
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`DigitalVerse Agency Server running on http://0.0.0.0:${server.address().port}`);
});

// Finish the writes that are already queued before dying, so a restart during a burst
// of orders cannot leave a half-written file behind.
let shuttingDown = false;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} reçu : arrêt du serveur.`);
    for (const client of sseClients) {
      try { client.res.end(); } catch { /* already gone */ }
    }
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
