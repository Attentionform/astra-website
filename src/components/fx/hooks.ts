import { useEffect, useRef, useState } from 'react';

export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True while the element is on screen. Animations only run (and loop) while visible. */
export function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/** Steps 0..length-1 and wraps, every `ms`, only while `active`. Returns [step, completed loops]. Reduced motion pins the last step. */
export function useTicker(length: number, ms: number, active: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reducedMotion()) { setN(length - 1); return; }
    if (!active) return;
    const id = setInterval(() => setN((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [length, ms, active]);
  return [n % length, Math.floor(n / length)] as const;
}
