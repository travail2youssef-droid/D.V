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

app.use(cors());
app.use(express.json());

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

// Helper functions for reading/writing JSON files
function readJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Initialize files if not existing
if (!fs.existsSync(SETTINGS_FILE)) writeJson(SETTINGS_FILE, defaultSettings);
if (!fs.existsSync(ORDERS_FILE)) writeJson(ORDERS_FILE, initialOrders);
if (!fs.existsSync(REGISTRY_FILE)) writeJson(REGISTRY_FILE, initialRegistry);

// Short-lived server-side sessions. Credentials never enter the client bundle.
const adminSessions = new Map();
const loginAttempts = new Map();
const sessionId = req => (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('dv_admin='))?.slice(9);
const hasSession = req => {
  const token = sessionId(req);
  const expiry = adminSessions.get(token);
  if (expiry && expiry > Date.now()) return true;
  if (token) adminSessions.delete(token);
  return false;
};
app.post('/api/auth/login', (req, res) => {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'Administration non configurée. Définissez ADMIN_USER et ADMIN_PASSWORD sur le serveur, puis redémarrez-le.' });
  const now = Date.now();
  for (const [ip, entry] of loginAttempts) if (entry.until < now) loginAttempts.delete(ip);
  const attempt = loginAttempts.get(req.ip) || { count: 0, until: now + 900000 };
  if (attempt.count >= 10) return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  attempt.count++;
  loginAttempts.set(req.ip, attempt);
  const expected = Buffer.from(`${process.env.ADMIN_USER}:${process.env.ADMIN_PASSWORD}`);
  const provided = Buffer.from(`${req.body.username || ''}:${req.body.password || ''}`);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return res.status(401).json({ error: 'Identifiants incorrects.' });
  loginAttempts.delete(req.ip);
  for (const [key, expiry] of adminSessions) if (expiry < now) adminSessions.delete(key);
  const token = randomUUID();
  adminSessions.set(token, now + 8 * 3600000);
  const secure = req.secure || req.get('x-forwarded-proto') === 'https';
  res.setHeader('Set-Cookie', `dv_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure ? '; Secure' : ''}`);
  res.json({ success: true });
});
app.post('/api/auth/logout', (req, res) => {
  adminSessions.delete(sessionId(req));
  res.setHeader('Set-Cookie', 'dv_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ success: true });
});
app.get('/api/auth/session', (req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ authenticated: hasSession(req) }); });

// Administration is locked unless credentials are explicitly configured.
function adminGuard(req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  if (hasSession(req)) return next();
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ success: false, error: 'Administration désactivée : configurez ADMIN_USER et ADMIN_PASSWORD.' });
  }
  const expected = Buffer.from(`${process.env.ADMIN_USER}:${process.env.ADMIN_PASSWORD}`);
  const provided = Buffer.from((req.headers.authorization || '').replace(/^Basic /, ''), 'base64');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }
  next();
}
app.use((req, res, next) => {
  const administrative = req.path.startsWith('/api/settings') || req.path.startsWith('/api/registry') || req.path === '/api/events' || (req.path.startsWith('/api/orders') && ['GET', 'PATCH'].includes(req.method)) || req.path === '/api/contacts';
  if (administrative) return adminGuard(req, res, next);
  next();
});
app.get('/api/contacts', (req, res) => {
  const file = path.join(DATA_DIR, 'contacts.json');
  try {
    res.json({ success: true, contacts: fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [] });
  } catch {
    res.status(500).json({ success: false, error: 'Impossible de lire les demandes.' });
  }
});

// --- SSE Setup for real-time live events ---
let sseClients = [];
function sendSseEvent(eventType, data) {
  sseClients.forEach(client => {
    client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
  });
}

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// --- API ROUTES ---

