import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import SiteNavigation from './components/SiteNavigation';
import SpatialScene from './components/SpatialScene';
import Services from './components/Services';
import WhyUs from './components/WhyUs';
import Pricing from './components/Pricing';
import Portfolio from './components/Portfolio';
import Process from './components/Process';
import About from './components/About';
import Faq from './components/Faq';
import Contact from './components/Contact';
import Footer from './components/Footer';
import OrderModal from './components/OrderModal';
import AiChatBrief from './components/AiChatBrief';
import AdminWorkspace from './components/AdminWorkspace';
import LegalModal from './components/LegalModal';

const titles = { '/': 'Agence web & intelligence artificielle', '/expertises': 'Nos expertises', '/realisations': 'Nos réalisations', '/offres': 'Offres & tarifs', '/agence': 'L’agence', '/contact': 'Parlons de votre projet' };
function PageEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${titles[pathname] || 'Page introuvable'} — DigitalVerse`;
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}
function PageIntro({ number, eyebrow, title, accent, description }) {
  return <section className="page-intro"><div className="intro-orbit" aria-hidden="true" /><div className="section-kicker"><span>{number} /</span> {eyebrow}</div><h1>{title}<br /><em>{accent}</em></h1><p>{description}</p><div className="intro-rule"><span>DIGITALVERSE STUDIO</span><span>DESIGNED FOR WHAT’S NEXT ↘</span></div></section>;
}
function Home({ onOrder }) {
  return <>
    <section className="new-hero"><div className="hero-copy"><div className="section-kicker"><span className="live-dot" /> STUDIO DIGITAL INDÉPENDANT</div><h1>Votre ambition.<br />Notre terrain<br /><em>de création.</em></h1><p>Des sites qui marquent les esprits. Des intelligences artificielles qui simplifient le quotidien. Une seule équipe pour donner vie à vos idées.</p><div className="hero-actions"><button className="primary-action" onClick={onOrder}>Construisons votre projet <ArrowUpRight size={18} /></button><Link to="/realisations" className="text-action">Explorer nos projets <ArrowRight size={17} /></Link></div><div className="hero-footnote"><span>STRATÉGIE → DESIGN → DÉVELOPPEMENT</span><span>Basés en France · Pensés pour vous</span></div></div><SpatialScene /></section>
    <div className="expertise-strip"><span>DES EXPÉRIENCES QUI FONT LA DIFFÉRENCE</span><b>Web design</b><i>✳</i><b>Intelligence artificielle</b><i>✳</i><b>Automatisation</b></div>
    <section className="home-paths"><div className="section-kicker">01 / CE QUE NOUS CRÉONS</div><div className="home-section-title"><h2>Le digital, sans limites.<br /><span>La complexité, en moins.</span></h2><Link to="/expertises" className="text-action">Toutes nos expertises <ArrowUpRight size={18} /></Link></div><div className="path-grid">{[['01','Sites & expériences web','Une présence singulière, rapide et pensée pour vos utilisateurs.','/expertises','↗'],['02','Agents & solutions IA','Des assistants utiles, connectés à votre activité et à vos outils.','/expertises','✳'],['03','Automatisation','Moins de tâches répétitives. Plus de temps pour votre métier.','/expertises','⌘']].map(([n,title,text,to,icon]) => <Link className="path-card" key={n} to={to}><div className="path-top"><span>{n} /</span><ArrowUpRight size={20} /></div><div className="path-icon" aria-hidden="true">{icon}</div><h3>{title}</h3><p>{text}</p></Link>)}</div></section>
    <section className="home-feature"><div><div className="section-kicker">02 / DU CONCEPT À L’EXPÉRIENCE</div><h2>Votre prochaine<br />grande impression.</h2><p>Découvrez nos concepts de design : trois univers, trois façons de transformer une identité en expérience digitale.</p><Link to="/realisations" className="primary-action">Voir les concepts <ArrowUpRight size={18} /></Link></div><Link to="/realisations" className="feature-image"><img src="/assets/project-velora.png" alt="Aperçu du concept web Maison Vélora" loading="lazy" /><span>MAISON VÉLORA <ArrowUpRight size={20} /></span></Link></section>
    <section className="closing-cta"><div className="section-kicker">ET SI ON FAISAIT ÉQUIPE ?</div><h2>Les bonnes idées méritent<br /><em>de prendre vie.</em></h2><Link to="/contact" className="primary-action">Parlons de la vôtre <ArrowUpRight size={18} /></Link></section>
  </>;
}
function Site() {
  const [orderOpen, setOrderOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const [brief, setBrief] = useState(null);
  const [legal, setLegal] = useState({ open: false, type: 'legal' });
  const openOrder = (value = null) => {
    setPlan(typeof value === 'string' ? { category: value, id: value === 'agent_ai' ? 'agent-chatbot' : 'business-fonctionnel' } : value);
    setOrderOpen(true);
  };
  if (window.location.pathname === '/admin') return <AdminWorkspace />;
  return <><PageEffects /><a className="skip-link" href="#main-content">Aller au contenu</a><SiteNavigation /><main id="main-content" tabIndex={-1}><Routes>
    <Route path="/" element={<Home onOrder={() => openOrder()} />} />
    <Route path="/expertises" element={<><PageIntro number="01" eyebrow="NOS EXPERTISES" title="Des idées ambitieuses." accent="Des solutions concrètes." description="Du premier pixel à votre prochain workflow : une expertise technique au service de votre activité." /><Services onSelectService={id => openOrder(['ai-solutions','automation'].includes(id) ? 'agent_ai' : 'site')} /><Process /><Link className="page-bottom-link" to="/offres">Trouver l’offre adaptée à mon projet ↗</Link></>} />
    <Route path="/realisations" element={<><PageIntro number="02" eyebrow="EXPLORATIONS & CONCEPTS" title="Des univers singuliers." accent="Une même exigence." description="Une sélection de concepts créatifs pour illustrer notre approche du design. Ces démonstrations ne sont pas des références clients." /><Portfolio onOpenOrder={openOrder} /><Link className="page-bottom-link" to="/contact">Imaginons votre prochain projet ↗</Link></>} />
    <Route path="/offres" element={<><PageIntro number="03" eyebrow="OFFRES & TARIFS" title="Un cadre clair." accent="Pour aller plus loin." description="Séparez votre investissement initial de votre accompagnement mensuel. Une demande de projet ne déclenche aucun paiement : le périmètre sera confirmé avec vous." /><Pricing onSelectPlan={openOrder} /><Faq onOpenContact={() => window.location.assign('/contact')} /></>} />
    <Route path="/agence" element={<><PageIntro number="04" eyebrow="L’ESPRIT DIGITALVERSE" title="La technologie, oui." accent="L’humain, surtout." description="Nous aimons les belles interfaces. Mais ce qui nous anime, c’est ce qu’elles rendent possible pour vous." /><About /><WhyUs /><Process /><Link className="page-bottom-link" to="/contact">Faisons connaissance ↗</Link></>} />
    <Route path="/contact" element={<><PageIntro number="05" eyebrow="PREMIER CONTACT" title="Tout commence" accent="par un échange." description="Une idée précise ou encore quelques questions ? Présentez-nous votre besoin. Nous définirons ensemble la prochaine étape, sans engagement." /><Contact onStartAiChat={() => openOrder()} /></>} />
    <Route path="*" element={<section className="page-intro"><div className="section-kicker">404 / HORS DU CADRE</div><h1>Cette page reste<br /><em>à inventer.</em></h1><Link className="primary-action" to="/">Retour à l’accueil <ArrowRight size={18} /></Link></section>} />
  </Routes></main><Footer onOpenAdmin={() => window.location.assign('/admin')} onOpenLegal={() => setLegal({open:true,type:'legal'})} onOpenPrivacy={() => setLegal({open:true,type:'privacy'})} /><OrderModal isOpen={orderOpen} onClose={() => setOrderOpen(false)} initialPlan={plan} onOrderCreated={order => { setOrderOpen(false); setBrief(order); }} />{brief && <AiChatBrief order={brief} onClose={() => setBrief(null)} onOpenAdmin={() => {setBrief(null);window.location.assign('/admin');}} />}<LegalModal isOpen={legal.open} type={legal.type} onClose={() => setLegal({...legal,open:false})} /></>;
}
export default function App() { return <BrowserRouter><Site /></BrowserRouter>; }
