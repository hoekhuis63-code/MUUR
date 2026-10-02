import { useEffect, useState } from 'react';

/** Vaste knop onderin op mobiel, zodra de hero uit beeld is en de muur nog niet in beeld. */
export function StickyCta({ hidden }: { hidden: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('header');
    const wall = document.getElementById('muur');
    if (!hero || !wall || !('IntersectionObserver' in window)) return;
    const visible = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target, e.isIntersecting);
      setShow(!visible.get(hero) && !visible.get(wall));
    });
    observer.observe(hero);
    observer.observe(wall);
    return () => observer.disconnect();
  }, []);

  if (!show || hidden) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-navy/10 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
      <a href="#muur" className="btn-primary">
        Kies je vak
      </a>
    </div>
  );
}