// Persist contact requests before acknowledging receipt.
const contactLimits = new Map();
app.post('/api/contact', (req, res) => {
  const fields = ['name', 'email', 'message', 'company', 'projectType', 'budget'];
  if (fields.some(key => req.body[key] !== undefined && typeof req.body[key] !== 'string')) {
    return res.status(400).json({ success: false, error: 'Format de formulaire invalide.' });
  }
  const { name = '', email = '', message = '', consent } = req.body;
  if (!name.trim() || name.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !message.trim() || message.length > 10000 || consent !== true) {
    return res.status(400).json({ success: false, error: 'Vérifiez votre nom, votre email, votre message et votre consentement.' });
  }
  const now = Date.now();
  for (const [key, limit] of contactLimits) if (limit.until < now) contactLimits.delete(key);
  const key = req.ip;
  const limit = contactLimits.get(key) || { count: 0, until: now + 600000 };
  if (limit.count >= 5) return res.status(429).json({ success: false, error: 'Trop de demandes. Réessayez dans quelques minutes.' });
  limit.count += 1;
  contactLimits.set(key, limit);
  const file = path.join(DATA_DIR, 'contacts.json');
  try {
    const contacts = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    const request = { id: randomUUID(), createdAt: new Date().toISOString(), consent: true };
    for (const field of fields) request[field] = (req.body[field] || '').trim().slice(0, field === 'message' ? 10000 : 254);
    contacts.unshift(request);
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(contacts, null, 2), { mode: 0o600 });
    fs.renameSync(`${file}.tmp`, file);
    return res.status(201).json({ success: true, id: request.id });
  } catch (err) {
    console.error('Contact persistence failed:', err.message);
    return res.status(500).json({ success: false, error: 'Votre demande n’a pas pu être enregistrée. Veuillez réessayer.' });
  }
});

// 1. GET /api/orders - List all orders
app.get('/api/orders', (req, res) => {
  const orders = readJson(ORDERS_FILE, initialOrders);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, count: orders.length, orders });
});

// 2. GET /api/orders/:id - Get single order
app.get('/api/orders/:id', (req, res) => {
  const orders = readJson(ORDERS_FILE, initialOrders);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: "Commande introuvable" });
  }
  res.json({ success: true, order });
});

