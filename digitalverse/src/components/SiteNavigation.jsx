import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Logo from './Logo';
const links = [['/', 'Accueil'], ['/expertises', 'Expertises'], ['/realisations', 'Réalisations'], ['/offres', 'Offres'], ['/agence', 'L’agence']];
export default function SiteNavigation() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="site-nav">
    <Link to="/" aria-label="DigitalVerse accueil" onClick={() => setOpen(false)}><Logo size="default" /></Link>
    <nav className="desktop-nav" aria-label="Navigation principale">{links.map(([to, name]) => <NavLink key={to} to={to} end>{name}</NavLink>)}</nav>
    <Link className="nav-contact" to="/contact">Parlons de votre projet <ArrowUpRight size={16} /></Link>
    <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}>{open ? <X /> : <Menu />}</button>
  </div>{open && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Navigation mobile">{[...links, ['/contact', 'Contact']].map(([to, name]) => <NavLink key={to} to={to} end onClick={() => setOpen(false)}>{name}</NavLink>)}</nav>}</header>;
}
