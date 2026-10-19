import { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, Layers, Inbox, ExternalLink, Settings2, ArrowUpRight, ArrowLeft, LogOut, Search, RefreshCw, ChevronRight, X, Mail, Phone, Clock, Check, ShieldCheck, AlertCircle, LockKeyhole } from 'lucide-react';
import Logo from './Logo';
import AdminDashboard from './AdminDashboard';
import './admin.css';

const tabs = [['overview', 'Vue d’ensemble', LayoutDashboard], ['orders', 'Commandes', Layers], ['contacts', 'Demandes de contact', Inbox], ['registry', 'Livrables', ExternalLink], ['settings', 'IA & intégrations', Settings2]];
const statuses = ['Nouveau — En cours de cadrage IA', 'Brief finalisé — En analyse', 'En production', 'Prête & Livrée'];
const date = value => value ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const name = order => `${order.client?.firstName || ''} ${order.client?.lastName || ''}`.trim();
const initials = text => text.split(' ').filter(Boolean).slice(0,2).map(word => word[0]).join('').toUpperCase();
const statusClass = status => /livrée|prête/i.test(status) ? 'green' : /production/i.test(status) ? 'purple' : /brief/i.test(status) ? 'blue' : 'orange';
const demoOrders = [
  { id: 'DEMO-001', client: { firstName: 'Camille', lastName: 'Martin', email: 'camille@example.com' }, planName: 'Business Fonctionnel', projectType: 'site', status: statuses[2], createdAt: '2026-10-18', initialNotes: 'Site vitrine pour un studio d’architecture.', chatHistory: [] },
  { id: 'DEMO-002', client: { firstName: 'Alex', lastName: 'Moreau', email: 'alex@example.com' }, planName: 'Chatbot IA Entreprise', projectType: 'agent_ai', status: statuses[0], createdAt: '2026-10-17', initialNotes: 'Un assistant pour répondre aux questions fréquentes.', chatHistory: [] },
  { id: 'DEMO-003', client: { firstName: 'Léa', lastName: 'Petit', email: 'lea@example.com' }, planName: 'Vitrine Starter', projectType: 'site', status: statuses[1], createdAt: '2026-10-16', initialNotes: 'Une présence digitale pour un nouveau restaurant.', chatHistory: [] }
];
const demoContacts = [{ id: 'DEMO-C1', name: 'Morgan Dupont', email: 'morgan@example.com', company: 'Atelier Démo', message: 'Bonjour, je souhaite échanger autour de la refonte de mon site.', createdAt: '2026-10-18', budget: '500-1500', projectType: 'site-web' }];
function safeUrl(value) { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; } }
async function api(url, options = {}) {
  const response = await fetch(url, options);
  // A proxy error or an HTML error page would otherwise throw "Unexpected token <"
  // and show that instead of the real reason.
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Le serveur a répondu ${response.status}.`);
  return result;
}

export default function AdminWorkspace() {
  const [auth, setAuth] = useState('loading');
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [registry, setRegistry] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [updated, setUpdated] = useState(null);
  const demo = auth === 'demo';
  const drawerOpen = selected !== null;
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const trap = event => {
      if (event.key === 'Escape') { setSelected(null); return; }
      if (event.key !== 'Tab') return;
      const dialog = document.querySelector('.aw-drawer');
      const controls = dialog?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)');
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', trap); previous?.focus(); };
  }, [drawerOpen]);
  useEffect(() => {
    document.title = 'Administration — DigitalVerse';
    api('/api/auth/session').then(data => setAuth(data.authenticated ? 'authenticated' : 'login')).catch(() => setAuth('login'));
  }, []);
  const load = useCallback(async () => {
    if (auth !== 'authenticated') return;
    setBusy(true); setError('');
    try {
      const [o, c, r] = await Promise.all([api('/api/orders'), api('/api/contacts'), api('/api/registry')]);
      setOrders(o.orders); setContacts(c.contacts); setRegistry(r.registry); setUpdated(new Date());
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }, [auth]);
  useEffect(() => { load(); }, [load]);
  const enterDemo = () => { setOrders(demoOrders); setContacts(demoContacts); setRegistry([]); setAuth('demo'); setError(''); };
  const changeTab = value => { setTab(value); setSearch(''); setFilter('all'); setSelected(null); setNotice(''); };
  const logout = async () => {
    try { if (!demo) await api('/api/auth/logout', { method: 'POST' }); }
    catch (err) { setError(err.message); return; }
    setAuth('login');setOrders([]);setContacts([]);setRegistry([]);setSelected(null);setError('');
  };
  const saveOrder = async (event) => {
    event.preventDefault(); if (demo) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await api(`/api/orders/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: fields.get('status'), adminNotes: fields.get('notes') }) });
      setSelected(result.order); setOrders(items => items.map(order => order.id === result.order.id ? result.order : order)); setNotice('Modifications enregistrées.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  if (auth === 'loading') return <div className="admin-loading"><Logo /><p>Ouverture de votre espace…</p></div>;
  if (auth === 'login') return <Login onSuccess={() => {setAuth('authenticated');setError('');}} onDemo={enterDemo} />;
  const query = search.toLowerCase();
  const filtered = orders.filter(order => `${name(order)} ${order.client?.email} ${order.id} ${order.planName}`.toLowerCase().includes(query) && (filter === 'all' || statusClass(order.status) === filter));
  const pending = orders.filter(order => statusClass(order.status) === 'orange').length;
  const production = orders.filter(order => statusClass(order.status) === 'purple').length;
  const orderTable = rows => <div className="aw-table-scroll"><table className="aw-table"><thead><tr><th>Client / Projet</th><th>Offre</th><th>Statut</th><th>Création</th><th><span className="sr-only">Détails</span></th></tr></thead><tbody>{rows.map(order => <tr key={order.id}><td><button className="aw-client" onClick={() => {setSelected(order);setNotice('');}}><span className="aw-avatar">{initials(name(order))}</span><span><strong>{name(order)}</strong><small>{order.projectType === 'agent_ai' ? 'Agent IA & automatisation' : 'Création de site web'}</small></span></button></td><td>{order.planName}</td><td><span className={`aw-badge ${statusClass(order.status)}`}><i />{order.status}</span></td><td>{date(order.createdAt)}</td><td><button className="aw-icon-button" aria-label={`Ouvrir la commande de ${name(order)}`} onClick={() => {setSelected(order);setNotice('');}}><ChevronRight size={17} /></button></td></tr>)}</tbody></table>{!rows.length && <Empty title="Aucune commande" text="Les demandes de projet apparaîtront ici. Essayez aussi de modifier vos filtres." />}</div>;
  return <div className="admin-workspace">
    <aside className="aw-sidebar"><a href="/" className="aw-brand"><Logo /></a><div className="aw-space"><span className="aw-workspace-icon">DV</span><div><strong>Espace de travail</strong><small>Administration du studio</small></div><ShieldCheck size={15} /></div><p className="aw-nav-label">PILOTAGE</p><nav aria-label="Navigation administration">{tabs.map(([id,label,Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => changeTab(id)}><Icon size={18} /><span>{label}</span>{id === 'contacts' && <b>{contacts.length}</b>}</button>)}</nav><div className="aw-sidebar-bottom"><div className="aw-protected"><ShieldCheck size={20} /><strong>{demo ? 'Mode démonstration' : 'Espace protégé'}</strong><p>{demo ? 'Données fictives, lecture seule. Aucune donnée client exposée.' : 'Session privée. Pensez à vous déconnecter après utilisation.'}</p></div><a href="/"><ArrowUpRight size={16} /> Voir le site public</a><button onClick={logout}><LogOut size={16} />{demo ? 'Quitter la démo' : 'Se déconnecter'}</button></div></aside>
    <div className="aw-body"><header className="aw-topbar"><span>Workspace <ChevronRight size={12} /> <strong>{tabs.find(item => item[0] === tab)[1]}</strong></span><div><span className={`aw-connection ${demo ? 'demo' : ''}`}><i />{demo ? 'Démo' : 'Session active'}</span><span className="aw-admin-avatar">DV</span></div></header>
    <main className="aw-main" id="admin-main">
      {demo && <div className="aw-demo-banner"><AlertCircle size={15} /> Aperçu de l’interface · données fictives · modifications désactivées</div>}
      <div className="aw-page-heading"><div><div className="aw-eyebrow">DIGITALVERSE / ADMINISTRATION</div><h1>{tab === 'overview' ? 'Votre studio, en un regard.' : tabs.find(item => item[0] === tab)[1]}</h1><p>{({overview:'Suivez vos projets et gardez le cap sur les prochaines étapes.',orders:'Du premier échange à la livraison : chaque projet au bon endroit.',contacts:'Les conversations qui pourraient devenir vos prochains projets.',registry:'Retrouvez les projets livrés et leurs liens de production.',settings:'Vos outils, vos modèles et vos automatisations, connectés.'})[tab]}</p></div><button className="aw-secondary" onClick={load} disabled={busy || demo}><RefreshCw size={14} className={busy ? 'animate-spin' : ''} />Actualiser</button></div>
      {error && <div className="aw-alert" role="alert"><AlertCircle size={17} />{error}</div>}
      {notice && <div className="aw-success" role="status"><Check size={17} />{notice}</div>}
      {tab === 'overview' && <>
        <div className="aw-stats">{[['Commandes totales',orders.length,Layers,'Tous vos projets réunis'],['À prendre en charge',pending,Clock,'En attente de cadrage'],['En production',production,Settings2,'Les projets en cours'],['Demandes de contact',contacts.length,Inbox,'Des échanges à poursuivre']].map(([label,value,Icon,hint]) => <div className="aw-stat" key={label}><div><span>{label}</span><Icon size={17} /></div><strong>{value.toString().padStart(2,'0')}</strong><small>{hint}</small></div>)}</div>
        <div className="aw-overview-grid"><section className="aw-panel"><div className="aw-panel-title"><div><h2>Commandes récentes</h2><p>Vos derniers projets entrants.</p></div><button onClick={() => changeTab('orders')}>Tout voir <ArrowUpRight size={15} /></button></div>{orderTable(orders.slice(0,5))}</section><section className="aw-panel aw-pipeline"><div className="aw-panel-title"><div><h2>Le parcours de vos projets</h2><p>Répartition par étape.</p></div></div>{[['orange','À cadrer'],['blue','Brief finalisé'],['purple','En production'],['green','Livrés']].map(([color,label]) => {const count=orders.filter(order => statusClass(order.status) === color).length;return <button className="aw-pipeline-item" key={color} onClick={() => {changeTab('orders');setFilter(color);}}><div><span className={`aw-stage ${color}`} />{label}<strong>{count}</strong></div><div className="aw-track"><i className={color} style={{width:`${orders.length ? count / orders.length * 100 : 0}%`}} /></div></button>;})}<div className="aw-pipeline-note">Une vue opérationnelle, sans indicateurs de performance inventés.</div></section></div>
        <section className="aw-contact-preview"><Inbox size={24} /><div><h2>Une demande mérite une réponse.</h2><p>{contacts.length} demande{contacts.length > 1 ? 's' : ''} enregistrée{contacts.length > 1 ? 's' : ''} dans votre boîte de contact.</p></div><button className="aw-secondary" onClick={() => changeTab('contacts')}>Ouvrir la boîte <ArrowUpRight size={15} /></button></section>
      </>}
      {['orders','contacts','registry'].includes(tab) && <div className="aw-filters"><label><Search size={16} /><span className="sr-only">Rechercher</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder={tab === 'orders' ? 'Rechercher un client, une offre, une référence…' : 'Rechercher…'} /></label>{tab === 'orders' && <select aria-label="Filtrer par statut" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Tous les statuts</option><option value="orange">À cadrer</option><option value="blue">Brief finalisé</option><option value="purple">En production</option><option value="green">Livrés</option></select>}</div>}
      {tab === 'orders' && <section className="aw-panel"><div className="aw-panel-title"><h2>Liste des commandes <small>({filtered.length})</small></h2></div>{orderTable(filtered)}</section>}
      {tab === 'contacts' && <div className="aw-contact-grid">{contacts.filter(c => `${c.name} ${c.email} ${c.message}`.toLowerCase().includes(query)).map(c => <article className="aw-panel aw-contact-card" key={c.id}><div className="aw-contact-heading"><span className="aw-avatar">{initials(c.name)}</span><div><h2>{c.name}</h2><p>{c.company || 'Particulier / indépendant'}</p></div><small>{date(c.createdAt)}</small></div><div className="aw-contact-tags"><span>{c.projectType || 'Projet à définir'}</span><span>Budget : {c.budget || 'Non précisé'}</span></div><p className="aw-contact-message">{c.message}</p><a href={`mailto:${encodeURIComponent(c.email)}`} className="aw-secondary"><Mail size={15} />Répondre par email <ArrowUpRight size={14} /></a></article>)}{!contacts.filter(c => `${c.name} ${c.email} ${c.message}`.toLowerCase().includes(query)).length && <Empty title="Aucune demande" text="Les messages du formulaire de contact seront affichés ici." />}</div>}
      {tab === 'registry' && <section className="aw-panel"><div className="aw-panel-title"><h2>Projets en ligne</h2>{!demo && <button onClick={() => setAdvanced(true)}>Gérer les livrables <ArrowUpRight size={15} /></button>}</div>{registry.filter(r => `${r.clientName} ${r.projectName}`.toLowerCase().includes(query)).map(r => <div className="aw-deliverable" key={r.id}><span className="aw-avatar"><ExternalLink size={20} /></span><div><strong>{r.projectName || r.planName}</strong><p>{r.clientName} · {date(r.deliveredAt)}</p></div>{safeUrl(r.deliverableUrl) ? <a className="aw-secondary" href={safeUrl(r.deliverableUrl)} target="_blank" rel="noreferrer">Ouvrir <ArrowUpRight size={14} /></a> : <span>URL indisponible</span>}</div>)}{!registry.length && <Empty title="Vos prochaines livraisons, ici." text="Ajoutez les liens de production via la gestion des livrables." />}</section>}
      {tab === 'settings' && <><div className="aw-integration-grid">{[['Nova / Agent conversationnel','Cadrez les besoins de vos clients avec votre fournisseur IA.','IA'],['n8n / Automatisations','Connectez le brief à vos workflows et à vos outils métier.','N8N'],['Configuration & livrables','Retrouvez les modèles, prompts, tests et réglages avancés.','API']].map(([title,text,tag]) => <section className="aw-panel aw-integration" key={tag}><span>{tag}</span><h2>{title}</h2><p>{text}</p><button className="aw-secondary" disabled={demo} onClick={() => setAdvanced(true)}>Ouvrir la configuration <ArrowUpRight size={15} /></button></section>)}</div><div className="aw-info"><ShieldCheck size={20} /><p>Les clés API restent côté serveur. L’état de connexion se vérifie dans les réglages avancés ; cette page ne suppose pas qu’un fournisseur est opérationnel.</p></div></>}
      <footer className="aw-footer"><span>DigitalVerse · Espace de travail privé</span><span>{demo ? 'Données de démonstration' : updated ? `Actualisé à ${updated.toLocaleTimeString('fr-FR')}` : 'Chargement des données…'}</span></footer>
    </main></div>
    {selected && <div className="aw-drawer-backdrop" onClick={() => setSelected(null)}><section className="aw-drawer" role="dialog" aria-modal="true" aria-labelledby="order-title" onClick={event => event.stopPropagation()} onKeyDown={event => {if(event.key === 'Escape') setSelected(null);}}><div className="aw-drawer-head"><span>FICHE PROJET</span><button autoFocus className="aw-icon-button" onClick={() => setSelected(null)} aria-label="Fermer les détails"><X size={20} /></button></div><h2 id="order-title">{name(selected)}</h2><p className="aw-order-reference">{selected.id}</p><span className={`aw-badge ${statusClass(selected.status)}`}>{selected.status}</span><div className="aw-detail-block"><h3>Coordonnées</h3><a href={`mailto:${encodeURIComponent(selected.client.email)}`}><Mail size={15} />{selected.client.email}</a>{selected.client.phone && <a href={`tel:${selected.client.phone}`}><Phone size={15} />{selected.client.phone}</a>}</div><div className="aw-detail-block"><h3>Le projet</h3><p>{selected.planName}</p><p>Échéance : {selected.deadline || 'À préciser'}</p><p>{selected.initialNotes || 'Aucune note initiale.'}</p></div><form onSubmit={saveOrder} className="aw-order-form"><label>Statut<select name="status" defaultValue={selected.status} key={selected.id + selected.status} disabled={demo}>{[...new Set([selected.status,...statuses])].map(status => <option key={status}>{status}</option>)}</select></label><label>Notes internes<textarea name="notes" defaultValue={selected.adminNotes || ''} rows={4} disabled={demo} /></label><button className="aw-primary" disabled={demo || busy}>{busy ? 'Enregistrement…' : 'Enregistrer les modifications'}<Check size={16} /></button>{notice && <p role="status" className="aw-success">{notice}</p>}{error && <p role="alert" className="aw-alert">{error}</p>}</form><div className="aw-detail-block"><h3>Conversation de cadrage</h3>{selected.chatHistory?.length ? selected.chatHistory.map((m,i) => <div key={m.id || i} className={`aw-message ${m.sender}`}><small>{m.sender === 'user' ? 'Client' : 'Nova'}</small><p>{m.message}</p></div>) : <p>Pas encore d’échanges.</p>}</div>{selected.compatibilityReport && <div className="aw-detail-block"><h3>Préqualification automatique</h3><p>{selected.compatibilityReport.verdictText}</p><small>Indication heuristique à valider par votre équipe.</small></div>}</section></div>}
    {advanced && <AdminDashboard isOpen onClose={() => {setAdvanced(false);load();}} />}
  </div>;
}
function Empty({title,text}) { return <div className="aw-empty"><Inbox size={28} /><h3>{title}</h3><p>{text}</p></div>; }
function Login({ onSuccess, onDemo }) {
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const submit=async event => {event.preventDefault();setBusy(true);setError('');const fields=new FormData(event.currentTarget);try {await api('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:fields.get('username'),password:fields.get('password')})});onSuccess();} catch(err){setError(err.message);} finally{setBusy(false);}};
  return <main className="aw-login"><section className="aw-login-story"><a href="/"><Logo size="large" /></a><div><span className="aw-eyebrow">LE STUDIO, CÔTÉ COULISSES</span><h1>Moins de friction.<br />Plus de <em>création.</em></h1><p>Votre espace pour transformer les demandes en projets, et les projets en expériences.</p></div><small>DESIGN · WEB · INTELLIGENCE ARTIFICIELLE</small><div className="aw-login-orbit" aria-hidden="true" /></section><section className="aw-login-form"><a href="/" className="aw-back"><ArrowLeft size={15} /> Retour au site</a><span className="aw-login-lock"><LockKeyhole size={24} /></span><h2>Bienvenue au studio.</h2><p>Connectez-vous à votre espace administrateur.</p><form onSubmit={submit}><label htmlFor="admin-user">Identifiant<input id="admin-user" name="username" autoComplete="username" required placeholder="Votre identifiant" /></label><label htmlFor="admin-password">Mot de passe<input id="admin-password" name="password" type="password" autoComplete="current-password" required placeholder="Votre mot de passe" /></label>{error && <div role="alert" className="aw-alert">{error}</div>}<button className="aw-primary" disabled={busy}>{busy ? 'Connexion…' : 'Accéder à mon espace'}<ArrowUpRight size={17} /></button></form><div className="aw-login-separator">DÉCOUVRIR L’INTERFACE</div><button className="aw-secondary" onClick={onDemo}>Explorer la démonstration <ArrowUpRight size={16} /></button><small className="aw-login-note">Aperçu en lecture seule avec données fictives.<br />L’accès réel nécessite des identifiants configurés sur le serveur.</small></section></main>;
}
