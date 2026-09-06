/* ============================================================
   شهرفرنگ — اجزای رابط موزه (نسخه‌ی پیشرفته)
   ============================================================ */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ITEMS,
  MAX_YEAR,
  MIN_YEAR,
  STATUS,
  StatusId,
  WINDOW,
  catById,
  contemporaries,
  plaqueNo,
  searchItems,
  toFa,
  triviaOf,
  type Item,
} from "./data";
import {
  DECADES,
  GROUP_EMOJI,
  GROUP_LABEL,
  NOSTALGIA,
  type DecadeId,
  type NostGroup,
  type NostalgiaItem,
} from "./nostalgia";
import {
  CONSOLE_ITEM,
  GAMES,
  GENRES,
  PLATFORMS,
  platformOf,
  searchGames,
  type Game,
  type PlatformId,
} from "./games";
import { motifForGame, motifForMemory, type Motif } from "./note";
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

export const SearchBox: React.FC<{
  size?: "lg" | "sm";
  onOpen: (i: Item) => void;
  onOpenGame?: (g: Game) => void;
}> = ({ size = "lg", onOpen, onOpenGame }) => {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => searchItems(q).slice(0, 8), [q]);
  const gameResults = useMemo(() => (onOpenGame ? searchGames(q).slice(0, 3) : []), [q, onOpenGame]);
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

  const pickGame = (g: Game) => {
    onOpenGame?.(g);
    setFocus(false);
    setQ("");
    inputRef.current?.blur();
  };

  const gameRow = (g: Game) => {
    const p = platformOf(g.platform);
    return (
      <button
        key={`g-${g.id}`}
        onClick={() => pickGame(g)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-right transition-colors hover:bg-gold/15"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line-2 bg-espresso text-lg">
          {g.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-bold text-ink">
            <Hi text={g.name} q={q} />
          </span>
          <span className="block text-[11px] text-ink-3">
            🕹️ گنجینه‌ی بازی‌ها · {p.fa} · {toFa(g.year)}
          </span>
        </span>
        <ArrowNext className="h-3.5 w-3.5 shrink-0 text-gold-3" />
      </button>
    );
  };

  const gameBlock = onOpenGame && gameResults.length > 0 && (
    <>
      <p className="border-t border-line bg-paper-3/50 px-4 py-1.5 text-[10px] font-bold tracking-wider text-gold-3">
        از گنجینه‌ی بازی‌ها
      </p>
      {gameResults.map(gameRow)}
    </>
  );

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
            {results.map(row)}
            {gameBlock}
            {!results.length && !gameResults.length && (
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
            {results.length > 0 && <div className="divide-y divide-dashed divide-line">{results.map(row)}</div>}
            {gameBlock}
            {results.length > 0 && (
              <p className="border-t border-line bg-paper-2/60 px-4 py-2 text-[11px] text-ink-3">
                {toFa(results.length)} پرونده · برای جزییات کامل کلیک کنید
              </p>
            )}
            {!results.length && !gameResults.length && (
              <p className="px-4 py-6 text-center text-[13px] text-ink-3">
                چیزی با این نام در گنجینه نیست؛ شاید هنوز کسی اهدایش نکرده…
              </p>
            )}
          </div>      )}
    </div>
  );
};

/* ─────────────────────── عکس واقعی اشیاء (ویکی‌پدیا) ─────────────────────── */

const WIKI_OVERRIDES: Record<string, string> = {
  crttv: "Cathode-ray tube",
  tuberadio: "Radio",
  mechanicalmouse: "Computer mouse",
  punchcard: "Punched card",
  telegraph: "Electrical telegraph",
  sewingmachine: "Sewing machine",
  pocketcalc: "Calculator",
  "toyota-fj40": "Toyota Land Cruiser (J40)",
  "vw-type2": "Volkswagen Type 2",
  "lada-2101": "VAZ-2101",
  "willys-jeep": "Willys MB",
  "mercedes-300sl": "Mercedes-Benz 300 SL",
  "silver-ghost": "Rolls-Royce Silver Ghost",
  polaroid: "Polaroid",
  "crt-monitor": "Computer monitor",
  ps1: "PlayStation",
  "sega-master-system": "Master System",
  "sega-game-gear": "Game Gear",
  "pc-engine": "PC Engine",
  "3do": "3DO Interactive Multiplayer",
  wonderswan: "WonderSwan",
  "gameboy-advance": "Game Boy Advance",
  "sega-dreamcast": "Dreamcast",
  "magnavox-odyssey": "Magnavox Odyssey",
  delorean: "DeLorean DMC-12",
  "apple-ii": "Apple II",
  "ibm-pc-5150": "IBM Personal Computer",
  "dialup-modem": "Dial-up Internet access",
  "apple-newton": "Apple Newton",
  "psion-organizer": "Psion Organiser",
  teletype: "Teleprinter",
  "paper-tape": "Punched tape",
  "cd-writer": "CD-R",
  "magnetic-tape": "Magnetic tape",
  "core-memory": "Magnetic-core memory",
  "zip-drive": "Zip drive",
  "univac-1": "UNIVAC I",
  "flash-bulb": "Flash (photography)",
  "darkroom-enlarger": "Photographic enlarger",
  "8mm-projector": "8 mm film",
  "wax-cylinder": "Phonograph cylinder",
  "radio-gram-console": "Radiogram (furniture)",
  "nmt-network": "Nordic Mobile Telephone",
  wap: "Wireless Application Protocol",
  "ham-radio": "Amateur radio",
  "cb-radio": "Citizens band radio",
  "iridium-phone": "Satellite phone",
  "karaoke-machine": "Karaoke",
  "vhsc-camcorder": "VHS-C",
  hi8: "Hi8",
  super8: "Super 8 film",
  nickelodeon: "Nickelodeon (movie theater)",
  "shellac-78": "Gramophone record",
  "glass-plate": "Photographic plate",
  "rolleiflex-tlr": "Rolleiflex",
  "leica-rangefinder": "Leica III",
  "nikon-f-slr": "Nikon F",
  "film-110": "110 film",
  "film-135": "135 film",
  "aps-film": "Advanced Photo System",
  instamatic: "Instamatic",
  "stencil-duplicator": "Duplicating machine",
  "wax-seal": "Sealing wax",
  "ledger-book": "Ledger",
  "filing-cabinet": "Filing cabinet",
  "crank-sharpener": "Pencil sharpener",
  "typewriter-ribbon": "Typewriter ribbon",
  "mangal": "Brazier",
  "charcoal-iron": "Ironing",
  "oil-radiator": "Oil heater",
  "early-vacuum": "Vacuum cleaner",
  "vintage-toaster": "Toaster",
  "hand-washer": "Washing machine",
  "cast-iron-range": "Kitchen stove",
  "meat-grinder": "Meat grinder",
  "egg-beater": "Egg beater",
  "birdcage": "Birdcage",
  "thonet-chair": "Thonet",
  dynatac: "Motorola DynaTAC",
  "phone-book": "Telephone directory",
  "telegram-service": "Telegram",
  "tv-remote": "Remote control",
  "dot-matrix-printer": "Dot matrix printing",
  "daisy-wheel": "Daisy wheel printing",
};

const PHOTO_MEM = new Map<string, string | null>();
const cleanEn = (s: string) => s.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();

