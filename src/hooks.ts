/* ============================================================
   شهرفرنگ — هوک‌های تعامل، حرکت و صدا
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- کاهش حرکت ---------- */

export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
};

/* ---------- ورود به میدان دید ---------- */

export const useInView = <T extends HTMLElement>(threshold = 0.12) => {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
};

/* ---------- شمارنده‌ی متحرک ---------- */

export const useCountUp = (target: number, active: boolean, duration = 1300): number => {
  const [val, setVal] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setVal(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, reduced]);
  return val;
};

/* ---------- ذخیره‌ی محلی ---------- */

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* حافظه پر یا مسدود — بی‌خیال */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

/* ---------- آدرس‌دهی پرونده‌ها با هش URL ---------- */

const HASH_RE = /^#i\/(.+)$/;

export const useHashItem = () => {
  const [id, setId] = useState<string | null>(() => {
    const m = window.location.hash.match(HASH_RE);
    return m ? decodeURIComponent(m[1]) : null;
  });

  useEffect(() => {
    const onHash = () => {
      const m = window.location.hash.match(HASH_RE);
      setId(m ? decodeURIComponent(m[1]) : null);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const set = useCallback((next: string | null) => {
    setId(next);
    if (next) {
      window.location.hash = `i/${encodeURIComponent(next)}`;
    } else if (HASH_RE.test(window.location.hash)) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return [id, set] as const;
};

/* ---------- موتور صدای ماشین تحریر ---------- */

export function useMuseumSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const onRef = useRef(enabled);
  onRef.current = enabled;

  const ensure = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current?.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  /* کلیکِ کلید ماشین تحریر */
  const click = useCallback(() => {
    if (!onRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const dur = 0.05;
    const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.4);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1600;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    src.connect(hp);
    hp.connect(g);
    g.connect(ctx.destination);
    src.start(t);
  }, [ensure]);

  /* کوبشِ مُهر — برای ذخیره و مُهرها */
  const thunk = useCallback(() => {
    if (!onRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(62, t + 0.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.13, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }, [ensure]);

  useEffect(() => () => void ctxRef.current?.close(), []);

  return { click, thunk };
}
