'use client';

import { useEffect } from 'react';

// Anything a shopper can click or tap: links, buttons, form controls, labels.
const CLICKABLE =
  'a, button, [role="button"], summary, label, select, input[type="checkbox"], input[type="radio"], input[type="submit"]';

// Global click feedback. Mount it once (see layout.js) and every click or tap
// on a clickable element sends out a small expanding ripple from the exact
// spot that was pressed. It is added straight to the DOM and removed when the
// animation ends, so it never triggers a React re-render, and it is skipped
// for people who have "reduce motion" turned on.
export default function ClickEffect() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function handlePointerDown(e) {
      if (reduceMotion.matches) return;
      // Left mouse button, touch or pen only.
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const target = e.target instanceof Element ? e.target.closest(CLICKABLE) : null;
      if (!target) return;
      if (target.matches(':disabled, [aria-disabled="true"]')) return;

      const ripple = document.createElement('span');
      ripple.className = 'click-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);

      const remove = () => ripple.remove();
      ripple.addEventListener('animationend', remove, { once: true });
      setTimeout(remove, 900); // safety net
    }

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return null;
}