async function fetchPhoto(item: Item): Promise<string | null> {
  if (PHOTO_MEM.has(item.id)) return PHOTO_MEM.get(item.id) ?? null;
  let url: string | null = null;
  try {
    const cached = sessionStorage.getItem(`sf-photo:${item.id}`);
    if (cached) {
      url = cached === "0" ? null : cached;
    } else {
      let title = WIKI_OVERRIDES[item.id] ?? null;
      if (!title) {
        const q = cleanEn(item.nameEn);
        const r = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=1&namespace=0&format=json&origin=*`
        );
        if (r.ok) {
          const j = await r.json();
          title = (j?.[1]?.[0] as string) ?? null;
        }
      }
      if (title) {
        const r2 = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
        );
        if (r2.ok) {
          const s = await r2.json();
          url = s?.thumbnail?.source ?? s?.originalimage?.source ?? null;
        }
      }
      sessionStorage.setItem(`sf-photo:${item.id}`, url ?? "0");
    }
  } catch {
    url = null;
  }
  PHOTO_MEM.set(item.id, url);
  return url;
}

export const ItemPhoto: React.FC<{ item: Item; className?: string }> = ({ item, className = "" }) => {
  const [src, setSrc] = useState<string | null>(null);
  const { ref, inView } = useInView<HTMLSpanElement>(0.05);
  useEffect(() => {
    if (!inView) return;
    let live = true;
    fetchPhoto(item).then((u) => {
      if (live) setSrc(u);
    });
    return () => {
      live = false;
    };
  }, [inView, item]);
  return (
    <span ref={ref} className={className} aria-hidden>
      {src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="photo-aged h-full w-full rounded-[inherit] object-cover"
        />
      )}
    </span>
  );
};

const PHOTO_OVERLAY =
  "absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-700 has-[img]:opacity-100";

/* ── گالری عکس‌های اشیاء (چند تصویر از ویکی‌پدیا) ── */

type ObjMedia = { hero: string | null; gallery: string[] };
const OMEM = new Map<string, ObjMedia>();

async function fetchObjMedia(item: Item): Promise<ObjMedia> {
  if (OMEM.has(item.id)) return OMEM.get(item.id)!;
  const out: ObjMedia = { hero: null, gallery: [] };
  try {
    const ck = sessionStorage.getItem(`sf-om2:${item.id}`);
    if (ck) {
      const j = JSON.parse(ck) as ObjMedia;
      OMEM.set(item.id, j);
      return j;
    }
    let title = WIKI_OVERRIDES[item.id] ?? cleanEn(item.nameEn);
    const r = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(title)}&limit=1&namespace=0&format=json&origin=*`
    );
    if (r.ok) {
      const j = await r.json();
      title = (j?.[1]?.[0] as string) ?? title;
    }
    const s = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (s.ok) {
      const sj = await s.json();
      if (sj?.type !== "disambiguation") {
        out.hero = sj?.originalimage?.source ?? sj?.thumbnail?.source ?? null;
      }
    }
    const im = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&imlimit=20&format=json&origin=*`
    );
    if (im.ok) {
      const ij = await im.json();
      const pages = Object.values<any>(ij.query?.pages ?? {})[0] as any;
      const names: string[] = ((pages?.images ?? []) as { title: string }[])
        .map((x) => x.title)
        .filter((t) => /\.(jpe?g|png|webp)$/i.test(t))
        .filter(
          (t) =>
            !/svg|icon|logo|symbol|wiktionary|question_book|edit-clear|disambig|cscr|padlock|commons-logo|wikipedia|nospam|edit-icon/i.test(t)
        )
        .slice(0, 6);
      if (names.length) {
        const ii = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${names.map(encodeURIComponent).join("|")}&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`
        );
        if (ii.ok) {
          const iij = await ii.json();
          const urls = Object.values<any>(iij.query?.pages ?? {})
            .map((pg: any) => pg.imageinfo?.[0]?.thumburl ?? pg.imageinfo?.[0]?.url)
            .filter(Boolean) as string[];
          let gal = urls.slice(0, 4);
          if (out.hero && !gal.includes(out.hero)) gal = [out.hero, ...gal].slice(0, 4);
          out.gallery = gal;
          if (!out.hero && gal[0]) out.hero = gal[0];
        }
      }
    }
  } catch {
    /* آفلاین */
  }
  OMEM.set(item.id, out);
  try {
    sessionStorage.setItem(`sf-om2:${item.id}`, JSON.stringify(out));
  } catch {
    /* کش پر */
  }
  return out;
}

