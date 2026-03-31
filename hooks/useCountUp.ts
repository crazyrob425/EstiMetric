import { useEffect, RefObject } from 'react';

/**
 * Animates a number from 0 to `target` over `duration` ms using requestAnimationFrame.
 * Note: `ref` is intentionally omitted from deps — it is a stable object whose `.current`
 * is mutated by React and does not need to trigger re-runs.
 */
export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  target: number,
  prefix: string = '',
  duration: number = 1000
) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const startTime = performance.now();
    const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.round(target * easeOutExpo(progress));
      el.textContent = `${prefix}${current.toLocaleString()}`;
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, prefix, duration]);
}
