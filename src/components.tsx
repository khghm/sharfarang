/* ============================================================
   شهرفرنگ — اجزای رابط موزه (نسخه‌ی پیشرفته)
   ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ITEMS,
  MAX_YEAR,
  MIN_YEAR,
  STATUS,
  StatusId,
  WINDOW,
  catById,
  plaqueNo,
  searchItems,
  toFa,
  type Item,
} from "./data";
import {
  ArrowNext,
  ArrowPrev,
  CATEGORY_ICONS,
  CornerOrnament,
  SearchIcon,
  StarBurst,
  TicketIcon,
} from "./icons";
import { useCountUp, useInView, useLocalStorage, useReducedMotion } from "./hooks";

const CAN_TILT =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: hover)").matches;

/* ─────────────────────── آیکون‌های جدید ─────────────────────── */

type IconProps = { className?: string };
const base = (p: IconProps) => ({
  className: p.className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const BookmarkIcon: React.FC<IconProps & { filled?: boolean }> = ({ className, filled }) => (
  <svg {...base({ className })} fill={filled ? "currentColor" : "none"}>
    <path d="M7 3.8h10a1 1 0 0 1 1 1V21l-6-3.6L6 21V4.8a1 1 0 0 1 1-1Z" />
  </svg>
);

export const SoundOnIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M4 9.5v5h3.2L12 19V5L7.2 9.5H4Z" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
  </svg>
);

export const SoundOffIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M4 9.5v5h3.2L12 19V5L7.2 9.5H4Z" />
    <path d="m16 9.5 5 5m0-5-5 5" />
  </svg>
);

export const DiceIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="3.5" />
    <circle cx="9" cy="9" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="15" cy="15" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="9" cy="15" r="1.15" fill="currentColor" stroke="none" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="7" y="5.5" width="3.4" height="13" rx="1" fill="currentColor" stroke="none" />
    <rect x="13.6" y="5.5" width="3.4" height="13" rx="1" fill="currentColor" stroke="none" />
  </svg>
);

export const UpIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M12 19V5m0 0-6 6m6-6 6 6" />
  </svg>
);

export const QuillIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M20 4c-6.5.6-11 3.4-13.2 8.6L5 18l5.4-1.8C15.6 14 18.8 9.5 20 4Z" />
    <path d="M5 18c2.5-4.5 6-7.8 10-10" />
  </svg>
);

/* ─────────────────────── ابزارهای عمومی ─────────────────────── */

export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = "",
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${inView ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

export const ScrollProgress: React.FC = () => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("resize", fn);
    };
  }, []);
  return <div className="progress-gold absolute bottom-0 right-0 h-[3px]" style={{ width: `${p * 100}%` }} aria-hidden />;
};

export const BackToTop: React.FC = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 700);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="بازگشت به سردر موزه"
      className="rise-in fixed bottom-6 left-6 z-40 grid h-12 w-12 place-items-center rounded-full border border-gold/50 bg-espresso text-gold-2 shadow-[0_12px_28px_-10px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-1"
    >
      <UpIcon className="h-5 w-5" />
    </button>
  );
};

export const Stamp: React.FC<{ status: StatusId; className?: string }> = ({ status, className = "" }) => (
  <span className={`stamp ${className}`} style={{ color: STATUS[status].color }}>
    {STATUS[status].fa}
  </span>
);

export const SectionHead: React.FC<{ no: string; title: string; en: string; dark?: boolean }> = ({
  no,
  title,
  en,
  dark,
}) => (
  <Reveal className="mb-8 sm:mb-10">
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className={`font-type text-[10px] tracking-[0.35em] ${dark ? "text-gold-2/80" : "text-gold-3"}`} dir="ltr">
          {en} · {no}
        </p>
        <h2 className={`font-display mt-1 text-4xl font-bold sm:text-5xl ${dark ? "text-paper" : "text-ink"}`}>{title}</h2>
      </div>
      <div className={`mb-3 hidden h-px flex-1 max-w-40 sm:block ${dark ? "bg-gold/30" : "bg-line-2"}`} />
      <StarBurst className={`mb-2 hidden h-6 w-6 sm:block ${dark ? "text-gold-2/60" : "text-gold-3/70"}`} />
    </div>
  </Reveal>
);

/* ─────────────────────── جستجو ─────────────────────── */

const Hi: React.FC<{ text: string; q: string }> = ({ text, q }) => {
  const t = q.trim();
  if (!t) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(t.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + t.length)}</mark>
      {text.slice(idx + t.length)}
    </>
  );
};