// 3. POST /api/orders - Create new order
app.post('/api/orders', (req, res) => {
  const { client, projectType, planId, planName, deadline, initialNotes } = req.body;

  if (!client || ['firstName', 'lastName', 'email'].some(key => typeof client[key] !== 'string' || !client[key].trim()) || (client.phone !== undefined && typeof client.phone !== 'string') || (initialNotes !== undefined && typeof initialNotes !== 'string')) {
    return res.status(400).json({ success: false, error: "Coordonnées incomplètes (prénom, nom, email obligatoires)" });
  }

  const orders = readJson(ORDERS_FILE, initialOrders);
  const newId = `DV-${randomUUID()}`;

  const openingMessage = projectType === 'agent_ai'
    ? `Bonjour ${client.firstName} ! Bienvenue chez DigitalVerse. Je suis Nova, votre architecte en intelligence artificielle et automatisation. Vous avez sélectionné le forfait "${planName}". Pour initier notre cadrage technique, pouvez-vous me décrire brièvement le rôle principal que vous souhaitez confier à votre agent ou à vos automatisations ?`
    : `Bonjour ${client.firstName} ! Bienvenue chez DigitalVerse. Je suis Nova, votre architecte digital dédié. Vous avez sélectionné le forfait "${planName}". Pour concevoir la solution idéale, pouvez-vous me décrire en quelques mots l'activité de votre entreprise et l'objectif numéro un de votre futur site web ?`;

  const newOrder = {
    id: newId,
    clientToken: randomUUID(),
    createdAt: new Date().toISOString(),
    client: {
      firstName: client.firstName.trim(),
      lastName: client.lastName.trim(),
      email: client.email.trim(),
      phone: client.phone ? client.phone.trim() : "Non renseigné"
    },
    projectType: projectType || "site",
    planId: planId || "vitrine-starter",
    planName: planName || "Vitrine Starter (300 €)",
    deadline: deadline || "Standard (2 à 3 semaines)",
    initialNotes: initialNotes ? initialNotes.trim() : "",
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

  orders.unshift(newOrder);
  writeJson(ORDERS_FILE, orders);

  sendSseEvent('new_order', newOrder);

  res.status(201).json({ success: true, order: newOrder });
});

// 4. POST /api/orders/:id/chat - Send message to AI Agent
// Client briefing access is separate from administrative credentials.
app.use('/api/orders/:id', (req, res, next) => {
  if (req.method !== 'POST' || !['/chat', '/finalize'].includes(req.path)) return next();
  const order = readJson(ORDERS_FILE, []).find(item => item.id === req.params.id);
  const token = req.get('X-Order-Token');
  if (!order || !order.clientToken || token !== order.clientToken) {
    return res.status(403).json({ success: false, error: 'Accès au brief non autorisé. Contactez notre équipe pour reprendre une ancienne demande.' });
  }
  next();
});

app.post('/api/orders/:id/chat', async (req, res) => {
  const { message } = req.body;
  if (typeof message !== 'string' || !message.trim() || message.length > 10000) {
    return res.status(400).json({ success: false, error: "Message vide" });
  }

  const orders = readJson(ORDERS_FILE, initialOrders);
  const orderIndex = orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: "Commande introuvable" });
  }

  const order = orders[orderIndex];

  // Add user message to history
  const userMsg = {
    id: `msg-${Date.now()}-u`,
    sender: "user",
    message: message.trim(),
    timestamp: new Date().toISOString()
  };
  order.chatHistory.push(userMsg);

  // If already complete
  if (order.isBriefComplete) {
    const endMsg = {
      id: `msg-${Date.now()}-a`,
      sender: "agent",
      message: "Votre cadrage est déjà complet et transmis à nos équipes de développement. Vous pouvez suivre l'avancement depuis votre tableau de bord ou contacter notre équipe directement.",
      timestamp: new Date().toISOString()
    };
    order.chatHistory.push(endMsg);
    orders[orderIndex] = order;
    writeJson(ORDERS_FILE, orders);
    return res.json({ success: true, order, agentReply: endMsg });
  }

  const userResponsesCount = order.chatHistory.filter(m => m.sender === 'user').length;
  const settings = readJson(SETTINGS_FILE, defaultSettings);

  let agentReplyText = "";
  let shouldFinalize = userResponsesCount >= 4;

  // --- 1. n8n WEBHOOK INTEGRATION (if n8n is selected or n8n URL is provided) ---
  if (settings.provider === 'n8n' && settings.n8nWebhookUrl && settings.n8nWebhookUrl.trim().length > 5) {
    try {
      let targetUrl = settings.n8nWebhookUrl.trim();
      // If user provided base domain e.g. https://my-n8n.app, construct webhook URL
      if (!targetUrl.includes('/webhook')) {
        const mode = settings.n8nMode || 'webhook';
        const hookId = settings.n8nWebhookId || 'b639adfd-6c4b-48cd-af68-fb21384fcc52';
        targetUrl = `${targetUrl.replace(/\/+$/, '')}/${mode}/${hookId}/chat`;
      }

      console.log(`Calling n8n Chat Webhook at: ${targetUrl}`);
      const n8nResp = await fetch(targetUrl, {
        method: 'POST',
      signal: AbortSignal.timeout(30000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          chatInput: message.trim(),
          sessionId: order.id,
          orderInfo: {
            id: order.id,
            clientName: `${order.client.firstName} ${order.client.lastName}`,
            email: order.client.email,
            phone: order.client.phone,
            planName: order.planName,
            projectType: order.projectType,
            deadline: order.deadline,
            questionsCount: userResponsesCount
          }
        })
      });

      if (n8nResp.ok) {
        const n8nData = await n8nResp.json();
        // Support multiple n8n response shapes
        if (typeof n8nData === 'string') {
          agentReplyText = n8nData;
        } else if (n8nData.output) {
          agentReplyText = n8nData.output;
        } else if (n8nData.text) {
          agentReplyText = n8nData.text;
        } else if (Array.isArray(n8nData) && n8nData[0]?.output) {
          agentReplyText = n8nData[0].output;
        } else if (n8nData.data) {
          agentReplyText = typeof n8nData.data === 'string' ? n8nData.data : JSON.stringify(n8nData.data);
        }
      } else {
        console.warn(`n8n Webhook returned status ${n8nResp.status}, fallback to native engine.`);
      }
    } catch (n8nErr) {
      console.warn("n8n Webhook call failed:", n8nErr.message);
    }
  }

  // --- 2. GROQ DIRECT API INTEGRATION (if groq is selected) ---
  if (!agentReplyText && (settings.provider === 'groq' || settings.groqApiKey)) {
    const groqKey = settings.groqApiKey?.trim();
    if (groqKey && groqKey.length > 5) {
      try {
        const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
      signal: AbortSignal.timeout(30000),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: settings.groqModel || 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `${settings.systemPrompt}\n\nContexte :\nClient : ${order.client.firstName} ${order.client.lastName}\nForfait choisi : ${order.planName}\nÉchéance : ${order.deadline}\nQuestions posées : ${userResponsesCount}/4.\nSi ${userResponsesCount} >= 4, conclus chaleureusement.`
              },
              ...order.chatHistory.map(m => ({
                role: m.sender === 'agent' ? 'assistant' : 'user',
                content: m.message
              }))
            ],
            temperature: 0.7,
            max_tokens: 350
          })
        });

        if (groqResp.ok) {
          const gData = await groqResp.json();
          agentReplyText = gData.choices?.[0]?.message?.content || "";
        }
      } catch (gErr) {
        console.warn("Groq direct call failed:", gErr.message);
      }
    }
  }

  // --- 3. OPENAI / CUSTOM ENDPOINT INTEGRATION ---
  if (!agentReplyText && settings.apiKey && settings.apiKey.trim().length > 5) {
    try {
      const response = await fetch(`${settings.customEndpoint || 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
      signal: AbortSignal.timeout(30000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey.trim()}`
        },
        body: JSON.stringify({
          model: settings.model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `${settings.systemPrompt}\n\nContexte actuel :\nClient : ${order.client.firstName} ${order.client.lastName}\nForfait choisi : ${order.planName}\nÉchéance : ${order.deadline}\nNombre d'échanges utilisateur : ${userResponsesCount}/4.\nSi ${userResponsesCount} >= 4, conclus le brief chaleureusement et dis que tu vas générer l'audit de compatibilité.`
            },
            ...order.chatHistory.map(m => ({
              role: m.sender === 'agent' ? 'assistant' : 'user',
              content: m.message
            }))
          ],
          temperature: 0.7,
          max_tokens: 350
        })
      });

      if (response.ok) {
        const data = await response.json();
        agentReplyText = data.choices?.[0]?.message?.content || "";
      }
    } catch (apiErr) {
      console.warn("External OpenAI call failed:", apiErr.message);
    }
  }

  // --- 4. SMART BUILT-IN CONVERSATIONAL ENGINE (Guaranteed 100% Reliable Fallback) ---
  if (!agentReplyText) {
    agentReplyText = generateSmartAgentReply(order, userResponsesCount, message);
  }

  const agentMsg = {
    id: `msg-${Date.now()}-a`,
    sender: "agent",
    message: agentReplyText,
    timestamp: new Date().toISOString()
  };
  order.chatHistory.push(agentMsg);
  order.questionsAskedCount = (order.questionsAskedCount || 1) + 1;

  // Auto-finalize brief if 4 questions reached
  if (userResponsesCount >= 4 || shouldFinalize) {
    order.isBriefComplete = true;
    order.status = "Brief finalisé — En analyse";
    order.compatibilityReport = generateCompatibilityAudit(order);
  }

  orders[orderIndex] = order;
  writeJson(ORDERS_FILE, orders);

  sendSseEvent('order_updated', order);

  res.json({
    success: true,
    order,
    agentReply: agentMsg,
    isComplete: order.isBriefComplete,
    compatibilityReport: order.compatibilityReport
  });
});

