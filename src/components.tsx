import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Item,
  ITEMS,
  CATEGORIES,
  STATUS,
  StatusId,
  catById,
  searchItems,
  toFa,
  plaqueNo,
  MIN_YEAR,
  MAX_YEAR,
  WINDOW,
} from "./data";
import {
  SearchIcon,
  CloseIcon,
  ArrowNext,
  ArrowPrev,
  CATEGORY_ICONS,
} from "./icons";

/* ============================================================
   حرکت‌های آشکارسازی هنگام اسکرول
   ============================================================ */

export function useRevealAll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)"));
    if (!els.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

/* ============================================================
   مهر وضعیت
   ============================================================ */

export const StatusStamp: React.FC<{ status: StatusId; className?: string }> = ({
  status,
  className = "",
}) => (
  <span className={`stamp ${className}`} style={{ color: STATUS[status].color }}>
    {STATUS[status].fa}
  </span>
);

/* ============================================================
   کارت شیء
   ============================================================ */

export const ItemCard: React.FC<{
  item: Item;
  index: number;
  onOpen: (item: Item) => void;
  wide?: boolean;
}> = ({ item, index, onOpen, wide }) => {
  const cat = catById(item.category);
  return (
    <button
      onClick={() => onOpen(item)}
      style={{ transitionDelay: `${(index % 6) * 70}ms` }}
      className={`reveal group aged-card rounded-lg p-5 text-right transition-all duration-300 hover:-translate-y-1.5 hover:rotate-[-0.6deg] hover:shadow-[0_24px_45px_-20px_rgba(43,32,20,0.55)] focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-gold-3 cursor-pointer ${
        wide ? "min-w-[270px] max-w-[300px] shrink-0 snap-start" : "w-full"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-type text-[11px] tracking-widest text-gold-3">
          № {plaqueNo(ITEMS.indexOf(item) + 1)}
        </span>
        <StatusStamp status={item.status} />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-2 border-line-2 bg-[radial-gradient(circle_at_35%_30%,#fbf3dd,#e9d8b0_75%)] shadow-[inset_0_2px_10px_rgba(120,80,30,0.35)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
          <span className="emoji-aged text-4xl leading-none">{item.image}</span>
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold leading-8 text-ink">{item.name}</h3>
          <p className="font-type mt-0.5 text-[10px] tracking-[0.18em] text-ink-3" dir="ltr">
            {item.nameEn}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-sienna">
            آغاز: {toFa(item.year)} · اوج: {item.era}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[13.5px] leading-7 text-ink-2">{item.description}</p>

      <div className="mt-4 flex items-center justify-between border-t border-dashed border-line-2 pt-3">
        <span className="font-type text-[10px] tracking-[0.22em] text-ink-3">
          {cat.code} · {cat.en}
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-gold-3 opacity-70 transition-all duration-300 group-hover:gap-2 group-hover:opacity-100">
          پرونده‌ی کامل
          <ArrowNext className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
};

/* ============================================================
   نوار خبری متحرک
   ============================================================ */

export const TickerBar: React.FC<{ onOpen: (item: Item) => void }> = ({ onOpen }) => {
  const half = (key: string) => (
    <div key={key} className="flex items-center">
      {ITEMS.map((i) => (
        <button
          key={key + i.id}
          onClick={() => onOpen(i)}
          className="flex shrink-0 items-center gap-3 px-5 py-2.5 text-sm text-ink-2 transition-colors hover:text-sienna"
        >
          <span className="text-gold">✦</span>
          <span className="font-medium">{i.name}</span>
          <span className="font-type text-xs text-ink-3" dir="ltr">
            {toFa(i.year)}
          </span>
        </button>
      ))}
    </div>
  );
  return (
    <div dir="ltr" className="overflow-hidden border-y border-line bg-paper-2/70">
      <div className="ticker-track">
        {half("a")}
        {half("b")}
      </div>
    </div>
  );
};

/* ============================================================
   دریچه‌های شهرفرنگ
   ============================================================ */

export const PortholeStrip: React.FC<{ items: Item[]; onOpen: (item: Item) => void }> = ({
  items,
  onOpen,
}) => (
  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
    {items.map((it, i) => (
      <button
        key={it.id}
        onClick={() => onOpen(it)}
        title={`${it.name} — ${toFa(it.year)}`}
        style={{ animationDelay: `${i * 0.55}s` }}
        className="animate-bob group relative grid h-16 w-16 place-items-center rounded-full border-[3px] border-gold-3 bg-[radial-gradient(circle_at_50%_35%,#3a2b18,#1e150d_78%)] shadow-[inset_0_3px_12px_rgba(0,0,0,0.7),0_4px_10px_rgba(43,32,20,0.25)] transition-transform duration-300 hover:scale-110 sm:h-[72px] sm:w-[72px]"
      >
        <span className="pointer-events-none absolute inset-1 rounded-full border border-gold/30" />
        <span className="emoji-aged text-[26px] transition-transform duration-300 group-hover:scale-125">
          {it.image}
        </span>
      </button>
    ))}
  </div>
);

/* ============================================================
   نوار جستجو
   ============================================================ */

export const SearchBox: React.FC<{
  onOpen: (item: Item) => void;
  compact?: boolean;
}> = ({ onOpen, compact }) => {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const results = useMemo(() => searchItems(q), [q]);
  const open = focus && q.trim().length > 0;

  return (
    <div className={`relative ${compact ? "w-full" : "mx-auto w-full max-w-xl"}`}>
      <div
        className={`flex items-center gap-3 rounded-full border bg-cream px-4 py-2.5 transition-all duration-300 ${
          focus
            ? "border-gold shadow-[0_0_0_4px_rgba(185,138,47,0.15),0_10px_25px_-15px_rgba(43,32,20,0.5)]"
            : "border-line-2 shadow-[inset_0_2px_6px_rgba(120,80,30,0.12)]"
        }`}
      >
        <SearchIcon className="h-5 w-5 shrink-0 text-gold-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 140)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length) onOpen(results[0]);
            if (e.key === "Escape") {
              setQ("");
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder={compact ? "جستجوی شیء…" : "نام شی را جستجو کنید… مثلاً: پیکان، آتاری، تایپ‌رایتر"}
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3/80"
        />
        <span className="font-type hidden shrink-0 rounded border border-line-2 px-1.5 py-0.5 text-[10px] text-ink-3 sm:block" dir="ltr">
          {results.length ? toFa(results.length) : "—"}
        </span>
      </div>

      {open && (
        <div className="fade-in absolute right-0 left-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line bg-cream shadow-[0_30px_60px_-25px_rgba(30,21,13,0.55)]">
          <div className="flex items-center justify-between border-b border-dashed border-line-2 px-4 py-2 text-[11px] font-bold tracking-wider text-ink-3">
            <span>{results.length ? `${toFa(results.length)} پرونده یافت شد` : "نتیجه‌ای در گنجینه نیست"}</span>
            <span className="font-type tracking-widest">ARCHIVE</span>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {results.slice(0, 9).map((i) => (
              <li key={i.id}>
                <button
                  onMouseDown={() => {
                    onOpen(i);
                    setQ("");
                  }}
                  className="flex w-full items-center gap-3 border-b border-line/60 px-4 py-2.5 text-right transition-colors last:border-0 hover:bg-paper-2"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-2 bg-paper">
                    <span className="emoji-aged text-xl">{i.image}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg font-bold leading-6 text-ink">
                      {i.name}
                    </span>
                    <span className="font-type block text-[10px] tracking-[0.15em] text-ink-3" dir="ltr">
                      {i.nameEn} · {toFa(i.year)}
                    </span>
                  </span>
                  <span className="font-type shrink-0 text-[10px] tracking-widest text-ink-3">
                    {catById(i.category).code}
                  </span>
                  <StatusStamp status={i.status} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   تیتر بخش‌ها
   ============================================================ */

export const SectionHead: React.FC<{
  no: string;
  title: string;
  en: string;
  dark?: boolean;
}> = ({ no, title, en, dark }) => (
  <div className="reveal mb-8 flex items-end justify-between gap-4">
    <div>
      <p className={`font-type text-[11px] tracking-[0.3em] ${dark ? "text-gold-2/80" : "text-gold-3"}`} dir="ltr">
        {en}
      </p>
      <h2 className={`font-display mt-1 text-4xl font-bold sm:text-5xl ${dark ? "text-paper" : "text-ink"}`}>
        <span className={dark ? "text-gold-2" : "text-sienna"}>
          {no}
        </span>{" "}
        · {title}
      </h2>
    </div>
    <div className={`hidden h-[3px] flex-1 self-center sm:block ${dark ? "bg-gold/25" : "bg-line-2"}`} />
    <span className={`hidden text-2xl sm:block ${dark ? "text-gold-2/60" : "text-gold"}`}>✦</span>
  </div>
);

/* ============================================================
   تایم‌لاین سراسری
   ============================================================ */

const pct = (year: number) => ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

export const TimelineSection: React.FC<{ onOpen: (item: Item) => void }> = ({ onOpen }) => {
  const sorted = useMemo(() => [...ITEMS].sort((a, b) => a.year - b.year), []);
  const [mode, setMode] = useState<"all" | number>("all");
  const start = mode === "all" ? MIN_YEAR : mode;
  const end = Math.min(start + WINDOW, MAX_YEAR);
  const inWindow = (y: number) => y >= start && y <= end;
  const filtered = mode === "all" ? sorted : sorted.filter((i) => inWindow(i.year));

  const ticks = [];
  for (let y = MIN_YEAR; y <= MAX_YEAR; y += 10) ticks.push(y);

  return (
    <div>
      <div className="reveal mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setMode("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all duration-300 ${
            mode === "all"
              ? "border-gold-2 bg-gold text-espresso shadow-[0_4px_14px_-4px_rgba(217,178,95,0.7)]"
              : "border-gold/40 text-gold-2 hover:border-gold-2"
          }`}
        >
          همه‌ی دوران‌ها
        </button>
        <span className="font-type text-xs tracking-widest text-gold-2/70" dir="ltr">
          {toFa(start)} — {toFa(end)}
        </span>
        <span className="mr-auto rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold-2">
          {toFa(filtered.length)} شیء در ویترین
        </span>
      </div>

      {/* خط‌کش سده‌ها */}
      <div className="reveal relative mb-2 h-28 select-none" dir="rtl">
        <div className="absolute right-0 left-0 top-1/2 h-px bg-gold/35" />

        {/* بازه‌ی روشن */}
        {mode !== "all" && (
          <div
            className="absolute top-3 bottom-3 rounded border-x-2 border-gold-2/70 bg-gold/10 transition-all duration-300"
            style={{ right: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }}
          />
        )}

        {ticks.map((y) => (
          <div
            key={y}
            className="absolute top-1/2 -translate-y-1/2 translate-x-1/2"
            style={{ right: `${pct(y)}%` }}
          >
            <div className={`mx-auto w-px ${y % 40 === 0 ? "h-5 bg-gold/60" : "h-2.5 bg-gold/30"}`} />
            {y % 40 === 0 && (
              <span className="font-type absolute right-1/2 top-full mt-2 translate-x-1/2 text-[10px] tracking-wider text-gold-2/70" dir="ltr">
                {toFa(y)}
              </span>
            )}
          </div>
        ))}

        {/* نقطه‌های اشیاء */}
        {sorted.map((it) => {
          const lane = CATEGORIES.findIndex((c) => c.id === it.category) % 4;
          const dim = mode !== "all" && !inWindow(it.year);
          return (
            <button
              key={it.id}
              onClick={() => onOpen(it)}
              style={{ right: `${pct(it.year)}%`, top: `${10 + lane * 15}px` }}
              className={`group absolute h-3 w-3 translate-x-1/2 rounded-full border border-paper/70 transition-all duration-300 hover:z-20 hover:scale-[1.7] hover:border-gold-2 ${
                dim ? "opacity-20" : "opacity-100"
              }`}
              title={it.name}
            >
              <span className="block h-full w-full rounded-full" style={{ background: STATUS[it.status].color }} />
              <span className="pointer-events-none absolute bottom-full right-1/2 mb-2 hidden translate-x-1/2 whitespace-nowrap rounded border border-gold/40 bg-espresso px-2 py-1 font-body text-[11px] text-paper shadow-lg group-hover:block">
                {it.name} · <span className="font-type" dir="ltr">{toFa(it.year)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <input
        dir="rtl"
        type="range"
        className="time-range reveal"
        min={MIN_YEAR}
        max={MAX_YEAR - WINDOW}
        step={10}
        value={start}
        aria-label="لغزنده‌ی بازه‌ی زمانی"
        onChange={(e) => setMode(Number(e.target.value))}
      />

      <p className="reveal mb-8 text-center text-[11px] text-paper/40">
        لغزنده را بکشید تا بازه‌ی چهل‌ساله در خط‌کش جابه‌جا شود — سال‌ها میلادی‌اند ·
        <span className="font-type" dir="ltr"> {toFa(MIN_YEAR)}–{toFa(MAX_YEAR)}</span>
      </p>

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((it, i) => (
            <ItemCard key={it.id} item={it} index={i} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="reveal rounded-lg border border-dashed border-gold/30 py-14 text-center text-paper/60">
          <p className="text-3xl">🗝️</p>
          <p className="font-display mt-2 text-2xl">در این بازه، قفسه‌ها خالی‌اند</p>
          <p className="mt-1 text-sm">کمی جلوتر یا عقب‌تر بروید؛ موزه پر از طبقه‌های پر است.</p>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   مودال پرونده‌ی شیء
   ============================================================ */

export const ItemModal: React.FC<{
  item: Item;
  list: Item[];
  onClose: () => void;
  onNav: (item: Item) => void;
}> = ({ item, list, onClose, onNav }) => {
  const cat = catById(item.category);
  const idx = list.findIndex((i) => i.id === item.id);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && next) onNav(next); // در RTL چپ یعنی بعدی
      if (e.key === "ArrowRight" && prev) onNav(prev);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.scrollTo({ top: 0 });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose, onNav, prev, next]);

  return (
    <div
      className="fade-in fixed inset-0 z-[80] flex items-center justify-center bg-espresso/80 p-3 backdrop-blur-[3px] sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`پرونده‌ی ${item.name}`}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel aged-card relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl"
      >
        <button
          onClick={onClose}
          aria-label="بستن پرونده"
          className="absolute left-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-line-2 bg-cream/80 text-ink-2 transition-all hover:rotate-90 hover:border-sienna hover:text-sienna"
        >
          <CloseIcon className="h-4.5 w-4.5" />
        </button>

        <div className="grid md:grid-cols-[250px_1fr]">
          {/* لوح نمایش */}
          <div className="border-line border-b border-dashed p-6 md:border-b-0 md:border-l">
            <p className="font-type text-[11px] tracking-[0.25em] text-gold-3">
              № {plaqueNo(ITEMS.indexOf(item) + 1)}
            </p>
            <div className="lamp-glow mx-auto mt-5 grid h-40 w-40 place-items-center rounded-full border-[3px] border-double border-gold-3 bg-[radial-gradient(circle_at_50%_35%,#fbf3dd,#e6d3a8_80%)] shadow-[inset_0_4px_20px_rgba(120,80,30,0.4),0_10px_30px_-12px_rgba(43,32,20,0.5)]">
              <span className="emoji-aged text-7xl leading-none">{item.image}</span>
            </div>
            <div className="mt-5 text-center">
              <StatusStamp status={item.status} className="text-sm" />
            </div>
            <div className="mt-5 space-y-2 text-[13px]">
              {[
                ["تالار", cat.fa],
                ["سال تولد", toFa(item.year)],
                ["سال‌های اوج", item.era],
              ].map(([k, v]) => (
                <div key={k} className="dash-row flex items-center justify-between gap-2 pb-2">
                  <span className="font-bold text-ink-3">{k}</span>
                  <span className="font-semibold text-ink">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* شرح و تایم‌لاین */}
          <div className="p-6 sm:p-7">
            <p className="font-type text-[10px] tracking-[0.3em] text-ink-3" dir="ltr">
              {cat.en} — {item.nameEn}
            </p>
            <h3 className="font-display mt-1 text-4xl font-bold text-ink sm:text-5xl">{item.name}</h3>

            <p className="mt-4 text-[15px] leading-8 text-ink-2">{item.long}</p>

            {/* شناسنامه */}
            <div className="mt-6 rounded-lg border border-line bg-cream/60 p-4">
              <p className="font-type text-[10px] tracking-[0.25em] text-gold-3">شناسنامه‌ی شیء</p>
              <dl className="mt-2 space-y-2 text-[13.5px]">
                {(
                  [
                    ["سازنده / پدیدآور", item.specs.maker],
                    ["خاستگاه", item.specs.country],
                    ["سرنوشت", item.specs.fate],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="dash-row flex flex-wrap gap-x-3 pb-2 last:border-0">
                    <dt className="font-bold text-gold-3">{k}:</dt>
                    <dd className="flex-1 text-ink-2">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* سیر تحول */}
            <h4 className="font-display mt-7 text-2xl font-bold text-ink">
              سیر تحول <span className="text-sienna">و نسل‌ها</span>
            </h4>
            <ol className="relative mt-4 space-y-5 border-s-2 border-line-2 ps-6">
              {item.milestones.map((m, i) => (
                <li key={i} className="relative">
                  <span className="absolute -start-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-paper bg-gold shadow-[0_0_0_3px_rgba(185,138,47,0.25)]" />
                  <p className="font-type text-xs font-bold tracking-widest text-gold-3" dir="ltr">
                    {toFa(m.year)}
                  </p>
                  <p className="mt-0.5 font-bold text-ink">{m.title}</p>
                  <p className="mt-0.5 text-[13px] leading-6 text-ink-2">{m.text}</p>
                </li>
              ))}
            </ol>

            {/* ناوبری پرونده‌ها */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-dashed border-line-2 pt-5">
              {prev ? (
                <button
                  onClick={() => onNav(prev)}
                  className="group flex items-center gap-2 rounded-full border border-line-2 px-4 py-2 text-sm font-bold text-ink-2 transition-all hover:border-sienna hover:text-sienna"
                >
                  <ArrowPrev className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  <span className="text-right">
                    <span className="block text-[10px] font-normal text-ink-3">پرونده‌ی پیشین</span>
                    {prev.name}
                  </span>
                </button>
              ) : (
                <span />
              )}
              {next ? (
                <button
                  onClick={() => onNav(next)}
                  className="group flex items-center gap-2 rounded-full border border-line-2 px-4 py-2 text-sm font-bold text-ink-2 transition-all hover:border-sienna hover:text-sienna"
                >
                  <span className="text-left">
                    <span className="block text-[10px] font-normal text-ink-3">پرونده‌ی بعدی</span>
                    {next.name}
                  </span>
                  <ArrowNext className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