const faToEn = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

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
          <span className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-double border-gold-3 bg-[radial-gradient(circle_at_50%_35%,#fdf6e2,#e7d3a6_80%)] shadow-[inset_0_3px_12px_rgba(120,80,30,0.3)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <span className="text-4xl emoji-aged">{item.image}</span>
            <ItemPhoto item={item} className={PHOTO_OVERLAY} />
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
        <span className="relative mx-auto grid h-[84px] w-[84px] place-items-center overflow-hidden rounded-full border-[3px] border-double border-gold-3 bg-[radial-gradient(circle_at_50%_35%,#fdf6e2,#e7d3a6_80%)] shadow-[inset_0_4px_14px_rgba(120,80,30,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
          <span className="text-[42px] leading-none emoji-aged">{item.image}</span>
          <ItemPhoto item={item} className={PHOTO_OVERLAY} />
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
        <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border-4 border-double border-gold-3 bg-[radial-gradient(circle_at_50%_35%,#fdf6e2,#e7d3a6_80%)] shadow-[inset_0_4px_16px_rgba(120,80,30,0.35),0_8px_18px_-10px_rgba(43,32,20,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-20 sm:w-20">
          <span className="text-3xl emoji-aged sm:text-4xl">{i.image}</span>
          <ItemPhoto item={i} className={PHOTO_OVERLAY} />
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
    <div className="relative z-10 overflow-hidden border-y border-gold/25 bg-espresso">
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

const CHAPTERS = [
  { y: 1805, fa: "عصر اختراع" },
  { y: 1865, fa: "عصر بخار و برق" },
  { y: 1925, fa: "عصر رادیو" },
  { y: 1955, fa: "عصر تلویزیون" },
  { y: 1978, fa: "عصر دیجیتال" },
  { y: 2002, fa: "عصر اینترنت" },
];

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
  const [hover, setHover] = useState<Item | null>(null);
  const decade = Math.floor(center / 10) * 10;
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
      <div
        className="relative mt-8 h-48 overflow-hidden rounded-xl border border-paper/15 bg-black/25"
        onMouseLeave={() => setHover(null)}
      >
        {/* فصل‌های تاریخ */}
        <div className="absolute inset-x-3 top-1.5 h-6">
          {CHAPTERS.map((c) => (
            <span
              key={c.y}
              className="absolute hidden translate-x-1/2 whitespace-nowrap rounded-full border border-gold/25 bg-black/30 px-2 py-0.5 text-[9px] font-bold text-gold-2/80 sm:block"
              style={{ right: `${pct(c.y)}%` }}
            >
              {c.fa}
            </span>
          ))}
        </div>
        {/* ستون‌های دهه‌ها + نقاط */}
        <div className="absolute inset-x-3 bottom-9 top-9">
          {decades.map(({ d, n }, bi) => {
            const inWin = !showAll && d + 10 > from && d < to;
            return (
              <div
                key={d}
                title={`دهه‌ی ${toFa(d)} · ${toFa(n)} شیء`}
                className="grow-y absolute bottom-0 rounded-t-[3px] transition-all duration-300"
                style={{
                  right: `${pct(d)}%`,
                  width: `${(10 / (MAX_YEAR - MIN_YEAR)) * 100}%`,
                  height: `${10 + (n / maxN) * 88}%`,
                  animationDelay: `${Math.min(bi * 25, 500)}ms`,
                  background: inWin
                    ? "linear-gradient(180deg, rgba(224,118,74,0.9), rgba(185,138,47,0.75))"
                    : "rgba(217,178,95,0.16)",
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
          {/* سرِ متحرک زمان */}
          {!showAll && <span className="playhead" style={{ right: `${pct(center)}%` }} aria-hidden />}
          {/* نقطه‌ی اشیاء */}
          {ITEMS.map((i) => {
            const inWin = showAll || Math.abs(i.year - center) <= WINDOW / 2;
            return (
              <button
                key={i.id}
                onClick={() => onOpen(i)}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                title={`${i.name} · ${toFa(i.year)}`}
                aria-label={i.name}
                className="dot-item"
                style={{
                  right: `${pct(i.year)}%`,
                  top: dotTop(i.id),
                  background: DOT_COLORS[i.status],
                  opacity: inWin ? 1 : 0.18,
                  transform: `translateX(50%) scale(${hover?.id === i.id ? 1.8 : inWin ? 1 : 0.7})`,
                  boxShadow: hover?.id === i.id ? `0 0 0 5px ${DOT_COLORS[i.status]}33` : undefined,
                }}
              />
            );
          })}
          {/* پیش‌نمایش نقطه‌ی زیرِ نشانگر */}
          {hover && (
            <div
              className="fade-in pointer-events-none absolute z-20 w-48 translate-x-1/2 rounded-lg border border-gold/40 bg-espresso p-2.5 shadow-[0_16px_32px_rgba(0,0,0,0.55)]"
              style={{ right: `${pct(hover.year)}%`, top: "-0.4rem" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl emoji-aged">{hover.image}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-bold text-paper">{hover.name}</span>
                  <span className="font-type block text-[10px] text-gold-2">{toFa(hover.year)} · برای پرونده کلیک کنید</span>
                </span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: DOT_COLORS[hover.status] }} />
              </div>
            </div>
          )}
        </div>
        {/* برچسب دهه‌ها */}
        <div className="absolute inset-x-3 bottom-1.5 h-6">
          {[1800, 1820, 1840, 1860, 1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020].map((y) => (
            <span
              key={y}
              className="font-type absolute translate-x-1/2 text-[9px] tracking-wider text-paper/50"
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
            {showAll ? (
              <span key="all" className="decade-flip">همه‌ی دوران‌ها</span>
            ) : (
              <>
                <span key={`d-${decade}`} className="decade-flip">دهه‌ی {toFa(decade)}</span>
                <span className="mx-1.5 text-lg text-paper/50">·</span>
                <span className="text-2xl">{toFa(from)} تا {toFa(to)}</span>
              </>
            )}
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
  const [birth, setBirth] = useState("");
  const peers = contemporaries(item, 4);

  const [omedia, setOmedia] = useState<ObjMedia | null>(null);
  const [omain, setOmain] = useState(0);
  const [ofail, setOfail] = useState(false);
  useEffect(() => {
    let live = true;
    setOmedia(null);
    setOmain(0);
    setOfail(false);
    fetchObjMedia(item).then((m) => {
      if (live) setOmedia(m);
    });
    return () => {
      live = false;
    };
  }, [item]);
  const ophotos = useMemo(() => {
    if (!omedia) return [];
    const arr = [...(omedia.hero ? [omedia.hero] : []), ...omedia.gallery.filter((x) => x !== omedia.hero)];
    return Array.from(new Set(arr)).slice(0, 4);
  }, [omedia]);
  const ohero = ophotos[omain] ?? null;
  const oshow = !!ohero && !ofail;

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
        className="modal-panel aged-card relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-t-2xl outline-none sm:rounded-2xl"
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

        <div className="grid md:grid-cols-[360px_1fr]">
          {/* لوح نمایش */}
          <aside className="dark-panel relative flex flex-col items-center justify-center gap-4 overflow-hidden p-6 text-center md:min-h-[560px] sm:p-8">
            <div className="beam lamp-glow pointer-events-none absolute inset-0" aria-hidden />
            <div className="scanlines pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            {/* صحنه‌ی نمایش بزرگ با گالری */}
            <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-gold/30 bg-espresso-2 shadow-[0_28px_60px_-20px_rgba(0,0,0,0.85)] sm:h-72 md:h-64">
              <span className="beam lamp-glow pointer-events-none absolute inset-0" aria-hidden />
              {oshow ? (
                <img
                  key={ohero}
                  src={ohero!}
                  alt={`تصویر ${item.name}`}
                  referrerPolicy="no-referrer"
                  onError={() => setOfail(true)}
                  className="fade-in photo-aged h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full w-full place-items-center">
                  <span className="animate-bob text-[96px] leading-none drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)] emoji-aged">
                    {item.image}
                  </span>
                </span>
              )}
              <span className="scanlines pointer-events-none absolute inset-0 opacity-25" aria-hidden />
              <span className="font-type absolute right-2.5 top-2.5 rounded bg-espresso/85 px-2 py-0.5 text-[9px] tracking-[0.25em] text-gold-2">
                EXHIBIT № {plaqueNo(idx + 1)}
              </span>
              {oshow && (
                <span className="absolute bottom-2 left-2.5 rounded bg-espresso/80 px-2 py-0.5 text-[9.5px] text-paper/70">
                  عکس واقعی · ویکی‌پدیا
                </span>
              )}
              {ophotos.length > 1 && (
                <>
                  <button
                    onClick={() => setOmain((omain + ophotos.length - 1) % ophotos.length)}
                    aria-label="تصویر قبلی"
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-espresso/70 text-paper/90 transition-all hover:bg-espresso active:scale-90"
                  >
                    <ArrowPrev className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setOmain((omain + 1) % ophotos.length)}
                    aria-label="تصویر بعدی"
                    className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-espresso/70 text-paper/90 transition-all hover:bg-espresso active:scale-90"
                  >
                    <ArrowNext className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
            {/* بندانگشتی‌های گالری — با کلیک، در همان ابعاد بزرگ دیده می‌شود */}
            {ophotos.length > 1 && (
              <div className="flex w-full items-center justify-center gap-2">
                {ophotos.map((p, i) => (
                  <button
                    key={p}
                    onClick={() => {
                      setOfail(false);
                      setOmain(i);
                    }}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all active:scale-95 ${
                      i === omain ? "border-gold-2 opacity-100 ring-1 ring-gold-2" : "border-paper/20 opacity-55 hover:opacity-90"
                    }`}
                    aria-label={`تصویر ${toFa(i + 1)} از ${item.name}`}
                  >
                    <img src={p} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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

            {/* دانستنی‌های جالب */}
            {triviaOf(item.id) && (
              <div className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-4">
                <p className="font-type text-[9px] tracking-[0.3em] text-gold-3" dir="ltr">
                  DID YOU KNOW?
                </p>
                <h4 className="font-display mt-0.5 text-2xl font-bold text-ink">دانستنی‌های جالب</h4>
                <ul className="mt-2.5 space-y-2">
                  {triviaOf(item.id)!.map((t, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-6 text-ink-2">
                      <span className="mt-0.5 shrink-0 text-gold-3">✦</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* سن‌سنج خاطره */}
            <div className="mt-6 rounded-xl border border-line bg-paper-2/60 p-4">
              <h4 className="font-display text-2xl font-bold text-ink">سن‌سنج خاطره</h4>
              <p className="mt-1 text-[12.5px] leading-6 text-ink-3">
                سال تولدتان (شمسی) را بنویسید تا بگوییم این شیء چه نسبتی با شما دارد:
              </p>
              <input
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                placeholder="مثلاً ۱۳۶۵"
                inputMode="numeric"
                maxLength={4}
                className="mt-2.5 w-32 rounded-lg border border-line-2 bg-cream px-3 py-2 text-center text-[15px] font-bold text-ink outline-none transition-all focus:border-gold focus:shadow-[0_0_0_3px_rgba(185,138,47,0.15)]"
                aria-label="سال تولد شمسی"
              />
              {(() => {
                const n = parseInt(faToEn(birth).replace(/\D/g, ""), 10);
                if (!n || n < 1300 || n > 1405) return null;
                const diff = n + 621 - item.year;
                return (
                  <p className="rise-in mt-2.5 rounded-lg bg-cream px-3 py-2 text-[13px] font-bold leading-6 text-sienna">
                    {diff >= 0
                      ? `وقتی در سال ${toFa(n)} به دنیا آمدید، این شیء ${toFa(diff)} ساله بود${diff === 0 ? "؛ درست هم‌سن خودتان!" : "!"}`
                      : `این شیء ${toFa(-diff)} سال بعد از شما متولد شد؛ شانس نیاوردید با هم بزرگ شوید.`}
                  </p>
                );
              })()}
            </div>

            {/* هم‌دوره‌ها */}
            {peers.length > 0 && (
              <div className="mt-6">
                <p className="text-[12px] font-bold text-ink-3">هم‌دوره‌های این شیء در سایر تالارها (±۱۰ سال):</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {peers.map((r) => (
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
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(onDone, 80);
      return () => window.clearTimeout(t);
    }
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
  }, [phase, n, onDone, reduced]);

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

/* ─────────────────────── عکس واقعی خاطره‌ها ─────────────────────── */

type WikiQuery = { q: string; lang: "fa" | "en" };
const WIKI_MEM = new Map<string, string | null>();

async function fetchWikiThumb(queries: WikiQuery[]): Promise<string | null> {
  const key = queries.map((x) => `${x.lang}:${x.q}`).join("|");
  if (WIKI_MEM.has(key)) return WIKI_MEM.get(key) ?? null;
  let url: string | null = null;
  try {
    const ck = `sf-wiki:${key.slice(0, 70)}`;
    const cached = sessionStorage.getItem(ck);
    if (cached) {
      url = cached === "0" ? null : cached;
    } else {
      for (const { q, lang } of queries) {
        try {
          const r = await fetch(
            `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=1&namespace=0&format=json&origin=*`
          );
          if (!r.ok) continue;
          const j = await r.json();
          const title = j?.[1]?.[0] as string | undefined;
          if (!title) continue;
          const r2 = await fetch(
            `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
          );
          if (!r2.ok) continue;
          const s = await r2.json();
          const u = (s?.thumbnail?.source ?? s?.originalimage?.source) as string | undefined;
          if (u) {
            url = u;
            break;
          }
        } catch {
          /* پرس‌وجوی بعدی */
        }
      }
      try {
        sessionStorage.setItem(ck, url ?? "0");
      } catch {
        /* بی‌خیال */
      }
    }
  } catch {
    url = null;
  }
  WIKI_MEM.set(key, url);
  return url;
}

const NostalgiaPhoto: React.FC<{ n: NostalgiaItem; className?: string }> = ({ n, className = "" }) => {
  const linked = n.itemRef ? ITEMS.find((i) => i.id === n.itemRef) : undefined;
  const [src, setSrc] = useState<string | null>(null);
  const { ref, inView } = useInView<HTMLSpanElement>(0.05);
  useEffect(() => {
    if (linked || !inView || !n.photo) return;
    let live = true;
    fetchWikiThumb([
      { q: n.photo, lang: "en" },
      { q: n.title, lang: "fa" },
    ]).then((u) => live && setSrc(u));
    return () => {
      live = false;
    };
  }, [inView, linked, n]);
  if (linked) return <ItemPhoto item={linked} className={className} />;
  return (
    <span ref={ref} className={className} aria-hidden>
      {src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="photo-aged h-full w-full rounded-[inherit] object-cover"
        />
      )}
    </span>
  );
};

/* ── گالری چندتصویری برای خاطره‌ها ── */

async function mediaForEnTitle(titleIn: string): Promise<ObjMedia> {
  const key = `sf-em2:${titleIn}`;
  if (OMEM.has(key)) return OMEM.get(key)!;
  const out: ObjMedia = { hero: null, gallery: [] };
  try {
    const ck = sessionStorage.getItem(key);
    if (ck) {
      const j = JSON.parse(ck) as ObjMedia;
      OMEM.set(key, j);
      return j;
    }
    let title = titleIn;
    const r = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(title)}&limit=1&namespace=0&format=json&origin=*`
    );
    if (r.ok) {
      const j = await r.json();
      title = (j?.[1]?.[0] as string) ?? title;
    }
    const s = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (s.ok) {
      const sj = await s.json();
      if (sj?.type !== "disambiguation") {
        out.hero = sj?.originalimage?.source ?? sj?.thumbnail?.source ?? null;
      }
    }
    const im = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&imlimit=20&format=json&origin=*`
    );
    if (im.ok) {
      const ij = await im.json();
      const pages = Object.values<any>(ij.query?.pages ?? {})[0] as any;
      const names: string[] = ((pages?.images ?? []) as { title: string }[])
        .map((x) => x.title)
        .filter((t) => /\.(jpe?g|png|webp)$/i.test(t))
        .filter(
          (t) =>
            !/svg|icon|logo|symbol|wiktionary|question_book|edit-clear|disambig|cscr|padlock|commons-logo|wikipedia|nospam|edit-icon/i.test(t)
        )
        .slice(0, 6);
      if (names.length) {
        const ii = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${names.map(encodeURIComponent).join("|")}&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`
        );
        if (ii.ok) {
          const iij = await ii.json();
          const urls = Object.values<any>(iij.query?.pages ?? {})
            .map((pg: any) => pg.imageinfo?.[0]?.thumburl ?? pg.imageinfo?.[0]?.url)
            .filter(Boolean) as string[];
          let gal = urls.slice(0, 4);
          if (out.hero && !gal.includes(out.hero)) gal = [out.hero, ...gal].slice(0, 4);
          out.gallery = gal;
          if (!out.hero && gal[0]) out.hero = gal[0];
        }
      }
    }
  } catch {
    /* آفلاین */
  }
  OMEM.set(key, out);
  try {
    sessionStorage.setItem(key, JSON.stringify(out));
  } catch {
    /* کش پر */
  }
  return out;
}

const fetchNostMedia = async (n: NostalgiaItem): Promise<ObjMedia> => {
  const linked = n.itemRef ? ITEMS.find((i) => i.id === n.itemRef) : undefined;
  if (linked) return fetchObjMedia(linked);
  if (!n.photo) return { hero: null, gallery: [] };
  return mediaForEnTitle(n.photo);
};

const PHOTO_FADE = "absolute inset-0 opacity-0 transition-opacity duration-700 has-[img]:opacity-100";

/* ─────────────────────── مودال خاطره ─────────────────────── */

type NostItem = NostalgiaItem & { decade: DecadeId };

const NostalgiaModal: React.FC<{ n: NostItem; list: NostItem[]; onClose: () => void; onNav: (n: NostItem) => void }> = ({
  n,
  list,
  onClose,
  onNav,
}) => {
  const idx = Math.max(0, list.findIndex((x) => x.id === n.id));
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;
  const meta = DECADES.find((d) => d.id === n.decade)!;
  const shelfmates = NOSTALGIA.filter((x) => x.group === n.group && x.id !== n.id).slice(0, 4);
  const motif = useMemo(() => motifForMemory(n), [n]);

  const [nmedia, setNmedia] = useState<ObjMedia | null>(null);
  const [nmain, setNmain] = useState(0);
  const [nfail, setNfail] = useState(false);
  useEffect(() => {
    let live = true;
    setNmedia(null);
    setNmain(0);
    setNfail(false);
    fetchNostMedia(n).then((m) => {
      if (live) setNmedia(m);
    });
    return () => {
      live = false;
    };
  }, [n]);
  const nphotos = useMemo(() => {
    if (!nmedia) return [];
    const arr = [...(nmedia.hero ? [nmedia.hero] : []), ...nmedia.gallery.filter((x) => x !== nmedia.hero)];
    return Array.from(new Set(arr)).slice(0, 4);
  }, [nmedia]);
  const nhero = nphotos[nmain] ?? null;
  const nshow = !!nhero && !nfail;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && next) onNav(next);
      if (e.key === "ArrowRight" && prev) onNav(prev);
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose, onNav, next, prev]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div className="fade-in absolute inset-0 bg-espresso/75 backdrop-blur-[3px]" onClick={onClose} aria-hidden />
      <div
        key={n.id}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`خاطره‌ی ${n.title}`}
        className="modal-panel aged-card relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl outline-none sm:rounded-2xl"
      >
        <button
          onClick={onClose}
          aria-label="بستن خاطره"
          className="absolute left-3.5 top-3.5 z-20 grid h-9 w-9 place-items-center rounded-full border border-line-2 bg-cream/90 text-ink-2 transition-all hover:rotate-90 hover:border-sienna hover:text-sienna active:scale-90"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {/* قاب عکس خاطره — بزرگ و گالری‌دار */}
        <div className="border-b border-dashed border-line-2 p-4 sm:p-5">
          <div className="relative h-64 overflow-hidden rounded-xl border border-line-2 shadow-[inset_0_0_40px_rgba(120,80,30,0.18),0_18px_40px_-22px_rgba(43,32,20,0.6)] sm:h-80">
            <span className="sunburst absolute inset-0" aria-hidden />
            {nshow ? (
              <img
                key={nhero}
                src={nhero!}
                alt={`عکس ${n.title}`}
                referrerPolicy="no-referrer"
                onError={() => setNfail(true)}
                className="fade-in photo-aged absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-[96px] emoji-aged">{n.emoji}</span>
            )}
            <span className="scanlines absolute inset-0 opacity-25" aria-hidden />
            <span className="font-type absolute bottom-3 right-4 rounded bg-espresso/85 px-2.5 py-1 text-[10px] tracking-[0.25em] text-gold-2" dir="ltr">
              {meta.range}
            </span>
            <span className="stamp absolute bottom-3 left-4 !text-[11px]" style={{ color: nshow ? "#f3e3bd" : "#8a4b26" }}>
              {GROUP_LABEL[n.group]}
            </span>
            {nshow && (
              <span className="absolute right-4 top-3 rounded bg-espresso/80 px-2 py-0.5 text-[9.5px] text-paper/75">
                عکس واقعی · ویکی‌پدیا
              </span>
            )}
            {nphotos.length > 1 && (
              <>
                <button
                  onClick={() => setNmain((nmain + nphotos.length - 1) % nphotos.length)}
                  aria-label="عکس قبلی"
                  className="absolute right-2.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-espresso/70 text-paper/90 transition-all hover:bg-espresso active:scale-90"
                >
                  <ArrowPrev className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setNmain((nmain + 1) % nphotos.length)}
                  aria-label="عکس بعدی"
                  className="absolute left-2.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-espresso/70 text-paper/90 transition-all hover:bg-espresso active:scale-90"
                >
                  <ArrowNext className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {nphotos.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2.5">
              {nphotos.map((p, i) => (
                <button
                  key={p}
                  onClick={() => {
                    setNfail(false);
                    setNmain(i);
                  }}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all active:scale-95 ${
                    i === nmain ? "border-sienna opacity-100 ring-1 ring-sienna" : "border-line-2 opacity-55 hover:opacity-90"
                  }`}
                  aria-label={`عکس ${toFa(i + 1)} از ${n.title}`}
                >
                  <img src={p} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">{n.title}</h2>
          <p className="font-type mt-1 text-[11px] tracking-[0.25em] text-ink-3" dir="ltr">
            {meta.id === "60" ? "1981–1990" : meta.id === "70" ? "1991–2000" : "2001–2010"} · MEMORY FILE
          </p>

          <p className="font-display mt-4 border-s-4 border-gold ps-4 text-2xl font-medium leading-[1.9] text-ink-2">
            {n.text}
          </p>
          <p className="mt-4 text-[15px] leading-8 text-ink-2">{n.long}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-line-2 bg-cream px-3 py-1 text-[12px] font-bold text-ink-2">
              {GROUP_EMOJI[n.group]} {GROUP_LABEL[n.group]}
            </span>
            <span className="font-type rounded-full border border-line-2 bg-cream px-3 py-1 text-[12px] font-bold text-gold-3">
              {n.year}
            </span>
            <span className="rounded-full border border-line-2 bg-cream px-3 py-1 text-[12px] font-bold text-sienna">
              {meta.fa}
            </span>
          </div>

          {/* نغمه‌ی خاطره — حال‌وهوای موسیقی همان دهه */}
          <div className="mt-6 rounded-xl border border-line-2 bg-paper-2/70 p-4">
            <p className="font-type text-[9px] tracking-[0.3em] text-gold-3" dir="ltr">
              SOUND OF THE DECADE
            </p>
            <h4 className="font-display mt-0.5 text-2xl font-bold text-ink">نغمه‌ی این خاطره</h4>
            <p className="mt-1 text-[12px] leading-6 text-ink-3">
              {n.decade === "60"
                ? "با مایه‌هایی از دستگاه شور؛ همان حال‌وهوای ترانه‌های رادیوی دهه‌ی شصت."
                : n.decade === "70"
                ? "با مایه‌های پاپ دهه‌ی هفتاد؛ روزهای نوار کاست و ضبط صوت."
                : "با مایه‌های الکترونیک دهه‌ی هشتاد؛ از زنگ پلی‌فونیک تا کافه‌نت."}
            </p>
            <div className="mt-3">
              <MotifPlayer motif={motif} light pausedLabel="پخش نغمه‌ی خاطره" playingLabel="توقف نغمه" />
            </div>
          </div>

          {shelfmates.length > 0 && (
            <div className="mt-7">
              <p className="text-[12px] font-bold text-ink-3">از همین قفسه:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {shelfmates.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onNav(s)}
                    className="flex items-center gap-2 rounded-full border border-line-2 bg-cream/70 px-3 py-1.5 text-[12.5px] font-bold text-ink-2 transition-all hover:-translate-y-0.5 hover:border-sienna hover:text-sienna active:scale-95"
                  >
                    <span className="text-base">{s.emoji}</span>
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center justify-between gap-3 border-t border-dashed border-line-2 pt-5">
            {prev ? (
              <button onClick={() => onNav(prev)} className="group flex min-w-0 items-center gap-2 text-right transition-colors hover:text-sienna">
                <ArrowPrev className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                <span className="min-w-0">
                  <span className="block text-[10px] text-ink-3">قبلی</span>
                  <span className="block truncate text-[13px] font-bold">{prev.title}</span>
                </span>
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button onClick={() => onNav(next)} className="group flex min-w-0 items-center gap-2 text-left transition-colors hover:text-sienna">
                <span className="min-w-0">
                  <span className="block text-left text-[10px] text-ink-3">بعدی</span>
                  <span className="block truncate text-left text-[13px] font-bold">{next.title}</span>
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
  );
};

/* ─────────────────────── اتاق خاطره‌ی دهه‌ها ─────────────────────── */

const GROUP_IDS: NostGroup[] = ["tv", "play", "home", "school"];

export const NostalgiaSection: React.FC = () => {
  const [dec, setDec] = useState<DecadeId>("60");
  const [group, setGroup] = useState<"all" | NostGroup>("all");
  const [open, setOpen] = useState<NostItem | null>(null);
  const meta = DECADES.find((d) => d.id === dec)!;
  const items = NOSTALGIA.filter((n) => n.decade === dec && (group === "all" || n.group === group));

  return (
    <div>
      {/* تب‌های دهه */}
      <div className="flex flex-wrap items-stretch justify-center gap-3">
        {DECADES.map((d) => {
          const count = NOSTALGIA.filter((n) => n.decade === d.id).length;
          const active = dec === d.id;
          return (
            <button
              key={d.id}
              onClick={() => {
                setDec(d.id);
                setGroup("all");
              }}
              aria-pressed={active}
              className={`min-w-36 rounded-xl border-2 px-5 py-3 text-center transition-all duration-300 active:scale-95 sm:px-8 ${
                active
                  ? "-rotate-1 border-sienna bg-sienna text-cream shadow-[0_16px_32px_-12px_rgba(168,67,31,0.65)]"
                  : "border-line-2 bg-cream/70 text-ink-2 hover:-translate-y-1 hover:border-sienna hover:text-sienna"
              }`}
            >
              <span className="font-display block text-2xl font-bold leading-8 sm:text-3xl">{d.fa}</span>
              <span className={`block text-[11px] font-bold ${active ? "text-cream/85" : "text-ink-3"}`}>
                {toFa(count)} خاطره
              </span>
            </button>
          );
        })}
      </div>
      <p key={`tag-${dec}`} className="rise-in mt-4 text-center text-[14px] text-ink-3">
        <span className="font-type text-[11px] tracking-widest text-gold-3">{meta.range}</span>
        <span className="mx-2 text-line-2">·</span>
        {meta.tag}
      </p>

      {/* فیلتر قفسه‌ها */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setGroup("all")}
          className={`rounded-full border px-4 py-1.5 text-[13px] font-bold transition-all active:scale-95 ${
            group === "all"
              ? "border-ink bg-ink text-paper"
              : "border-line-2 bg-cream/60 text-ink-2 hover:border-ink"
          }`}
        >
          همه‌ی قفسه‌ها
        </button>
        {GROUP_IDS.map((gid) => {
          const active = group === gid;
          const count = NOSTALGIA.filter((n) => n.decade === dec && n.group === gid).length;
          return (
            <button
              key={gid}
              onClick={() => setGroup(active ? "all" : gid)}
              className={`rounded-full border px-4 py-1.5 text-[13px] font-bold transition-all active:scale-95 ${
                active
                  ? "border-gold-3 bg-gold-3 text-cream"
                  : "border-line-2 bg-cream/60 text-ink-2 hover:border-gold-3 hover:text-gold-3"
              }`}
            >
              {GROUP_EMOJI[gid]} {GROUP_LABEL[gid]} · {toFa(count)}
            </button>
          );
        })}
      </div>

      {/* کارت‌های خاطره */}
      <div key={`${dec}-${group}`} className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((n, i) => (
          <div key={n.id} className={i % 2 ? "rotate-[0.7deg]" : "-rotate-[0.7deg]"}>
            <button
              onClick={() => setOpen(n)}
              className="rise-in aged-card group relative block w-full cursor-pointer overflow-hidden rounded-xl text-left transition-all duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_26px_48px_-20px_rgba(43,32,20,0.6)] active:scale-[0.98]"
              style={{ animationDelay: `${(i % 8) * 55}ms` }}
              aria-label={`جزئیات ${n.title}`}
            >
              <span className="tape" aria-hidden />
              <span className="relative block h-40 overflow-hidden border-b border-dashed border-line-2 bg-[radial-gradient(circle_at_50%_45%,#fdf6e2,#e7d3a6_85%)]">
                <span className="sunburst absolute inset-0" aria-hidden />
                <span className="absolute inset-0 grid place-items-center text-6xl emoji-aged transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  {n.emoji}
                </span>
                <NostalgiaPhoto n={n} className={PHOTO_FADE} />
                <span className="font-type absolute bottom-2 right-2 rounded bg-espresso/85 px-2 py-0.5 text-[10px] font-bold tracking-widest text-gold-2">
                  {n.year}
                </span>
              </span>
              <span className="block p-4 text-right">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-[23px] font-bold leading-8 text-ink transition-colors group-hover:text-sienna">
                    {n.title}
                  </span>
                  <span className="shrink-0 text-xl">{GROUP_EMOJI[n.group]}</span>
                </span>
                <span className="mt-1 line-clamp-2 block text-[12.5px] leading-6 text-ink-2">{n.text}</span>
                <span className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-[10.5px] font-bold text-ink-3">
                    {GROUP_LABEL[n.group]}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-gold-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    ورق بزن <ArrowNext className="h-3 w-3" />
                  </span>
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>
      <p className="mt-7 text-center text-[12px] text-ink-3">
        روی هر کارت کلیک کنید تا پرونده‌ی خاطره باز شود · چیزی از قلم افتاده؟ در دفتر یادگاری بنویسید.
      </p>

      {open && (
        <NostalgiaModal n={open} list={items} onClose={() => setOpen(null)} onNav={(x) => setOpen(x)} />
      )}
    </div>
  );
};

/* ─────────────── عکس واقعی و تاریخچه‌ی بازی‌ها (ویکی‌پدیا) ─────────────── */

type GameMedia = { hero: string | null; gallery: string[]; extract: string };
const GMEM = new Map<string, GameMedia>();

async function fetchGameMedia(g: Game): Promise<GameMedia> {
  if (GMEM.has(g.id)) return GMEM.get(g.id)!;
  const out: GameMedia = { hero: null, gallery: [], extract: "" };
  try {
    const ck = sessionStorage.getItem(`sf-gm2:${g.id}`);
    if (ck) {
      const j = JSON.parse(ck) as GameMedia;
      GMEM.set(g.id, j);
      return j;
    }
    let title = cleanEn(g.nameEn);
    const sr = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(title)}&limit=1&namespace=0&format=json&origin=*`
    );
    if (sr.ok) {
      const j = await sr.json();
      title = (j?.[1]?.[0] as string) || title;
    }
    const s = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (s.ok) {
      const sj = await s.json();
      if (sj?.type !== "disambiguation") {
        out.hero = sj?.thumbnail?.source ?? sj?.originalimage?.source ?? null;
      }
    }
    /* تاریخچه‌ی فارسی از ویکی‌پدیای فارسی */
    try {
      const fsr = await fetch(
        `https://fa.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(g.name)}&limit=1&namespace=0&format=json&origin=*`
      );
      let faTitle = "";
      if (fsr.ok) {
        const fj = await fsr.json();
        faTitle = (fj?.[1]?.[0] as string) || "";
      }
      if (faTitle) {
        const fs = await fetch(`https://fa.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(faTitle)}`);
        if (fs.ok) {
          const fj2 = await fs.json();
          if (fj2?.type !== "disambiguation") {
            out.extract = ((fj2.extract || "") as string).split(/\n/)[0] || "";
          }
        }
      }
    } catch {
      /* آفلاین */
    }
    const im = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&imlimit=20&format=json&origin=*`
    );
    if (im.ok) {
      const ij = await im.json();
      const pages = Object.values<any>(ij.query?.pages ?? {})[0] as any;
      const names: string[] = ((pages?.images ?? []) as { title: string }[])
        .map((x) => x.title)
        .filter((t) => /\.(jpe?g|png|webp)$/i.test(t))
        .filter(
          (t) =>
            !/svg|icon|logo|symbol|wiktionary|question_book|edit-clear|disambig|cscr|padlock|commons-logo|wikipedia|nospam|edit-icon/i.test(t)
        )
        .slice(0, 6);
      if (names.length) {
        const ii = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${names.map(encodeURIComponent).join("|")}&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`
        );
        if (ii.ok) {
          const iij = await ii.json();
          const urls = Object.values<any>(iij.query?.pages ?? {})
            .map((pg: any) => pg.imageinfo?.[0]?.thumburl ?? pg.imageinfo?.[0]?.url)
            .filter(Boolean) as string[];
          let gal = urls.slice(0, 4);
          if (out.hero && !gal.includes(out.hero)) gal = [out.hero, ...gal].slice(0, 4);
          out.gallery = gal;
          if (!out.hero && gal[0]) out.hero = gal[0];
        }
      }
    }
  } catch {
    /* آفلاین */
  }
  GMEM.set(g.id, out);
  try {
    sessionStorage.setItem(`sf-gm2:${g.id}`, JSON.stringify(out));
  } catch {
    /* کش پر */
  }
  return out;
}

export const GamePhoto: React.FC<{ g: Game; className?: string }> = ({ g, className = "" }) => {
  const [src, setSrc] = useState<string | null>(null);
  const { ref, inView } = useInView<HTMLSpanElement>(0.05);
  useEffect(() => {
    if (!inView) return;
    let live = true;
    fetchGameMedia(g).then((m) => {
      if (live) setSrc(m.hero);
    });
    return () => {
      live = false;
    };
  }, [inView, g]);
  return (
    <span ref={ref} className={className} aria-hidden>
      {src && (
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="photo-aged h-full w-full rounded-[inherit] object-cover" />
      )}
    </span>
  );
};

/* ─────────────────────── نغمه‌ساز موتیف (هر شیء، ملودی خودش) ─────────────────────── */

export const MotifPlayer: React.FC<{
  motif: Motif;
  pausedLabel: string;
  playingLabel: string;
  light?: boolean;
}> = ({ motif, pausedLabel, playingLabel, light }) => {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => stop(), [stop]);
  useEffect(() => {
    stop();
  }, [motif, stop]);

  const start = () => {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;
    const stepDur = 60 / motif.tempo / 2;
    const m2f = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
    const blip = (freq: number, t: number, dur: number, type: OscillatorType, vol: number) => {
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(gn);
      gn.connect(ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.03);
    };
    const hat = (t: number) => {
      const buf = ctx.createBuffer(1, Math.max(1, Math.floor(0.04 * ctx.sampleRate)), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 5200;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.018, t);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      src.connect(f);
      f.connect(gn);
      gn.connect(ctx.destination);
      src.start(t);
    };
    let idx = 0;
    let beat = 0;
    const playNext = () => {
      if (!ctxRef.current) return;
      const t = ctx.currentTime + 0.02;
      const [m, len] = motif.notes[idx % motif.notes.length];
      if (m >= 0) blip(m2f(m), t, len * stepDur * 0.92, motif.wave, 0.05);
      if (beat % 4 === 0) blip(m2f(motif.root), t, stepDur * 3.4, "triangle", 0.07);
      if (beat % 8 === 4) blip(m2f(motif.root + 7), t, stepDur * 3.2, "triangle", 0.05);
      if (motif.hats && beat % 2 === 0) hat(t);
      idx++;
      beat++;
      timerRef.current = window.setTimeout(playNext, len * stepDur * 1000);
    };
    playNext();
    setPlaying(true);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => (playing ? stop() : start())}
        className={`flex w-full items-center justify-center gap-2.5 rounded-full border px-4 py-2.5 text-[13px] font-bold transition-all active:scale-95 ${
          light
            ? "border-line-2 bg-cream/90 text-ink-2 hover:border-gold hover:bg-gold/15"
            : "border-gold/50 bg-black/30 text-gold-2 hover:bg-gold/20"
        }`}
        aria-pressed={playing}
      >
        {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
        {playing ? playingLabel : pausedLabel}
        <span className="mr-1 flex h-4 items-end gap-[3px]" data-playing={playing ? "true" : "false"} aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="eq-bar" style={{ animationDelay: `${i * 0.11}s` }} />
          ))}
        </span>
      </button>
      <p className={`mt-1.5 text-center text-[10px] leading-4 ${light ? "text-ink-3" : "text-paper/45"}`}>
        بازسازیِ نغمه‌ی این اثر با سینت‌سایزر موزه — نسخه‌ی اصلی، اثرِ آهنگ‌سازانِ خودِ اثر است
      </p>
    </div>
  );
};

/* ─────────────────────── تالار گنجینه‌ی بازی‌ها ─────────────────────── */

export const GameModal: React.FC<{
  game: Game;
  list: Game[];
  onClose: () => void;
  onNav: (g: Game) => void;
  onOpenItem: (i: Item) => void;
}> = ({ game, list, onClose, onNav, onOpenItem }) => {
  const idx = Math.max(0, list.findIndex((g) => g.id === game.id));
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;
  const plat = platformOf(game.platform);
  const consoleId = CONSOLE_ITEM[game.platform];
  const consoleItem = consoleId ? ITEMS.find((i) => i.id === consoleId) : undefined;
  const related = useMemo(
    () =>
      GAMES.filter((g) => g.platform === game.platform && g.id !== game.id)
        .sort((a, b) => Math.abs(a.year - game.year) - Math.abs(b.year - game.year))
        .slice(0, 4),
    [game]
  );

  const [media, setMedia] = useState<GameMedia | null>(null);
  const [mainIdx, setMainIdx] = useState(0);
  const [imgFail, setImgFail] = useState(false);
  const motif = useMemo(() => motifForGame(game), [game]);

  useEffect(() => {
    let live = true;
    setMedia(null);
    setMainIdx(0);
    setImgFail(false);
    fetchGameMedia(game).then((m) => {
      if (live) setMedia(m);
    });
    return () => {
      live = false;
    };
  }, [game]);

  const photos = useMemo(() => {
    if (!media) return [];
    const arr = [...(media.hero ? [media.hero] : []), ...media.gallery.filter((x) => x !== media.hero)];
    return Array.from(new Set(arr)).slice(0, 4);
  }, [media]);
  const hero = photos[mainIdx] ?? null;
  const showImage = !!hero && !imgFail;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && next) onNav(next);
      if (e.key === "ArrowRight" && prev) onNav(prev);
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose, onNav, next, prev]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div className="fade-in absolute inset-0 bg-espresso/80 backdrop-blur-[3px]" onClick={onClose} aria-hidden />
      <div
        key={game.id}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`پرونده‌ی بازی ${game.name}`}
        className="modal-panel relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl outline-none sm:rounded-2xl dark-panel border border-gold/30 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]"
      >
        <button
          onClick={onClose}
          aria-label="بستن پرونده"
          className="absolute left-3.5 top-3.5 z-20 grid h-9 w-9 place-items-center rounded-full border border-paper/25 bg-black/30 text-paper/85 transition-all hover:rotate-90 hover:border-gold-2 hover:text-gold-2 active:scale-90"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="grid md:grid-cols-[280px_1fr]">
          <aside
            className="relative flex flex-col items-center justify-center gap-4 overflow-hidden p-8 text-center md:min-h-[430px]"
            style={{ background: `linear-gradient(165deg, ${plat.c}55, rgba(24,17,10,0.95))` }}
          >
            <span className="cart-grooves" aria-hidden />
            <span className="font-type relative text-[10px] tracking-[0.3em] text-paper/60" dir="ltr">
              GAME № {plaqueNo(idx + 1)}
            </span>
            {/* صحنه‌ی رسانه */}
            <div className="relative mx-auto h-48 w-full max-w-[290px] overflow-hidden rounded-xl border border-paper/20 bg-black/40 sm:h-52">
              {showImage ? (
                <img
                  key={hero}
                  src={hero!}
                  alt={`تصویری از ${game.name}`}
                  referrerPolicy="no-referrer"
                  className="fade-in h-full w-full object-cover"
                  onError={() => setImgFail(true)}
                />
              ) : (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="animate-bob text-[84px] leading-none drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]">
                    {game.emoji}
                  </span>
                </span>
              )}
              {!media && <span className="shimmer absolute inset-0" aria-hidden />}
              <span className="scanlines pointer-events-none absolute inset-0 opacity-25" aria-hidden />
              {showImage && (
                <span className="absolute bottom-1.5 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-paper/75">
                  عکس واقعی · ویکی‌پدیا
                </span>
              )}
            </div>
            {/* گالری تصاویر */}
            {photos.length > 1 && (
              <div className="relative mx-auto flex w-full max-w-[290px] justify-center gap-1.5">
                {photos.map((p, i) => (
                  <button
                    key={p + i}
                    onClick={() => {
                      setMainIdx(i);
                      setImgFail(false);
                    }}
                    className={`h-10 w-14 shrink-0 overflow-hidden rounded border transition-all active:scale-95 ${
                      i === mainIdx ? "border-gold-2 opacity-100 ring-1 ring-gold-2" : "border-paper/20 opacity-55 hover:opacity-90"
                    }`}
                    aria-label={`تصویر ${toFa(i + 1)} از ${game.name}`}
                  >
                    <img src={p} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* نغمه‌ی اختصاصی بازی */}
            <MotifPlayer motif={motif} pausedLabel="پخش نغمه‌ی بازی" playingLabel="توقف نغمه" />
            <div className="relative grid w-full grid-cols-2 gap-2 text-paper/90">
              <div className="rounded-lg border border-paper/15 bg-black/25 px-3 py-2.5">
                <p className="text-[10px] text-paper/55">سال انتشار</p>
                <p className="font-display text-2xl font-bold text-gold-2">{toFa(game.year)}</p>
              </div>
              <div className="rounded-lg border border-paper/15 bg-black/25 px-3 py-2.5">
                <p className="text-[10px] text-paper/55">ژانر</p>
                <p className="font-display text-lg font-bold leading-7 text-gold-2">{game.genre}</p>
              </div>
            </div>
            {consoleItem && (
              <button
                onClick={() => onOpenItem(consoleItem)}
                className="relative flex items-center gap-2 rounded-full border border-paper/30 px-4 py-2 text-[12.5px] font-bold text-paper/85 transition-all hover:border-gold-2 hover:text-gold-2 active:scale-95"
              >
                <span className="text-base">{consoleItem.image}</span>
                پرونده‌ی کنسول: {consoleItem.name}
              </button>
            )}
          </aside>

          <div className="p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11.5px] font-bold" style={{ borderColor: plat.c, color: "#e8d5ae", background: `${plat.c}33` }}>
              <span className="h-2 w-2 rounded-full" style={{ background: plat.c }} />
              {plat.fa}
            </span>
            <h2 className="font-display mt-3 text-4xl font-bold leading-tight text-paper sm:text-5xl">{game.name}</h2>
            <p className="font-type mt-1 text-[11px] tracking-[0.3em] text-paper/50" dir="ltr">
              {game.nameEn}
            </p>
            <p className="mt-5 text-[15px] leading-8 text-paper/85">{game.desc}</p>
            {game.note && (
              <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-4">
                <p className="font-type text-[9px] tracking-[0.3em] text-gold-2" dir="ltr">
                  DID YOU KNOW?
                </p>
                <h4 className="font-display mt-0.5 text-2xl font-bold text-paper">دانستنی جالب</h4>
                <p className="mt-1 text-[13.5px] leading-7 text-paper/85">{game.note}</p>
              </div>
            )}
            {media?.extract && (
              <div className="mt-4 rounded-xl border border-paper/15 bg-black/20 p-4">
                <p className="font-type text-[9px] tracking-[0.3em] text-gold-2/70" dir="ltr">
                  HISTORY
                </p>
                <h4 className="font-display mt-0.5 text-2xl font-bold text-paper">تاریخچه‌ی بازی</h4>
                <p className="mt-1.5 text-[13.5px] leading-7 text-paper/80">{media.extract}</p>
                <p className="mt-1.5 text-[10px] text-paper/40">برگرفته از دانشنامه‌ی ویکی‌پدیا</p>
              </div>
            )}

            <div className="mt-6">
              <p className="text-[12px] font-bold text-paper/55">بازی‌های هم‌سکو:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {related.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onNav(r)}
                    className="flex items-center gap-2 rounded-full border border-paper/20 bg-black/25 px-3 py-1.5 text-[12.5px] font-bold text-paper/80 transition-all hover:-translate-y-0.5 hover:border-gold-2 hover:text-gold-2 active:scale-95"
                  >
                    <span className="text-base">{r.emoji}</span>
                    {r.name}
                    <span className="font-type text-[10px] text-paper/45">{toFa(r.year)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-dashed border-paper/20 pt-5">
              {prev ? (
                <button onClick={() => onNav(prev)} className="group flex min-w-0 items-center gap-2 text-right text-paper/85 transition-colors hover:text-gold-2">
                  <ArrowPrev className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="block text-[10px] text-paper/50">قبلی</span>
                    <span className="block truncate text-[13px] font-bold">{prev.name}</span>
                  </span>
                </button>
              ) : (
                <span />
              )}
              {next ? (
                <button onClick={() => onNav(next)} className="group flex min-w-0 items-center gap-2 text-left text-paper/85 transition-colors hover:text-gold-2">
                  <span className="min-w-0">
                    <span className="block text-left text-[10px] text-paper/50">بعدی</span>
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

export const GamesHallView: React.FC<{ onBack: () => void; onOpenItem: (i: Item) => void }> = ({
  onBack,
  onOpenItem,
}) => {
  const [q, setQ] = useState("");
  const [plat, setPlat] = useState<"all" | PlatformId>("all");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState<"year" | "name">("year");
  const [open, setOpen] = useState<Game | null>(null);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = GAMES.filter(
      (g) =>
        (plat === "all" || g.platform === plat) &&
        (genre === "all" || g.genre === genre) &&
        (!s || g.name.includes(q.trim()) || g.nameEn.toLowerCase().includes(s))
    );
    return [...list].sort((a, b) =>
      sort === "year" ? a.year - b.year || a.name.localeCompare(b.name, "fa") : a.name.localeCompare(b.name, "fa")
    );
  }, [q, plat, genre, sort]);

  const reset = () => {
    setQ("");
    setPlat("all");
    setGenre("all");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      <button
        onClick={onBack}
        className="group flex items-center gap-2 rounded-full border border-line-2 bg-cream/70 px-4 py-2 text-sm font-bold text-ink-2 transition-all hover:border-sienna hover:text-sienna"
      >
        <ArrowPrev className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        بازگشت به تالار اصلی
      </button>

      {/* سردر تالار بازی */}
      <div className="dark-panel mt-6 overflow-hidden rounded-2xl border border-gold/25 text-paper">
        <div className="flex items-center justify-center gap-2 px-4 pt-4">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="bulb" style={{ animationDelay: `${i * 0.12}s` }} aria-hidden />
          ))}
        </div>
        <div className="flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="min-w-0 flex-1">
            <p className="font-type text-[11px] tracking-[0.3em] text-gold-2/80" dir="ltr">
              GME — THE GAME VAULT
            </p>
            <h1 className="font-display mt-1 text-4xl font-bold sm:text-5xl">گنجینه‌ی بازی‌ها</h1>
            <p className="mt-2 max-w-2xl text-[14.5px] leading-7 text-paper/75">
              {toFa(GAMES.length)} بازی معروف از {toFa(PLATFORMS.length)} سکوی خاطره‌ساز؛ از پونگِ آرکید تا
              سن‌آندریاس. هر کارتریج یک پرونده دارد — کلیک کنید و بخوانید.
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-paper/15 bg-black/25 px-5 py-4 text-center">
            <p className="font-display text-5xl font-bold leading-none text-gold-2">{toFa(GAMES.length)}</p>
            <p className="mt-1.5 text-[11px] font-bold text-paper/60">بازی ثبت‌شده</p>
          </div>
        </div>

        {/* جستجو و فیلترها */}
        <div className="space-y-3 border-t border-paper/10 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex min-w-56 flex-1 items-center gap-2 rounded-full border border-paper/20 bg-black/25 px-4 py-2 transition-all focus-within:border-gold-2">
              <SearchIcon className="h-4 w-4 shrink-0 text-gold-2/80" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجوی بازی… مثلاً «ماریو» یا ZELDA"
                className="w-full min-w-0 bg-transparent text-[13.5px] text-paper outline-none placeholder:text-paper/40"
                aria-label="جستجوی بازی"
              />
            </div>
            <button
              onClick={() => setSort("year")}
              className={`rounded-full border px-4 py-2 text-[12.5px] font-bold transition-all active:scale-95 ${
                sort === "year" ? "border-gold-2 bg-gold-2 text-espresso" : "border-paper/25 text-paper/70 hover:border-gold-2/70 hover:text-gold-2"
              }`}
            >
              تاریخ انتشار
            </button>
            <button
              onClick={() => setSort("name")}
              className={`rounded-full border px-4 py-2 text-[12.5px] font-bold transition-all active:scale-95 ${
                sort === "name" ? "border-gold-2 bg-gold-2 text-espresso" : "border-paper/25 text-paper/70 hover:border-gold-2/70 hover:text-gold-2"
              }`}
            >
              نام الفبایی
            </button>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setPlat("all")}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-all active:scale-95 ${
                plat === "all" ? "border-gold-2 bg-gold-2 text-espresso" : "border-paper/25 text-paper/70 hover:border-gold-2/70 hover:text-gold-2"
              }`}
            >
              همه‌ی سکوها · {toFa(GAMES.length)}
            </button>
            {PLATFORMS.map((p) => {
              const n = GAMES.filter((g) => g.platform === p.id).length;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlat(plat === p.id ? "all" : p.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-all active:scale-95 ${
                    plat === p.id ? "border-gold-2 bg-gold-2 text-espresso" : "border-paper/25 text-paper/70 hover:border-gold-2/70 hover:text-gold-2"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: p.c }} />
                  {p.fa} · {toFa(n)}
                </button>
              );
            })}
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setGenre("all")}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-all active:scale-95 ${
                genre === "all" ? "border-sienna-2 bg-sienna text-cream" : "border-paper/25 text-paper/70 hover:border-sienna-2/70 hover:text-sienna-2"
              }`}
            >
              همه‌ی ژانرها
            </button>
            {GENRES.map((gn) => (
              <button
                key={gn}
                onClick={() => setGenre(genre === gn ? "all" : gn)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-all active:scale-95 ${
                  genre === gn ? "border-sienna-2 bg-sienna text-cream" : "border-paper/25 text-paper/70 hover:border-sienna-2/70 hover:text-sienna-2"
                }`}
              >
                {gn}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-[13px] font-bold text-ink-3">
        {toFa(shown.length)} بازی یافت شد
        {(q || plat !== "all" || genre !== "all") && (
          <button onClick={reset} className="mr-3 text-sienna underline underline-offset-4 transition-colors hover:text-gold-3">
            پاک‌کردن فیلترها
          </button>
        )}
      </p>

      {/* شبکه‌ی کارتریج‌ها */}
      <div key={`${plat}-${genre}-${sort}-${q}`} className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((g, i) => {
          const p = platformOf(g.platform);
          return (
            <button
              key={g.id}
              onClick={() => setOpen(g)}
              className="cart-card rise-in group"
              style={{ animationDelay: `${Math.min((i % 8) * 50, 400)}ms` }}
              aria-label={`پرونده‌ی بازی ${g.name}`}
            >
              <span
                className="cart-grooves-wrap relative block overflow-hidden p-5 pb-4"
                style={{ background: `linear-gradient(160deg, ${p.c}4d 0%, rgba(26,19,11,0.96) 70%)` }}
              >
                <span className="cart-grooves" aria-hidden />
                <span className="scanlines pointer-events-none absolute inset-0 opacity-25" aria-hidden />
                <span className="relative grid h-40 place-items-center overflow-hidden rounded-xl text-7xl drop-shadow-[0_14px_20px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
                  <span className="emoji-aged">{g.emoji}</span>
                  <GamePhoto g={g} className={`${PHOTO_FADE} z-[1]`} />
                </span>
                <span className="font-type relative mt-3 block truncate text-center text-[10px] tracking-[0.22em] text-paper/55" dir="ltr">
                  {g.nameEn}
                </span>
              </span>
              <span className="relative block border-t-2 border-dashed border-line-2 bg-[linear-gradient(165deg,#f9f0da,#efdfbd)] p-4 text-right">
                <span className="font-display block truncate text-2xl font-bold leading-8 text-ink transition-colors group-hover:text-sienna">
                  {g.name}
                </span>
                <span className="mt-1.5 line-clamp-2 block min-h-10 text-[12.5px] leading-5 text-ink-2">{g.desc}</span>
                <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1.5 rounded-full border border-line-2 bg-cream/80 px-2.5 py-0.5 text-[11px] font-bold text-ink-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.c }} />
                    {p.fa}
                  </span>
                  <span className="rounded-full border border-line-2 bg-cream/80 px-2.5 py-0.5 font-type text-[11px] font-bold text-ink-2">
                    {toFa(g.year)}
                  </span>
                  <span className="rounded-full border border-line-2 bg-cream/80 px-2.5 py-0.5 text-[11px] font-bold text-ink-3">
                    {g.genre}
                  </span>
                  <span className="mr-auto flex items-center gap-1 text-[11px] font-bold text-gold-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    پرونده <ArrowNext className="h-3 w-3" />
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-line-2 py-16 text-center">
          <p className="text-4xl">🕹️</p>
          <p className="font-display mt-3 text-2xl font-bold text-ink">کارتریجی با این مشخصات پیدا نشد</p>
          <p className="mt-2 text-[13px] text-ink-3">فیلترها را تغییر دهید یا اسم دیگری امتحان کنید.</p>
          <button onClick={reset} className="mt-4 rounded-full bg-sienna px-5 py-2 text-[13px] font-bold text-cream transition-all hover:-translate-y-0.5 hover:bg-sienna-2 active:translate-y-0">
            نمایش همه‌ی بازی‌ها
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-ink-3">
        بازی‌ها به ترتیب سال انتشار چیده شده‌اند · سال‌ها میلادی‌اند · کلیک روی هر کارتریج، پرونده‌اش را باز می‌کند
      </p>

      {open && (
        <GameModal game={open} list={shown} onClose={() => setOpen(null)} onNav={(g) => setOpen(g)} onOpenItem={onOpenItem} />
      )}
    </main>
  );
};