// Helper for Smart Conversational Agent
function generateSmartAgentReply(order, count, userText) {
  const isAgent = order.projectType === 'agent_ai';
  const plan = order.planId;

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
  const fullText = order.chatHistory.filter(m => m.sender === 'user').map(m => m.message).join(' ').toLowerCase();
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
app.post('/api/orders/:id/finalize', (req, res) => {
  const orders = readJson(ORDERS_FILE, initialOrders);
  const orderIndex = orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: "Commande introuvable" });
  }

  const order = orders[orderIndex];
  order.isBriefComplete = true;
  order.status = "Brief finalisé — En analyse";
  order.compatibilityReport = generateCompatibilityAudit(order);

  orders[orderIndex] = order;
  writeJson(ORDERS_FILE, orders);

  sendSseEvent('order_updated', order);
  res.json({ success: true, order });
});

// 6. PATCH /api/orders/:id - Update order status, notes, deliverable
app.patch('/api/orders/:id', (req, res) => {
  const orders = readJson(ORDERS_FILE, initialOrders);
  const orderIndex = orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: "Commande introuvable" });
  }

  const order = orders[orderIndex];
  const { status, adminNotes, deliverable } = req.body;
  if ((status !== undefined && (typeof status !== 'string' || status.length > 150)) || (adminNotes !== undefined && (typeof adminNotes !== 'string' || adminNotes.length > 20000))) {
    return res.status(400).json({ success: false, error: 'Statut ou notes invalides.' });
  }


  if (status !== undefined) order.status = status;
  if (adminNotes !== undefined) order.adminNotes = adminNotes;
  if (deliverable !== undefined) {
    order.deliverable = deliverable;
    if (deliverable && deliverable.url) {
      const registry = readJson(REGISTRY_FILE, initialRegistry);
      const existingRegIdx = registry.findIndex(r => r.orderId === order.id);
      const regEntry = {
        id: existingRegIdx >= 0 ? registry[existingRegIdx].id : `REG-${randomUUID()}`,
        orderId: order.id,
        clientName: `${order.client.firstName} ${order.client.lastName}`,
        projectName: deliverable.title || `${order.planName} - ${order.client.lastName}`,
        planName: order.planName,
        deliverableType: deliverable.type === 'agent_ai' ? 'Agent IA & Automatisation' : 'Site Web',
        deliverableUrl: deliverable.url,
        deliveredAt: new Date().toISOString(),
        status: "Actif en production",
        notes: deliverable.notes || "Livré et validé par l'équipe DigitalVerse."
      };
      if (existingRegIdx >= 0) {
        registry[existingRegIdx] = regEntry;
      } else {
        registry.unshift(regEntry);
      }
      writeJson(REGISTRY_FILE, registry);
      sendSseEvent('registry_updated', registry);
    }
  }

  orders[orderIndex] = order;
  if (!writeJson(ORDERS_FILE, orders)) return res.status(500).json({ success: false, error: 'Enregistrement impossible.' });

  sendSseEvent('order_updated', order);
  res.json({ success: true, order });
});

