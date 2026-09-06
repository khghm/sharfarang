/* ============================================================
   شهرفرنگ — تالار فیلم‌بازان / تالار سریال‌بازان
   ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { type MediaEntry, type MediaHallConfig } from "./cinema";
import { useInView } from "./hooks";
import { motifForGame, type Motif } from "./note";
import { MotifPlayer, Reveal } from "./components";
import { ArrowNext, ArrowPrev, FilmIcon, TvIcon } from "./icons";
import { toFa, plaqueNo } from "./data";

const PHOTO_FADE =
  "absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-700 has-[img]:opacity-100";

/* ─────────────── دریافت عکس واقعی و تاریخچه (ویکی‌پدیا) ─────────────── */

type EntryMedia = { hero: string | null; gallery: string[]; extract: string };
const MEM = new Map<string, EntryMedia>();

const cleanEn = (s: string) => s.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();

async function fetchEntryMedia(e: MediaEntry): Promise<EntryMedia> {
  if (MEM.has(e.id)) return MEM.get(e.id)!;
  const out: EntryMedia = { hero: null, gallery: [], extract: "" };
  try {
    const ck = sessionStorage.getItem(`sf-cm2:${e.id}`);
    if (ck) {
      const j = JSON.parse(ck) as EntryMedia;
      MEM.set(e.id, j);
      return j;
    }
    let title = cleanEn(e.nameEn);
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
    /* تاریخچه‌ی فارسی */
    try {
      const fsr = await fetch(
        `https://fa.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(e.name)}&limit=1&namespace=0&format=json&origin=*`
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
  MEM.set(e.id, out);
  try {
    sessionStorage.setItem(`sf-cm2:${e.id}`, JSON.stringify(out));
  } catch {
    /* کش پر */
  }
  return out;
}

const MediaPhoto: React.FC<{ e: MediaEntry; className?: string }> = ({ e, className = "" }) => {
  const [src, setSrc] = useState<string | null>(null);
  const { ref, inView } = useInView<HTMLSpanElement>(0.05);
  useEffect(() => {
    if (!inView) return;
    let live = true;
    fetchEntryMedia(e).then((m) => {
      if (live) setSrc(m.hero);
    });
    return () => {
      live = false;
    };
  }, [inView, e]);
  return (
    <span ref={ref} className={className} aria-hidden>
      {src && (
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="photo-aged h-full w-full rounded-[inherit] object-cover" />
      )}
    </span>
  );
};

/* ─────────────────────── مودال پرونده‌ی رسانه ─────────────────────── */

const motifForEntry = (e: MediaEntry): Motif =>
  motifForGame({ id: e.id, genre: e.genre, platform: "series" } as any);

const MediaModal: React.FC<{
  cfg: MediaHallConfig;
  entry: MediaEntry;
  list: MediaEntry[];
  onClose: () => void;
  onNav: (e: MediaEntry) => void;
}> = ({ cfg, entry, list, onClose, onNav }) => {
  const idx = Math.max(0, list.findIndex((x) => x.id === entry.id));
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;

  const [media, setMedia] = useState<EntryMedia | null>(null);
  const [mainIdx, setMainIdx] = useState(0);
  const [imgFail, setImgFail] = useState(false);
  const motif = useMemo(() => motifForEntry(entry), [entry]);

  useEffect(() => {
    let live = true;
    setMedia(null);
    setMainIdx(0);
    setImgFail(false);
    fetchEntryMedia(entry).then((m) => {
      if (live) setMedia(m);
    });
    return () => {
      live = false;
    };
  }, [entry]);

  const photos = useMemo(() => {
    if (!media) return [];
    const arr = [...(media.hero ? [media.hero] : []), ...media.gallery.filter((x) => x !== media.hero)];
    return Array.from(new Set(arr)).slice(0, 4);
  }, [media]);
  const hero = photos[mainIdx] ?? null;
  const showImage = !!hero && !imgFail;

  const related = useMemo(
    () =>
      list.filter((x) => x.genre === entry.genre && x.id !== entry.id).slice(0, 4),
    [entry, list]
  );

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
        key={entry.id}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`پرونده‌ی ${entry.name}`}
        className="modal-panel dark-panel relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-gold/30 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] outline-none sm:rounded-2xl"
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

        <div className="grid md:grid-cols-[290px_1fr]">
          <aside
            className="relative flex flex-col items-center justify-center gap-4 overflow-hidden p-6 text-center sm:p-8 md:min-h-[460px]"
            style={{ background: `linear-gradient(165deg, ${cfg.hallColor}55, rgba(24,17,10,0.95))` }}
          >
            <span className="cart-grooves" aria-hidden />
            <span className="scanlines pointer-events-none absolute inset-0 opacity-25" aria-hidden />
            <span className="font-type relative text-[10px] tracking-[0.3em] text-paper/60" dir="ltr">
              {cfg.code} № {plaqueNo(idx + 1)}
            </span>

            {/* صحنه‌ی تصویر بزرگ + گالری */}
            <div className="relative aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-lg border-2 border-paper/25 shadow-[0_20px_45px_-18px_rgba(0,0,0,0.8)]">
              {showImage ? (
                <img
                  key={hero}
                  src={hero!}
                  alt={`پوستر ${entry.name}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFail(true)}
                  className="fade-in photo-aged absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span className="absolute inset-0 grid place-items-center bg-black/40 text-[64px]">{entry.emoji}</span>
              )}
              <span className="font-type absolute bottom-1.5 left-2 rounded bg-espresso/80 px-1.5 py-0.5 text-[9px] text-paper/70" dir="ltr">
                {toFa(entry.year)}
              </span>
            </div>

            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                {photos.map((p, i) => (
                  <button
                    key={p}
                    onClick={() => {
                      setImgFail(false);
                      setMainIdx(i);
                    }}
                    className={`h-9 w-9 shrink-0 overflow-hidden rounded border transition-all active:scale-95 ${
                      i === mainIdx ? "border-gold-2 opacity-100 ring-1 ring-gold-2" : "border-paper/20 opacity-50 hover:opacity-90"
                    }`}
                    aria-label={`تصویر ${toFa(i + 1)}`}
                  >
                    <img src={p} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative grid w-full grid-cols-2 gap-2 text-paper/90">
              <div className="rounded-lg border border-paper/15 bg-black/25 px-3 py-2.5">
                <p className="text-[10px] text-paper/55">سال</p>
                <p className="font-display text-2xl font-bold text-gold-2">{toFa(entry.year)}</p>
              </div>
              <div className="rounded-lg border border-paper/15 bg-black/25 px-3 py-2.5">
                <p className="text-[10px] text-paper/55">ژانر</p>
                <p className="font-display text-lg font-bold leading-7 text-gold-2">{entry.genre}</p>
              </div>
            </div>

            <MotifPlayer motif={motif} pausedLabel="پخش نغمه" playingLabel="توقف نغمه" />
          </aside>

          <div className="p-6 sm:p-8">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11.5px] font-bold"
              style={{ borderColor: cfg.hallColor, color: "#e8d5ae", background: `${cfg.hallColor}33` }}
            >
              {cfg.key === "cinema" ? <FilmIcon className="h-3.5 w-3.5" /> : <TvIcon className="h-3.5 w-3.5" />}
              {cfg.title} · {entry.country}
            </span>
            <h2 className="font-display mt-3 text-4xl font-bold leading-tight text-paper sm:text-5xl">{entry.name}</h2>
            <p className="font-type mt-1 text-[11px] tracking-[0.3em] text-paper/50" dir="ltr">
              {entry.nameEn}
            </p>

            <p className="mt-5 text-[15px] leading-8 text-paper/85">{entry.desc}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-paper/15 bg-black/20 p-3.5">
                <p className="font-type text-[9px] tracking-[0.25em] text-gold-2/70" dir="ltr">
                  {cfg.directorLabel}
                </p>
                <p className="mt-1 text-[14px] font-bold text-paper">{entry.director}</p>
              </div>
              <div className="rounded-lg border border-paper/15 bg-black/20 p-3.5">
                <p className="font-type text-[9px] tracking-[0.25em] text-gold-2/70" dir="ltr">
                  {cfg.countryLabel}
                </p>
                <p className="mt-1 text-[14px] font-bold text-paper">{entry.country}</p>
              </div>
            </div>

            {entry.note && (
              <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4">
                <p className="font-type text-[9px] tracking-[0.3em] text-gold-2" dir="ltr">
                  DID YOU KNOW?
                </p>
                <h4 className="font-display mt-0.5 text-2xl font-bold text-paper">دانستنی جالب</h4>
                <p className="mt-1 text-[13.5px] leading-7 text-paper/85">{entry.note}</p>
              </div>
            )}

            {media?.extract && (
              <div className="mt-4 rounded-xl border border-paper/15 bg-black/20 p-4">
                <p className="font-type text-[9px] tracking-[0.3em] text-gold-2/70" dir="ltr">
                  HISTORY
                </p>
                <h4 className="font-display mt-0.5 text-2xl font-bold text-paper">تاریخچه</h4>
                <p className="mt-1.5 text-[13.5px] leading-7 text-paper/80">{media.extract}</p>
                <p className="mt-1.5 text-[10px] text-paper/40">برگرفته از دانشنامه‌ی ویکی‌پدیا</p>
              </div>
            )}

            {related.length > 0 && (
              <div className="mt-6">
                <p className="text-[12px] font-bold text-paper/55">از همین ژانر:</p>
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
            )}

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

/* ─────────────────────── نمای تالار رسانه ─────────────────────── */

export const MediaHallView: React.FC<{
  cfg: MediaHallConfig;
  onBack: () => void;
}> = ({ cfg, onBack }) => {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("all");
  const [country, setCountry] = useState("all");
  const [sort, setSort] = useState<"year" | "name">("year");
  const [open, setOpen] = useState<MediaEntry | null>(null);

  const countries = useMemo(
    () => Array.from(new Set(cfg.entries.map((e) => e.country))),
    [cfg]
  );

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = cfg.entries.filter(
      (e) =>
        (genre === "all" || e.genre === genre) &&
        (country === "all" || e.country === country) &&
        (!s || e.name.includes(q.trim()) || e.nameEn.toLowerCase().includes(s) || e.director.includes(q.trim()))
    );
    return [...list].sort((a, b) =>
      sort === "year" ? a.year - b.year || a.name.localeCompare(b.name, "fa") : a.name.localeCompare(b.name, "fa")
    );
  }, [cfg, q, genre, country, sort]);

  const reset = () => {
    setQ("");
    setGenre("all");
    setCountry("all");
  };

  const HallIcon = cfg.key === "cinema" ? FilmIcon : TvIcon;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      <button
        onClick={onBack}
        className="group flex items-center gap-2 rounded-full border border-line-2 bg-cream/70 px-4 py-2 text-sm font-bold text-ink-2 transition-all hover:border-sienna hover:text-sienna"
      >
        <ArrowPrev className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        بازگشت به تالار اصلی
      </button>

      {/* سردر تالار */}
      <div className="dark-panel mt-6 overflow-hidden rounded-2xl border border-gold/25 text-paper">
        <div className="flex items-center justify-center gap-2 px-4 pt-4">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="bulb" style={{ animationDelay: `${i * 0.12}s` }} aria-hidden />
          ))}
        </div>
        <div className="flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="min-w-0 flex-1">
            <p className="font-type text-[11px] tracking-[0.3em] text-gold-2/80" dir="ltr">
              {cfg.code} — {cfg.en}
            </p>
            <h1 className="font-display mt-1 flex items-center gap-3 text-4xl font-bold sm:text-5xl">
              <HallIcon className="h-9 w-9 shrink-0 text-gold-2" />
              {cfg.title}
            </h1>
            <p className="mt-2 max-w-2xl text-[14.5px] leading-7 text-paper/75">{cfg.tagline}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-paper/15 bg-black/25 px-5 py-4 text-center">
            <p className="font-display text-5xl font-bold leading-none text-gold-2">{toFa(cfg.entries.length)}</p>
            <p className="mt-1.5 text-[11px] font-bold text-paper/60">{cfg.key === "cinema" ? "فیلم ثبت‌شده" : "سریال ثبت‌شده"}</p>
          </div>
        </div>

        {/* جستجو و فیلترها */}
        <div className="space-y-3 border-t border-paper/10 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex min-w-56 flex-1 items-center gap-2 rounded-full border border-paper/20 bg-black/25 px-4 py-2 transition-all focus-within:border-gold-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gold-2/80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجو بر اساس نام یا سازنده…"
                className="w-full min-w-0 bg-transparent text-[13.5px] text-paper outline-none placeholder:text-paper/40"
                aria-label="جستجو"
              />
            </div>
            <button
              onClick={() => setSort("year")}
              className={`rounded-full border px-4 py-2 text-[12.5px] font-bold transition-all active:scale-95 ${
                sort === "year" ? "border-gold-2 bg-gold-2 text-espresso" : "border-paper/25 text-paper/70 hover:border-gold-2/70 hover:text-gold-2"
              }`}
            >
              سال ساخت
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
              onClick={() => setGenre("all")}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-all active:scale-95 ${
                genre === "all" ? "border-gold-2 bg-gold-2 text-espresso" : "border-paper/25 text-paper/70 hover:border-gold-2/70 hover:text-gold-2"
              }`}
            >
              همه‌ی ژانرها · {toFa(cfg.entries.length)}
            </button>
            {cfg.genres.map((gn) => {
              const n = cfg.entries.filter((e) => e.genre === gn).length;
              if (!n) return null;
              return (
                <button
                  key={gn}
                  onClick={() => setGenre(genre === gn ? "all" : gn)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-all active:scale-95 ${
                    genre === gn ? "border-gold-2 bg-gold-2 text-espresso" : "border-paper/25 text-paper/70 hover:border-gold-2/70 hover:text-gold-2"
                  }`}
                >
                  {gn} · {toFa(n)}
                </button>
              );
            })}
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCountry("all")}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-all active:scale-95 ${
                country === "all" ? "border-sienna-2 bg-sienna text-cream" : "border-paper/25 text-paper/70 hover:border-sienna-2/70 hover:text-sienna-2"
              }`}
            >
              همه‌ی محصولات
            </button>
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => setCountry(country === c ? "all" : c)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-all active:scale-95 ${
                  country === c ? "border-sienna-2 bg-sienna text-cream" : "border-paper/25 text-paper/70 hover:border-sienna-2/70 hover:text-sienna-2"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-[13px] font-bold text-ink-3">
        {toFa(shown.length)} {cfg.key === "cinema" ? "فیلم" : "سریال"} یافت شد
        {(q || genre !== "all" || country !== "all") && (
          <button onClick={reset} className="mr-3 text-sienna underline underline-offset-4 transition-colors hover:text-gold-3">
            پاک‌کردن فیلترها
          </button>
        )}
      </p>

      {/* شبکه‌ی پوسترها */}
      <div key={`${genre}-${country}-${sort}-${q}`} className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((e, i) => (
          <button
            key={e.id}
            onClick={() => setOpen(e)}
            className="cart-card rise-in group"
            style={{ animationDelay: `${Math.min((i % 8) * 50, 400)}ms` }}
            aria-label={`پرونده‌ی ${e.name}`}
          >
            <span className="cart-grooves-wrap relative block overflow-hidden p-5 pb-4" style={{ background: cfg.cardTop }}>
              <span className="cart-grooves" aria-hidden />
              <span className="scanlines pointer-events-none absolute inset-0 opacity-25" aria-hidden />
              <span className="relative grid aspect-[3/4] place-items-center overflow-hidden rounded-lg text-7xl drop-shadow-[0_14px_20px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
                <span className="emoji-aged">{e.emoji}</span>
                <MediaPhoto e={e} className={`${PHOTO_FADE} z-[1]`} />
              </span>
              <span className="font-type relative mt-3 block truncate text-center text-[10px] tracking-[0.22em] text-paper/55" dir="ltr">
                {e.nameEn}
              </span>
            </span>
            <span className="relative block border-t-2 border-dashed border-line-2 bg-[linear-gradient(165deg,#f9f0da,#efdfbd)] p-4 text-right">
              <span className="font-display block truncate text-2xl font-bold leading-8 text-ink transition-colors group-hover:text-sienna">
                {e.name}
              </span>
              <span className="mt-1.5 line-clamp-2 block min-h-10 text-[12.5px] leading-5 text-ink-2">{e.desc}</span>
              <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-line-2 bg-cream/80 px-2.5 py-0.5 font-type text-[11px] font-bold text-ink-2">
                  {toFa(e.year)}
                </span>
                <span className="rounded-full border border-line-2 bg-cream/80 px-2.5 py-0.5 text-[11px] font-bold text-ink-3">
                  {e.genre}
                </span>
                <span className="mr-auto flex items-center gap-1 text-[11px] font-bold text-gold-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  پرونده <ArrowNext className="h-3 w-3" />
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-line-2 py-16 text-center">
          <p className="text-4xl">{cfg.key === "cinema" ? "🎬" : "📺"}</p>
          <p className="font-display mt-3 text-2xl font-bold text-ink">چیزی با این مشخصات پیدا نشد</p>
          <p className="mt-2 text-[13px] text-ink-3">فیلترها را تغییر دهید یا عبارت دیگری امتحان کنید.</p>
          <button onClick={reset} className="mt-4 rounded-full bg-sienna px-5 py-2 text-[13px] font-bold text-cream transition-all hover:-translate-y-0.5 hover:bg-sienna-2 active:translate-y-0">
            نمایش همه
          </button>
        </div>
      )}

      {open && <MediaModal cfg={cfg} entry={open} list={shown} onClose={() => setOpen(null)} onNav={(x) => setOpen(x)} />}
    </main>
  );
};