export const SearchBox: React.FC<{ size?: "lg" | "sm"; onOpen: (i: Item) => void }> = ({ size = "lg", onOpen }) => {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => searchItems(q).slice(0, 8), [q]);
  const open = focus && q.trim().length > 0;

  useEffect(() => {
    if (size !== "sm") return;
    const fn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [size]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setFocus(false);
    };
    document.addEventListener("pointerdown", fn);
    return () => document.removeEventListener("pointerdown", fn);
  }, [open]);

  const pick = (i: Item) => {
    onOpen(i);
    setFocus(false);
    setQ("");
    inputRef.current?.blur();
  };

  const row = (i: Item) => (
    <button
      key={i.id}
      onClick={() => pick(i)}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-right transition-colors hover:bg-gold/15"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-2 bg-cream text-lg emoji-aged">
        {i.image}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-bold text-ink">
          <Hi text={i.name} q={q} />
        </span>
        <span className="block text-[11px] text-ink-3">
          {catById(i.category).fa} · {toFa(i.year)}
        </span>
      </span>
      <Stamp status={i.status} className="!text-[9px]" />
    </button>
  );

  if (size === "sm") {
    return (
      <div ref={wrapRef} className="relative">
        <div className="flex items-center gap-2 rounded-full border border-line-2 bg-cream/80 px-3 py-1.5 transition-all focus-within:border-gold focus-within:shadow-[0_0_0_3px_rgba(185,138,47,0.15)]">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-3" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocus(true)}
            onKeyDown={(e) => e.key === "Escape" && setFocus(false)}
            placeholder="جستجوی اشیاء…"
            className="w-full min-w-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
            aria-label="جستجو در گنجینه"
          />
          <kbd className="hidden shrink-0 lg:block">/</kbd>
        </div>
        {open && (
          <div className="fade-in absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line-2 bg-cream shadow-[0_24px_50px_-20px_rgba(43,32,20,0.5)]">
            {results.length ? (
              results.map(row)
            ) : (
              <p className="px-4 py-5 text-center text-[13px] text-ink-3">چیزی با این نام در گنجینه نیست…</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative mx-auto max-w-xl">
      <div className="flex items-center gap-3 rounded-full border-2 border-line-2 bg-cream/90 px-5 py-3 shadow-[0_16px_36px_-22px_rgba(43,32,20,0.6)] transition-all focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgba(185,138,47,0.18),0_16px_36px_-22px_rgba(43,32,20,0.6)]">
        <SearchIcon className="h-5 w-5 shrink-0 text-gold-3" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onKeyDown={(e) => e.key === "Escape" && setFocus(false)}
          placeholder="نام شی را بنویسید؛ مثلاً «پیکان» یا «Walkman»"
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3/80"
          aria-label="جستجو در گنجینه"
        />
        <span className="font-type hidden shrink-0 text-[9px] tracking-[0.2em] text-ink-3 sm:block" dir="ltr">
          1801–2020
        </span>
      </div>
      {open && (
        <div className="fade-in absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line-2 bg-cream shadow-[0_28px_60px_-22px_rgba(43,32,20,0.55)]">
          {results.length ? (
            <>
              <div className="divide-y divide-dashed divide-line">{results.map(row)}</div>
              <p className="border-t border-line bg-paper-2/60 px-4 py-2 text-[11px] text-ink-3">
                {toFa(results.length)} نتیجه · برای پرونده‌ی کامل کلیک کنید
              </p>
            </>
          ) : (
            <p className="px-4 py-6 text-center text-[13px] text-ink-3">
              چیزی با این نام در گنجینه نیست؛ شاید هنوز کسی اهدایش نکرده…
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────── کارت شیء ─────────────────────── */

export const ItemCard: React.FC<{
  item: Item;
  index: number;
  onOpen: (i: Item) => void;
  wide?: boolean;
  saved?: boolean;
  onToggleSave?: (i: Item) => void;
}> = ({ item, index, onOpen, wide, saved, onToggleSave }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const cat = catById(item.category);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!CAN_TILT) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - py) * 4.5}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 4.5}deg`);
  };
  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  const saveBtn = onToggleSave && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleSave(item);
      }}
      aria-label={saved ? "حذف از دفترچه‌ی بازدیدکننده" : "افزودن به دفترچه‌ی بازدیدکننده"}
      title={saved ? "در دفترچه‌ی شماست" : "به دفترچه ببرید"}
      className={`absolute left-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border transition-all duration-200 hover:scale-110 active:scale-90 ${
        saved
          ? "border-gold bg-gold/20 text-gold-3"
          : "border-line-2 bg-cream/80 text-ink-3 hover:border-gold hover:text-gold-3"
      }`}
    >
      <BookmarkIcon className="h-4 w-4" filled={saved} />
    </button>
  );

  if (wide) {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={() => onOpen(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(item);
          }
        }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ transitionDelay: `${(index % 6) * 60}ms` }}
        className={`reveal ${inView ? "is-in" : ""} tilt-card aged-card group w-[320px] shrink-0 cursor-pointer snap-start rounded-xl sm:w-[390px]`}
      >
        {saveBtn}
        <div className="flex items-center gap-4 p-4">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-[3px] border-double border-gold-3 bg-[radial-gradient(circle_at_50%_35%,#fdf6e2,#e7d3a6_80%)] text-4xl shadow-[inset_0_3px_12px_rgba(120,80,30,0.3)] emoji-aged transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            {item.image}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-type text-[9px] tracking-[0.2em] text-gold-3">№ {plaqueNo(index + 1)}</span>
              <span className="font-type text-[10px] text-ink-3">{toFa(item.year)}</span>
            </div>
            <h3 className="font-display mt-0.5 truncate text-2xl font-bold leading-8 text-ink transition-colors group-hover:text-sienna">
              {item.name}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-ink-2">{item.description}</p>
            <div className="mt-2 flex items-center justify-between">
              <Stamp status={item.status} />
              <span className="flex items-center gap-1 text-[11px] font-bold text-gold-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                پرونده <ArrowNext className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transitionDelay: `${(index % 4) * 70}ms` }}
      className={`reveal ${inView ? "is-in" : ""} tilt-card aged-card group flex cursor-pointer flex-col rounded-xl text-right`}
    >
      {saveBtn}
      <div className="flex items-start justify-between p-5 pb-0">
        <span className="font-type text-[10px] tracking-[0.22em] text-gold-3">№ {plaqueNo(index + 1)}</span>
        <span className="ml-10 rounded-full border border-line-2 bg-cream/70 px-2 py-0.5 text-[10px] font-bold text-ink-3">
          {cat.fa}
        </span>
      </div>
      <div className="px-5 pt-4">
        <span className="mx-auto grid h-[84px] w-[84px] place-items-center rounded-full border-[3px] border-double border-gold-3 bg-[radial-gradient(circle_at_50%_35%,#fdf6e2,#e7d3a6_80%)] text-[42px] leading-none shadow-[inset_0_4px_14px_rgba(120,80,30,0.3)] emoji-aged transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
          {item.image}
        </span>
        <h3 className="font-display mt-3 text-center text-[26px] font-bold leading-9 text-ink transition-colors group-hover:text-sienna">
          {item.name}
        </h3>
        <p className="font-type mt-0.5 text-center text-[9px] tracking-[0.25em] text-ink-3" dir="ltr">
          {item.nameEn}
        </p>
        <p className="mt-2 min-h-[72px] text-center text-[12.5px] leading-6 text-ink-2">{item.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-dashed border-line-2 px-5 py-3">
        <span className="font-type rounded border border-line-2 bg-cream/70 px-2 py-0.5 text-[11px] font-bold text-ink-2">
          {toFa(item.year)}
        </span>
        <Stamp status={item.status} />
      </div>
      <span className="pointer-events-none flex items-center justify-center gap-1.5 overflow-hidden text-[11px] font-bold text-gold-3 transition-all duration-300 max-h-0 opacity-0 group-hover:max-h-8 group-hover:pb-3 group-hover:opacity-100">
        گشودن پرونده <ArrowNext className="h-3.5 w-3.5" />
      </span>
    </div>
  );
};

/* ─────────────────────── دریچه‌های شهرفرنگ ─────────────────────── */

export const PortholeStrip: React.FC<{ items: Item[]; onOpen: (i: Item) => void }> = ({ items, onOpen }) => (
  <div className="flex flex-wrap items-center justify-center gap-4 pb-6 sm:gap-6">
    {items.map((i) => (
      <button key={i.id} onClick={() => onOpen(i)} className="group relative" aria-label={i.name}>
        <span className="grid h-16 w-16 place-items-center rounded-full border-4 border-double border-gold-3 bg-[radial-gradient(circle_at_50%_35%,#fdf6e2,#e7d3a6_80%)] text-3xl shadow-[inset_0_4px_16px_rgba(120,80,30,0.35),0_8px_18px_-10px_rgba(43,32,20,0.5)] emoji-aged transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-20 sm:w-20 sm:text-4xl">
          {i.image}
        </span>
        <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold text-paper opacity-0 transition-all duration-300 group-hover:-bottom-4 group-hover:opacity-100">
          {i.name}
        </span>
      </button>
    ))}
  </div>
);

/* ─────────────────────── نوار خبری ─────────────────────── */

export const TickerBar: React.FC<{ onOpen: (i: Item) => void }> = ({ onOpen }) => {
  const picks = useMemo(() => {
    const leg = ITEMS.filter((i) => i.status === "legendary");
    const rest = ITEMS.filter((_, i) => i % 29 === 7);
    return [...leg, ...rest].slice(0, 18);
  }, []);
  const row = (key: string, hidden: boolean) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={hidden}>
      {picks.map((i) => (
        <button
          key={key + i.id}
          onClick={() => onOpen(i)}
          className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-[13px] font-bold text-paper/80 transition-colors hover:text-gold-2"
        >
          <span className="text-base">{i.image}</span>
          {i.name}
          <span className="font-type text-[10px] text-paper/40">{toFa(i.year)}</span>
          <span className="mx-2 text-gold/50">✦</span>
        </button>
      ))}
    </div>
  );
  return (
    <div className="relative z-10 border-y border-gold/25 bg-espresso">
      <div className="ticker-track">
        {row("a", false)}
        {row("b", true)}
      </div>
    </div>
  );
};

/* ─────────────────────── نوار افسانه‌ها ─────────────────────── */

export const LegendaryStrip: React.FC<{
  items: Item[];
  favs: string[];
  onOpen: (i: Item) => void;
  onToggleSave: (i: Item) => void;
}> = ({ items, favs, onOpen, onToggleSave }) => {
  const scRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scRef.current?.scrollBy({ left: dir * 430, behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={scRef} className="no-scrollbar flex snap-x gap-5 overflow-x-auto pb-4">
        {items.map((it, i) => (
          <ItemCard
            key={it.id}
            item={it}
            index={i}
            wide
            saved={favs.includes(it.id)}
            onToggleSave={onToggleSave}
            onOpen={onOpen}
          />
        ))}
      </div>
      <div className="mt-1 hidden justify-center gap-3 sm:flex">
        <button
          onClick={() => scroll(1)}
          aria-label="افسانه‌های قبلی"
          className="grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-cream text-ink-2 transition-all hover:border-sienna hover:text-sienna active:scale-90"
        >
          <ArrowPrev className="h-4 w-4" />
        </button>
        <button
          onClick={() => scroll(-1)}
          aria-label="افسانه‌های بعدی"
          className="grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-cream text-ink-2 transition-all hover:border-sienna hover:text-sienna active:scale-90"
        >
          <ArrowNext className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-center text-xs text-ink-3 sm:hidden">← برای دیدن بقیه‌ی افسانه‌ها بکشید →</p>
    </div>
  );
};

/* ─────────────────────── تایم‌لاین سراسری ─────────────────────── */

const DOT_COLORS: Record<StatusId, string> = {
  legendary: "#e0764a",
  museum: "#d9a94b",
  retired: "#9aa86a",
  rare: "#6f9c8a",
};

const ERAS = [
  { fa: "پیش از ۱۹۰۰", y: 1860 },
  { fa: "۱۹۰۰ تا ۱۹۴۵", y: 1922 },
  { fa: "۱۹۴۵ تا ۱۹۸۰", y: 1962 },
  { fa: "۱۹۸۰ تا ۲۰۲۰", y: 1998 },
];

export const TimelineSection: React.FC<{
  onOpen: (i: Item) => void;
  favs: string[];
  onToggleSave: (i: Item) => void;
}> = ({ onOpen, favs, onToggleSave }) => {
  const reduced = useReducedMotion();
  const [center, setCenter] = useState(1960);
  const [playing, setPlaying] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const MIN = MIN_YEAR + WINDOW / 2;
  const MAX = MAX_YEAR - WINDOW / 2;

  useEffect(() => {
    if (!playing || reduced) return;
    const t = window.setInterval(() => setCenter((c) => (c + 2 > MAX ? MIN : c + 2)), 70);
    return () => window.clearInterval(t);
  }, [playing, reduced, MIN, MAX]);

  const visible = useMemo(() => {
    const list = showAll ? [...ITEMS] : ITEMS.filter((i) => Math.abs(i.year - center) <= WINDOW / 2);
    return list.sort((a, b) => a.year - b.year);
  }, [center, showAll]);

  const decades = useMemo(() => {
    const arr: { d: number; n: number }[] = [];
    for (let d = 1800; d <= 2020; d += 10) arr.push({ d, n: ITEMS.filter((i) => i.year >= d && i.year < d + 10).length });
    return arr;
  }, []);
  const maxN = Math.max(...decades.map((x) => x.n), 1);

  const pct = (y: number) => ((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
  const dotTop = (id: string) => {
    let h = 0;
    for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return 12 + (h % 4) * 16;
  };

  const from = center - WINDOW / 2;
  const to = center + WINDOW / 2;

  return (
    <div>
      {/* فرمان‌ها */}
      <div className="flex flex-wrap items-center gap-2.5">
        {!reduced && (
          <button
            onClick={() => setPlaying((p) => !p)}
            className="flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-[13px] font-bold text-gold-2 transition-all hover:bg-gold/25 active:scale-95"
            aria-label={playing ? "توقف سفر" : "سفر خودکار در زمان"}
          >
            {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
            {playing ? "توقف سفر" : "سفر خودکار"}
          </button>
        )}
        {ERAS.map((e) => (
          <button
            key={e.fa}
            onClick={() => {
              setShowAll(false);
              setPlaying(false);
              setCenter(e.y);
            }}
            className={`rounded-full border px-4 py-2 text-[13px] font-bold transition-all active:scale-95 ${
              !showAll && Math.abs(center - e.y) < 4
                ? "border-gold-2 bg-gold-2 text-espresso"
                : "border-paper/25 text-paper/75 hover:border-gold-2/70 hover:text-gold-2"
            }`}
          >
            {e.fa}
          </button>
        ))}
        <button
          onClick={() => {
            setShowAll((s) => !s);
            setPlaying(false);
          }}
          className={`mr-auto rounded-full border px-4 py-2 text-[13px] font-bold transition-all active:scale-95 ${
            showAll ? "border-sienna-2 bg-sienna text-cream" : "border-paper/25 text-paper/75 hover:border-sienna-2/70 hover:text-sienna-2"
          }`}
        >
          تمام گنجینه · {toFa(ITEMS.length)}
        </button>
      </div>

      {/* خط‌کش قرن‌ها */}
      <div className="relative mt-8 h-44 overflow-hidden rounded-xl border border-paper/15 bg-black/25">
        {/* ستون‌های دهه‌ها */}
        <div className="absolute inset-x-3 bottom-9 top-3">
          {decades.map(({ d, n }) => {
            const inWin = !showAll && d + 10 > from && d < to;
            return (
              <div
                key={d}
                title={`دهه‌ی ${toFa(d)} · ${toFa(n)} شیء`}
                className="absolute bottom-0 rounded-t-[3px] transition-all duration-300"
                style={{
                  right: `${pct(d)}%`,
                  width: `${(10 / (MAX_YEAR - MIN_YEAR)) * 100}%`,
                  height: `${10 + (n / maxN) * 88}%`,
                  background: inWin ? "linear-gradient(180deg, rgba(224,118,74,0.85), rgba(185,138,47,0.75))" : "rgba(217,178,95,0.16)",
                }}
              />
            );
          })}
          {/* بازه‌ی روشن */}
          {!showAll && (
            <div
              className="pointer-events-none absolute bottom-0 top-0 rounded border border-dashed border-gold-2/50 bg-gold-2/5 transition-all duration-200"
              style={{ right: `${pct(from)}%`, width: `${pct(to) - pct(from)}%` }}
            />
          )}
          {/* نقطه‌ی اشیاء */}
          {ITEMS.map((i) => {
            const inWin = showAll || Math.abs(i.year - center) <= WINDOW / 2;
            return (
              <button
                key={i.id}
                onClick={() => onOpen(i)}
                title={`${i.name} · ${toFa(i.year)}`}
                aria-label={i.name}
                className="dot-item"
                style={{
                  right: `${pct(i.year)}%`,
                  top: dotTop(i.id),
                  background: DOT_COLORS[i.status],
                  opacity: inWin ? 1 : 0.18,
                  transform: `translateX(50%) scale(${inWin ? 1 : 0.7})`,
                }}
              />
            );
          })}
        </div>
        {/* برچسب دهه‌ها */}
        <div className="absolute inset-x-3 bottom-1.5 h-6">
          {[1800, 1820, 1840, 1860, 1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020].map((y) => (
            <span
              key={y}
              className="font-type absolute -translate-y-0 translate-x-1/2 text-[9px] tracking-wider text-paper/50"
              style={{ right: `${pct(y)}%` }}
              dir="ltr"
            >
              {toFa(y)}
            </span>
          ))}
        </div>
      </div>

      {/* لغزنده */}
      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
        <input
          type="range"
          className="time-range flex-1"
          min={MIN}
          max={MAX}
          step={1}
          value={center}
          disabled={showAll}
          onChange={(e) => {
            setPlaying(false);
            setCenter(Number(e.target.value));
          }}
          aria-label="لغزنده‌ی زمان"
        />
        <div className="shrink-0 text-center sm:text-left">
          <p className="font-display text-3xl font-bold leading-none text-gold-2">
            {showAll ? "همه‌ی دوران‌ها" : `${toFa(from)} تا ${toFa(to)}`}
          </p>
          <p className="font-type mt-1 text-[10px] tracking-[0.25em] text-paper/50" dir="ltr">
            {showAll ? "FULL COLLECTION" : `${toFa(visible.length)} OBJECTS IN WINDOW`}
          </p>
        </div>
      </div>

      {/* راهنمای رنگ‌ها */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {(Object.keys(STATUS) as StatusId[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-[11px] text-paper/70">
            <span className="h-2.5 w-2.5 rounded-full border border-espresso" style={{ background: DOT_COLORS[s] }} />
            {STATUS[s].fa}
          </span>
        ))}
        <span className="mr-auto text-[11px] text-paper/50">روی نقطه‌ها کلیک کنید تا پرونده باز شود</span>
      </div>

      {/* نتایج */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.slice(0, 24).map((it, i) => (
          <ItemCard
            key={it.id}
            item={it}
            index={i}
            saved={favs.includes(it.id)}
            onToggleSave={onToggleSave}
            onOpen={(x) => onOpen(x)}
          />
        ))}
      </div>
      {visible.length === 0 && (
        <p className="rounded-lg border border-dashed border-paper/25 py-12 text-center text-paper/60">
          در این بازه هنوز چیزی ثبت نشده؛ لغزنده را کمی جابه‌جا کنید.
        </p>
      )}
      {visible.length > 24 && (
        <p className="mt-6 text-center text-[13px] text-paper/60">
          و {toFa(visible.length - 24)} پرونده‌ی دیگر در همین بازه…
        </p>
      )}
    </div>
  );
};

/* ─────────────────────── مودال پرونده ─────────────────────── */

export const ItemModal: React.FC<{
  item: Item;
  list: Item[];
  saved: boolean;
  onClose: () => void;
  onNav: (i: Item) => void;
  onToggleSave: (i: Item) => void;
  onOpenItem: (i: Item) => void;
  onGotoCat: (id: Item["category"]) => void;
}> = ({ item, list, saved, onClose, onNav, onToggleSave, onOpenItem, onGotoCat }) => {
  const idx = Math.max(0, list.findIndex((x) => x.id === item.id));
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;
  const cat = catById(item.category);
  const CatIcon = CATEGORY_ICONS[cat.icon];
  const panelRef = useRef<HTMLDivElement>(null);

  const related = useMemo(
    () =>
      ITEMS.filter((x) => x.category === item.category && x.id !== item.id)
        .sort((a, b) => Math.abs(a.year - item.year) - Math.abs(b.year - item.year))
        .slice(0, 3),
    [item]
  );

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && next) onNav(next);
      if (e.key === "ArrowRight" && prev) onNav(prev);
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose, onNav, next, prev]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div className="fade-in absolute inset-0 bg-espresso/75 backdrop-blur-[3px]" onClick={onClose} aria-hidden />
      <div
        key={item.id}
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`پرونده‌ی ${item.name}`}
        className="modal-panel aged-card relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl outline-none sm:rounded-2xl"
      >
        <button
          onClick={onClose}
          aria-label="بستن پرونده"
          className="absolute left-3.5 top-3.5 z-20 grid h-9 w-9 place-items-center rounded-full border border-line-2 bg-cream/90 text-ink-2 transition-all hover:rotate-90 hover:border-sienna hover:text-sienna active:scale-90"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="grid md:grid-cols-[300px_1fr]">
          {/* لوح نمایش */}
          <aside className="dark-panel relative flex flex-col items-center justify-center gap-4 overflow-hidden p-8 text-center md:min-h-[520px]">
            <div className="beam lamp-glow pointer-events-none absolute inset-0" aria-hidden />
            <div className="scanlines pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <span className="font-type relative text-[10px] tracking-[0.3em] text-gold-2/80" dir="ltr">
              EXHIBIT № {plaqueNo(idx + 1)}
            </span>
            <span className="animate-bob relative text-[88px] leading-none drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)] emoji-aged">
              {item.image}
            </span>
            <span key={`st-${item.id}`} className="stamp stamp-in relative !text-[13px]" style={{ color: "#e8c07a" }}>
              {STATUS[item.status].fa}
            </span>
            <div className="relative grid w-full grid-cols-2 gap-2 text-paper/85">
              <div className="rounded-lg border border-paper/15 bg-black/25 px-3 py-2.5">
                <p className="text-[10px] text-paper/55">سال تولد</p>
                <p className="font-display text-2xl font-bold text-gold-2">{toFa(item.year)}</p>
              </div>
              <div className="rounded-lg border border-paper/15 bg-black/25 px-3 py-2.5">
                <p className="text-[10px] text-paper/55">دوران اوج</p>
                <p className="font-display text-lg font-bold leading-7 text-gold-2">{item.era}</p>
              </div>
            </div>
            <button
              onClick={() => onToggleSave(item)}
              className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-bold transition-all active:scale-95 ${
                saved
                  ? "border-gold-2 bg-gold-2 text-espresso"
                  : "border-paper/30 text-paper/85 hover:border-gold-2 hover:text-gold-2"
              }`}
            >
              <BookmarkIcon className="h-4 w-4" filled={saved} />
              {saved ? "در دفترچه‌ی شماست" : "بردن به دفترچه"}
            </button>
          </aside>

          {/* متن پرونده */}
          <div className="p-6 sm:p-8">
            <button
              onClick={() => onGotoCat(item.category)}
              className="group inline-flex items-center gap-2 rounded-full border border-line-2 bg-cream/70 px-3 py-1 text-[11px] font-bold text-ink-2 transition-colors hover:border-gold hover:text-gold-3"
            >
              <CatIcon className="h-4 w-4 text-gold-3" />
              {cat.fa}
              <ArrowNext className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
            </button>
            <h2 className="font-display mt-3 text-4xl font-bold leading-tight text-ink sm:text-5xl">{item.name}</h2>
            <p className="font-type mt-1 text-[11px] tracking-[0.3em] text-ink-3" dir="ltr">
              {item.nameEn}
            </p>

            <p className="mt-5 text-[15px] leading-8 text-ink-2">{item.long}</p>

            {/* شناسنامه */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { l: "سازنده / پدیدآور", v: item.specs.maker },
                { l: "خاستگاه", v: item.specs.country },
                { l: "سرنوشت", v: item.specs.fate },
              ].map((s, i) => (
                <div key={i} className="rounded-lg border border-line bg-paper-2/60 p-3.5">
                  <p className="font-type text-[9px] tracking-[0.25em] text-gold-3" dir="ltr">
                    {["MAKER", "ORIGIN", "FATE"][i]}
                  </p>
                  <p className="mt-1 text-[13px] font-bold leading-6 text-ink">{s.v}</p>
                </div>
              ))}
            </div>

            {/* تایم‌لاین نسل‌ها */}
            <Reveal className="mt-8">
              <p className="font-type text-[10px] tracking-[0.3em] text-gold-3" dir="ltr">
                EVOLUTION TIMELINE
              </p>
              <h3 className="font-display mt-1 text-3xl font-bold text-ink">سال‌های تحول</h3>
              <div className="relative mt-5 pr-5">
                <span className="grow-line absolute bottom-1 right-[7px] top-1 w-px bg-gradient-to-b from-gold via-line-2 to-transparent" />
                <ol className="space-y-5">
                  {item.milestones.map((m) => (
                    <li key={m.year} className="relative">
                      <span className="absolute -right-5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-gold-3 bg-cream shadow-[0_0_0_3px_rgba(185,138,47,0.18)]" />
                      <p className="font-type text-[12px] font-bold text-sienna">{toFa(m.year)}</p>
                      <p className="mt-0.5 text-[14.5px] font-bold text-ink">{m.title}</p>
                      <p className="mt-0.5 text-[13px] leading-6 text-ink-2">{m.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            {/* اشیای هم‌تالار */}
            {related.length > 0 && (
              <div className="mt-8">
                <p className="text-[12px] font-bold text-ink-3">از همین تالار:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {related.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onOpenItem(r)}
                      className="flex items-center gap-2 rounded-full border border-line-2 bg-cream/70 px-3 py-1.5 text-[12.5px] font-bold text-ink-2 transition-all hover:-translate-y-0.5 hover:border-sienna hover:text-sienna active:scale-95"
                    >
                      <span className="text-base">{r.image}</span>
                      {r.name}
                      <span className="font-type text-[10px] text-ink-3">{toFa(r.year)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* پیمایش پرونده‌ها */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-dashed border-line-2 pt-5">
              {prev ? (
                <button
                  onClick={() => onNav(prev)}
                  className="group flex min-w-0 items-center gap-2 text-right transition-colors hover:text-sienna"
                >
                  <ArrowPrev className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="block text-[10px] text-ink-3">قبلی</span>
                    <span className="block truncate text-[13px] font-bold">{prev.name}</span>
                  </span>
                </button>
              ) : (
                <span />
              )}
              {next ? (
                <button
                  onClick={() => onNav(next)}
                  className="group flex min-w-0 items-center gap-2 text-left transition-colors hover:text-sienna"
                >
                  <span className="min-w-0">
                    <span className="block text-left text-[10px] text-ink-3">بعدی</span>
                    <span className="block truncate text-left text-[13px] font-bold">{next.name}</span>
                  </span>
                  <ArrowNext className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                </button>
              ) : (
                <span />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────── دفترچه‌ی بازدیدکننده ─────────────────────── */

export const FavoritesDrawer: React.FC<{
  open: boolean;
  items: Item[];
  onClose: () => void;
  onOpen: (i: Item) => void;
  onRemove: (i: Item) => void;
}> = ({ open, items, onClose, onOpen, onRemove }) => {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  return (
    <>
      {open && <div className="fade-in fixed inset-0 z-[75] bg-espresso/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />}
      <aside
        className={`drawer dark-panel fixed inset-y-0 left-0 z-[80] flex w-[320px] max-w-[88vw] flex-col border-r border-gold/25 ${open ? "open" : ""}`}
        aria-hidden={!open}
        aria-label="دفترچه‌ی بازدیدکننده"
      >
        <div className="flex items-center justify-between border-b border-paper/10 p-5">
          <div>
            <p className="font-type text-[9px] tracking-[0.3em] text-gold-2/70" dir="ltr">
              VISITOR'S NOTEBOOK
            </p>
            <h3 className="font-display mt-0.5 text-2xl font-bold text-paper">دفترچه‌ی شما</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن دفترچه"
            className="grid h-9 w-9 place-items-center rounded-full border border-paper/25 text-paper/80 transition-all hover:rotate-90 hover:border-gold-2 hover:text-gold-2"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-paper/25 p-6 text-center">
              <TicketIcon className="mx-auto h-10 w-10 text-gold-2/60" />
              <p className="font-display mt-3 text-xl font-bold text-paper/85">هنوز خالی است</p>
              <p className="mt-2 text-[12.5px] leading-6 text-paper/60">
                روی نشانه‌ی «نشانک» هر کارت بزنید تا آن شیء به دفترچه‌تان بیاید و اینجا ماندگار شود.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="rise-in group flex items-center gap-3 rounded-xl border border-paper/12 bg-black/25 p-2.5 transition-colors hover:border-gold/40"
                >
                  <button
                    onClick={() => onOpen(i)}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/20 bg-espresso-2 text-xl emoji-aged transition-transform group-hover:scale-110"
                    aria-label={i.name}
                  >
                    {i.image}
                  </button>
                  <button onClick={() => onOpen(i)} className="min-w-0 flex-1 text-right">
                    <span className="block truncate text-[13.5px] font-bold text-paper group-hover:text-gold-2">
                      {i.name}
                    </span>
                    <span className="font-type block text-[10px] text-paper/50">
                      {catById(i.category).fa} · {toFa(i.year)}
                    </span>
                  </button>
                  <button
                    onClick={() => onRemove(i)}
                    aria-label={`حذف ${i.name} از دفترچه`}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-paper/40 transition-all hover:bg-sienna/25 hover:text-sienna-2 active:scale-90"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="border-t border-paper/10 p-4 text-center text-[11px] text-paper/45">
          {toFa(items.length)} شیء در دفترچه · حتی اگر مرورگر را ببندید، همین‌جا می‌مانند
        </p>
      </aside>
    </>
  );
};

/* ─────────────────────── دفتر یادگاری ─────────────────────── */

type Note = { name: string; text: string; at: number };

const SEED_NOTES: Note[] = [
  { name: "نرگس از تهران", text: "بوی کاربنِ دفتر مشقِ مادربزرگم آمد توی دماغم. دمتان گرم.", at: Date.now() - 3 * 86400000 },
  { name: "امیر", text: "پرونده‌ی وِکترِکس را باز کردم و ده دقیقه خیره ماندم. چه ایده‌ای بوده!", at: Date.now() - 86400000 },
  { name: "لیلا", text: "برای یخدانِ خانه‌مان یک دقیقه سکوت گرفتیم. روحت شاد یخدان جان.", at: Date.now() - 5 * 3600000 },
];

export const Guestbook: React.FC<{ onStamp?: () => void }> = ({ onStamp }) => {
  const [notes, setNotes] = useLocalStorage<Note[]>("sf-guestbook", SEED_NOTES);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      setErr("هم نام و هم یادداشت لازم است؛ حتی یک جمله‌ی کوتاه.");
      return;
    }
    setNotes((prev) => [{ name: name.trim(), text: text.trim(), at: Date.now() }, ...prev].slice(0, 30));
    setName("");
    setText("");
    setErr("");
    onStamp?.();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
      <Reveal>
        <div className="aged-card rounded-xl p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-line-2 bg-cream text-sienna">
              <QuillIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-type text-[9px] tracking-[0.3em] text-gold-3" dir="ltr">
                GUESTBOOK
              </p>
              <h3 className="font-display text-3xl font-bold text-ink">دفتر یادگاری</h3>
            </div>
          </div>
          <p className="mt-4 text-[13.5px] leading-7 text-ink-2">
            در موزه‌های قدیم، آخرِ بازدید یک دفتر می‌گذاشتند تا آدم‌ها چیزی از خودشان جا بگذارند.
            اگر یکی از این اشیاء، شما را به جایی برد، اینجا بنویسید.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام یا نام مستعار"
              maxLength={40}
              className="w-full rounded-lg border border-line-2 bg-cream px-4 py-2.5 text-[14px] text-ink outline-none transition-all placeholder:text-ink-3/70 focus:border-gold focus:shadow-[0_0_0_3px_rgba(185,138,47,0.15)]"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="یادگاری‌تان را بنویسید…"
              rows={3}
              maxLength={220}
              className="w-full resize-none rounded-lg border border-line-2 bg-cream px-4 py-2.5 text-[14px] leading-7 text-ink outline-none transition-all placeholder:text-ink-3/70 focus:border-gold focus:shadow-[0_0_0_3px_rgba(185,138,47,0.15)]"
            />
            {err && <p className="text-[12px] font-bold text-sienna">{err}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-sienna px-4 py-2.5 text-[14px] font-bold text-cream shadow-[0_10px_22px_-10px_rgba(168,67,31,0.7)] transition-all hover:-translate-y-0.5 hover:bg-sienna-2 active:translate-y-0 active:scale-[0.98]"
            >
              مُهر زدن بر دفتر
            </button>
          </form>
        </div>
      </Reveal>

      <div className="grid content-start gap-4 sm:grid-cols-2">
        {notes.slice(0, 8).map((n, i) => (
          <Reveal key={n.at + n.name} delay={(i % 2) * 90}>
            <div className={`paper-note wobble-slow rounded-lg p-4 pt-5 ${i % 2 ? "rotate-[1.2deg]" : "-rotate-[1.2deg]"}`}>
              <p className="text-[13.5px] leading-7 text-ink-2">«{n.text}»</p>
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-line-2 pt-2.5">
                <span className="font-display text-lg font-bold text-sienna">{n.name}</span>
                <span className="font-type text-[10px] text-ink-3">{new Date(n.at).toLocaleDateString("fa-IR")}</span>
              </div>
            </div>
          </Reveal>
        ))}
        {notes.length === 0 && (
          <p className="rounded-lg border border-dashed border-line-2 py-10 text-center text-[13px] text-ink-3 sm:col-span-2">
            هنوز کسی یادگاری نگذاشته؛ نخستین نفر شما باشید.
          </p>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────── درهای ورودی ─────────────────────── */

export const IntroOverlay: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const TITLE = "شهرفرنگ";
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (phase === 0) {
      if (n < TITLE.length) {
        const t = window.setTimeout(() => setN(n + 1), 115);
        return () => window.clearTimeout(t);
      }
      const t = window.setTimeout(() => setPhase(1), 420);
      return () => window.clearTimeout(t);
    }
    if (phase === 1) {
      const t = window.setTimeout(() => setPhase(2), 1150);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(onDone, 950);
    return () => window.clearTimeout(t);
  }, [phase, n, onDone]);

  const doorStyle: React.CSSProperties = {
    backgroundImage: "repeating-linear-gradient(90deg, rgba(185,138,47,0.07) 0 2px, transparent 2px 30px)",
  };

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-espresso ${phase === 2 ? "doors-open" : ""}`}
      onClick={() => phase < 2 && setPhase(2)}
      role="presentation"
    >
      <div className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${phase === 2 ? "opacity-0" : "opacity-100"}`}>
        <div className="px-6 text-center">
          <StarBurst className="animate-spin-slow mx-auto mb-5 h-10 w-10 text-gold-2" />
          <h1 className="font-display min-h-[1.1em] text-7xl font-bold leading-none text-paper sm:text-8xl">
            {TITLE.slice(0, n)}
            {n < TITLE.length && <span className="caret" />}
          </h1>
          {phase >= 1 && (
            <>
              <p className="font-display rise-in mt-3 text-2xl text-gold-2 sm:text-3xl">موزه‌ی اشیای بازنشسته</p>
              <span className="stamp stamp-in mx-auto mt-6 w-fit !text-[12px]" style={{ color: "#d9b25f" }}>
                ورود آزاد · EST. 1801
              </span>
            </>
          )}
        </div>
      </div>
      <div className="door-panel absolute inset-y-0 right-0 w-[51%] border-l-2 border-gold/40 bg-espresso" data-side="right" style={doorStyle} />
      <div className="door-panel absolute inset-y-0 left-0 w-[51%] border-r-2 border-gold/40 bg-espresso" data-side="left" style={doorStyle} />
    </div>
  );
};