// 7. GET & POST /api/registry - Ready deliverables registry
app.get('/api/registry', (req, res) => {
  const registry = readJson(REGISTRY_FILE, initialRegistry);
  res.json({ success: true, count: registry.length, registry });
});

app.post('/api/registry', (req, res) => {
  const { orderId, clientName, projectName, planName, deliverableType, deliverableUrl, notes } = req.body;
  if (!deliverableUrl) {
    return res.status(400).json({ success: false, error: "L'URL livrable est obligatoire" });
  }

  const registry = readJson(REGISTRY_FILE, initialRegistry);
  const newEntry = {
    id: `REG-${randomUUID()}`,
    orderId: orderId || "DIRECT",
    clientName: clientName || "Client Partenaire",
    projectName: projectName || "Projet DigitalVerse",
    planName: planName || "Sur mesure",
    deliverableType: deliverableType || "Site Web",
    deliverableUrl: deliverableUrl.trim(),
    deliveredAt: new Date().toISOString(),
    status: "Actif en production",
    notes: notes || ""
  };

  registry.unshift(newEntry);
  writeJson(REGISTRY_FILE, registry);

  sendSseEvent('registry_updated', registry);
  res.status(201).json({ success: true, entry: newEntry });
});

// 8. GET & POST /api/settings - AI API Configuration
app.get('/api/settings', (req, res) => {
  const settings = readJson(SETTINGS_FILE, defaultSettings);
  
  const maskedKey = settings.apiKey
    ? settings.apiKey.length > 8
      ? `${settings.apiKey.slice(0, 4)}...${settings.apiKey.slice(-4)}`
      : '••••••••'
    : '';

  const maskedGroqKey = settings.groqApiKey
    ? settings.groqApiKey.length > 8
      ? `${settings.groqApiKey.slice(0, 4)}...${settings.groqApiKey.slice(-4)}`
      : '••••••••'
    : '';

  res.json({
    success: true,
    settings: {
      provider: settings.provider,
      n8nWebhookUrl: settings.n8nWebhookUrl || '',
      n8nWebhookId: settings.n8nWebhookId || 'b639adfd-6c4b-48cd-af68-fb21384fcc52',
      n8nMode: settings.n8nMode || 'webhook',
      hasN8n: Boolean(settings.n8nWebhookUrl && settings.n8nWebhookUrl.trim().length > 0),
      
      hasGroqKey: Boolean(settings.groqApiKey && settings.groqApiKey.trim().length > 0),
      maskedGroqKey,
      groqModel: settings.groqModel || 'llama-3.3-70b-versatile',

      hasKey: Boolean(settings.apiKey && settings.apiKey.trim().length > 0),
      maskedKey,
      model: settings.model,
      customEndpoint: settings.customEndpoint,
      systemPrompt: settings.systemPrompt
    }
  });
});

