import { useEffect, useRef } from 'react';

export default function SpatialScene() {
  const scene = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame;
    const update = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const pointer = event && event.type === 'pointermove';
        const x = pointer ? (event.clientX / window.innerWidth - .5) * 14 : 0;
        const y = pointer ? (event.clientY / window.innerHeight - .5) * -10 : 0;
        scene.current?.style.setProperty('--rx', `${y}deg`);
        scene.current?.style.setProperty('--ry', `${x}deg`);
        scene.current?.style.setProperty('--shift', `${Math.min(window.scrollY * .13, 90)}px`);
      });
    };
    window.addEventListener('pointermove', update, { passive: true });
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', update);
      window.removeEventListener('scroll', update);
    };
  }, []);
  return <div className="spatial-scene" ref={scene} aria-hidden="true">
    <div className="scene-grid" />
    <div className="scene-world">
      <div className="orbit orbit-one" /><div className="orbit orbit-two" />
      <div className="spatial-core"><div className="core-face front">D<span>V</span></div><div className="core-face back" /><div className="core-face left" /><div className="core-face right" /><div className="core-face top" /><div className="core-face bottom" /></div>
      <div className="spatial-label label-one"><i /> SYSTEM ONLINE <strong>Web. IA. Impact.</strong></div>
      <div className="spatial-label label-two">01 — DESIGN<br /><span>Une nouvelle dimension.</span></div>
      <div className="scene-dot dot-one" /><div className="scene-dot dot-two" />
    </div>
    <span className="scene-caption">DIGITALVERSE / DIGITAL EXPERIENCES STUDIO</span>
  </div>;
}