app.post('/api/settings', (req, res) => {
  const {
    provider,
    n8nWebhookUrl,
    n8nWebhookId,
    n8nMode,
    groqApiKey,
    groqModel,
    apiKey,
    model,
    customEndpoint,
    systemPrompt
  } = req.body;

  const settings = readJson(SETTINGS_FILE, defaultSettings);

  if (provider !== undefined) settings.provider = provider;
  if (n8nWebhookUrl !== undefined) settings.n8nWebhookUrl = n8nWebhookUrl.trim();
  if (n8nWebhookId !== undefined) settings.n8nWebhookId = n8nWebhookId.trim();
  if (n8nMode !== undefined) settings.n8nMode = n8nMode;
  if (groqApiKey !== undefined && groqApiKey !== '') settings.groqApiKey = groqApiKey.trim();
  if (groqModel !== undefined) settings.groqModel = groqModel;
  if (apiKey !== undefined && apiKey !== '') settings.apiKey = apiKey.trim();
  if (model !== undefined) settings.model = model;
  if (customEndpoint !== undefined) settings.customEndpoint = customEndpoint;
  if (systemPrompt !== undefined) settings.systemPrompt = systemPrompt;

  writeJson(SETTINGS_FILE, settings);
  res.json({ success: true, message: "Paramètres de l'Agent IA & n8n enregistrés avec succès." });
});

// 9. GET /api/settings/n8n-workflow - Get current n8n workflow file
app.get('/api/settings/n8n-workflow', (req, res) => {
  const workflow = readJson(N8N_WORKFLOW_FILE, {});
  res.json({ success: true, workflow });
});

// 10. POST /api/settings/test-n8n - Test n8n Webhook connectivity
app.post('/api/settings/test-n8n', async (req, res) => {
  const { n8nWebhookUrl, n8nWebhookId, n8nMode } = req.body;
  const settings = readJson(SETTINGS_FILE, defaultSettings);

  let targetUrl = (n8nWebhookUrl || settings.n8nWebhookUrl || '').trim();
  const hookId = (n8nWebhookId || settings.n8nWebhookId || 'b639adfd-6c4b-48cd-af68-fb21384fcc52').trim();
  const mode = n8nMode || settings.n8nMode || 'webhook';

  if (!targetUrl) {
    return res.status(400).json({
      success: false,
      error: "Veuillez renseigner l'URL de votre instance n8n (ex: https://n8n.votre-domaine.com)."
    });
  }

  if (!targetUrl.includes('/webhook')) {
    targetUrl = `${targetUrl.replace(/\/+$/, '')}/${mode}/${hookId}/chat`;
  }

  try {
    const startTime = Date.now();
    const testResp = await fetch(targetUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendMessage',
        chatInput: 'Ping test de connectivité DigitalVerse. Réponds en un mot : "Connecté"',
        sessionId: 'test-ping-01'
      })
    });
    const elapsed = Date.now() - startTime;

    if (testResp.ok) {
      let textReply = "OK";
      try {
        const d = await testResp.json();
        textReply = d.output || d.text || JSON.stringify(d);
      } catch (e) {
        textReply = await testResp.text();
      }
      return res.json({
        success: true,
        message: `Webhook n8n joint avec succès en ${elapsed}ms ! Réponse de l'Agent : "${textReply.slice(0, 150)}"`
      });
    } else {
      return res.status(400).json({
        success: false,
        error: `n8n a répondu avec le statut HTTP ${testResp.status}. Vérifiez que le workflow est activé dans n8n.`
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Impossible de contacter l'instance n8n : ${err.message}`
    });
  }
});

// 11. POST /api/settings/test - Test API Key connectivity (OpenAI / Groq)
app.post('/api/settings/test', async (req, res) => {
  const { apiKey, model, customEndpoint, provider } = req.body;
  const settings = readJson(SETTINGS_FILE, defaultSettings);

  const isGroq = provider === 'groq';
  const targetKey = isGroq
    ? (apiKey || settings.groqApiKey || '').trim()
    : (apiKey || settings.apiKey || '').trim();

  if (!targetKey) {
    return res.status(400).json({
      success: false,
      error: "Aucune clé API fournie. Le moteur de fallback heuristique DigitalVerse reste actif."
    });
  }

  const endpoint = isGroq
    ? 'https://api.groq.com/openai/v1'
    : (customEndpoint || settings.customEndpoint || 'https://api.openai.com/v1');

  const chosenModel = isGroq
    ? (model || settings.groqModel || 'llama-3.3-70b-versatile')
    : (model || settings.model || 'gpt-4o-mini');

  try {
    const startTime = Date.now();
    const testResp = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${targetKey}`
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [{ role: 'user', content: 'Ping test. Réponds en un mot : "Connecté"' }],
        max_tokens: 10
      })
    });

    const elapsed = Date.now() - startTime;

    if (testResp.ok) {
      const data = await testResp.json();
      const reply = data.choices?.[0]?.message?.content || "OK";
      return res.json({
        success: true,
        message: `API ${isGroq ? 'Groq' : 'LLM'} opérationnelle en ${elapsed}ms ! Réponse du modèle : "${reply.trim()}"`
      });
    } else {
      const errText = await testResp.text();
      return res.status(400).json({
        success: false,
        error: `Erreur fournisseur (${testResp.status}) : ${errText.slice(0, 150)}`
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Impossible de contacter le serveur distant : ${err.message}`
    });
  }
});

// Serve Vite static files if dist exists
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, error: "Route API introuvable" });
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`DigitalVerse Agency Server running on http://0.0.0.0:${server.address().port}`);
});
