/* ============================================================
   شهرفرنگ — موزه‌ی اشیای بازنشسته (نسخه‌ی پیشرفته)
   ============================================================ */

import React, { useCallback, useMemo, useState } from "react";
import {
  CATEGORIES,
  Category,
  CategoryId,
  Item,
  ITEMS,
  LEGENDARY,
  STATUS,
  StatusId,
  catById,
  searchItems,
  toFa,
} from "./data";
import {
  ArrowPrev,
  CATEGORY_ICONS,
  CornerOrnament,
  StarBurst,
  TicketIcon,
} from "./icons";
import { GAMES, type Game } from "./games";
import { AdminDashboard } from "./AdminDashboard";
import { getSettings } from "./adminStore";
import { CINEMA_HALL, SERIES_HALL } from "./cinema";
import { MediaHallView } from "./MediaHall";
import {
  useCountUp,
  useHashItem,
  useInView,
  useLocalStorage,
  useMuseumSound,
  useReducedMotion,
} from "./hooks";
import {
  BackToTop,
  DiceIcon,
  FavoritesDrawer,
  GamesHallView,
  Guestbook,
  IntroOverlay,
  GameModal,
  ItemCard,
  ItemModal,
  LegendaryStrip,
  NostalgiaSection,
  PortholeStrip,
  Reveal,
  ScrollProgress,
  SearchBox,
  SectionHead,
  SoundOffIcon,
  SoundOnIcon,
  TickerBar,
  TimelineSection,
  BookmarkIcon,
} from "./components";

type View = { t: "home" } | { t: "cat"; id: CategoryId } | { t: "admin" };

const DUST = [
  { right: "10%", top: "30%", d: "0s" },
  { right: "24%", top: "55%", d: "1.8s" },
  { right: "68%", top: "22%", d: "0.9s" },
  { right: "83%", top: "48%", d: "2.6s" },
  { right: "52%", top: "66%", d: "3.4s" },
  { right: "40%", top: "18%", d: "4.4s" },
  { right: "15%", top: "72%", d: "5.2s" },
  { right: "90%", top: "70%", d: "6.1s" },
];

const PORTHOLE_IDS = [
  "phonograph",
  "paykan",
  "atari2600",
  "nokia3310",
  "polaroid",
  "typewriter",
  "vhs",
  "modelt",
];

/* ───────────────────── آمار با شمارنده ───────────────────── */

const Stat: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const v = useCountUp(value, inView);
  return (
    <div ref={ref} className="px-4 py-6">
      <p className="font-display text-4xl font-bold leading-none text-sienna sm:text-[42px]">{toFa(v)}</p>
      <p className="mt-2 text-xs font-bold text-ink-3">{label}</p>
    </div>
  );
};

/* ───────────────────── نمای تالار (دسته) ───────────────────── */

const CategoryView: React.FC<{
  cat: Category;
  favs: string[];
  onOpen: (item: Item, list: Item[]) => void;
  onToggleSave: (i: Item) => void;
  onBack: () => void;
}> = ({ cat, favs, onOpen, onToggleSave, onBack }) => {
  const [filter, setFilter] = useState<"all" | StatusId>("all");
  const [sortKey, setSortKey] = useState<"year-asc" | "year-desc" | "name">("year-asc");
  const all = useMemo(() => ITEMS.filter((i) => i.category === cat.id), [cat.id]);
  const shown = useMemo(() => {
    const arr = (filter === "all" ? all : all.filter((i) => i.status === filter)).slice();
    if (sortKey === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "fa"));
    else arr.sort((a, b) => (sortKey === "year-asc" ? a.year - b.year : b.year - a.year));
    return arr;
  }, [all, filter, sortKey]);

  const Icon = CATEGORY_ICONS[cat.icon];
  const minYear = Math.min(...all.map((i) => i.year));
  const maxYear = Math.max(...all.map((i) => i.year));

  const sortBtns: { k: typeof sortKey; fa: string }[] = [
    { k: "year-asc", fa: "تولد ↑" },
    { k: "year-desc", fa: "تولد ↓" },
    { k: "name", fa: "نام" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">
      {/* مسیر بازدید */}
      <nav className="flex items-center gap-2 text-[12.5px] text-ink-3">
        <button onClick={onBack} className="font-bold text-gold-3 transition-colors hover:text-sienna">
          شهرفرنگ
        </button>
        <span className="text-line-2">‹</span>
        <span className="font-bold text-ink-2">{cat.fa}</span>
      </nav>

      <button
        onClick={onBack}
        className="group mt-4 flex items-center gap-2 rounded-full border border-line-2 bg-cream/70 px-4 py-2 text-sm font-bold text-ink-2 transition-all hover:border-sienna hover:text-sienna active:scale-95"
      >
        <ArrowPrev className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        بازگشت به تالار اصلی
      </button>

      {/* لوح سردر تالار */}
      <div className="aged-card mt-6 flex flex-col items-start gap-6 rounded-2xl p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-[3px] border-double border-gold-3 bg-[radial-gradient(circle_at_50%_35%,#fbf3dd,#e9d8b0_78%)] text-gold-3 shadow-[inset_0_3px_14px_rgba(120,80,30,0.3)]">
          <Icon className="h-12 w-12" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-type text-[11px] tracking-[0.3em] text-gold-3" dir="ltr">
            {cat.code} — {cat.en}
          </p>
          <h1 className="font-display mt-1 text-4xl font-bold text-ink sm:text-5xl">{cat.fa}</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-ink-2">{cat.blurb}</p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="font-display text-5xl font-bold text-sienna">{toFa(all.length)}</p>
          <p className="mt-1 text-xs font-bold text-ink-3">شیء ثبت‌شده</p>
          <p className="font-type mt-2 text-[11px] tracking-widest text-ink-3" dir="ltr">
            {toFa(minYear)} – {toFa(maxYear)}
          </p>
        </div>
      </div>

      {/* فیلتر و چینش */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="ml-1 text-sm font-bold text-ink-3">برچسب‌ها:</span>
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all active:scale-95 ${
            filter === "all" ? "border-ink bg-ink text-paper" : "border-line-2 bg-cream/60 text-ink-2 hover:border-ink"
          }`}
        >
          همه · {toFa(all.length)}
        </button>
        {(Object.keys(STATUS) as StatusId[]).map((s) => {
          const n = all.filter((i) => i.status === s).length;
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(active ? "all" : s)}
              style={{
                borderColor: STATUS[s].color,
                color: active ? "#fbf5e6" : STATUS[s].color,
                background: active ? STATUS[s].color : "transparent",
              }}
              className="rounded-full border px-4 py-1.5 text-sm font-bold transition-all hover:opacity-75 active:scale-95"
            >
              {STATUS[s].fa} · {toFa(n)}
            </button>
          );
        })}
        <span className="mr-auto flex items-center gap-1.5 rounded-full border border-line-2 bg-cream/60 p-1">
          <span className="px-2 text-[11px] font-bold text-ink-3">چینش:</span>
          {sortBtns.map((b) => (
            <button
              key={b.k}
              onClick={() => setSortKey(b.k)}
              className={`rounded-full px-3 py-1 text-[12px] font-bold transition-all active:scale-95 ${
                sortKey === b.k ? "bg-gold-3 text-cream shadow" : "text-ink-2 hover:text-gold-3"
              }`}
            >
              {b.fa}
            </button>
          ))}
        </span>
      </div>

      {/* شبکه‌ی اشیاء */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((it, i) => (
          <ItemCard
            key={it.id}
            item={it}
            index={i}
            saved={favs.includes(it.id)}
            onToggleSave={onToggleSave}
            onOpen={(x) => onOpen(x, shown)}
          />
        ))}
      </div>
      {shown.length === 0 && (
        <p className="mt-10 rounded-lg border border-dashed border-line-2 py-12 text-center text-ink-3">
          هیچ شیئی با این برچسب در این تالار نیست.
        </p>
      )}

      <p className="mt-8 text-center text-xs text-ink-3">
        {toFa(shown.length)} پرونده در این نما · سال‌ها میلادی‌اند
      </p>
    </main>
  );
};

/* ───────────────────── صفحه‌ی اصلی ───────────────────── */

const App: React.FC = () => {
  const [view, setView] = useState<View>({ t: "home" });
  const [navList, setNavList] = useState<Item[]>(ITEMS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [gameModal, setGameModal] = useState<Game | null>(null);
  const [favs, setFavs] = useLocalStorage<string[]>("sf-favs", []);
  const [soundOn, setSoundOn] = useLocalStorage<boolean>("sf-sound", true);
  const { click, thunk } = useMuseumSound(soundOn);
  const [hashId, setHash] = useHashItem();
  const reduced = useReducedMotion();
  const [intro, setIntro] = useState(() => {
    try {
      return !window.sessionStorage.getItem("sf-intro");
    } catch {
      return true;
    }
  });

  const modalItem = useMemo(() => (hashId ? ITEMS.find((i) => i.id === hashId) ?? null : null), [hashId]);
  const favItems = useMemo(() => favs.map((id) => ITEMS.find((i) => i.id === id)).filter((x): x is Item => !!x), [favs]);

  const openItem = useCallback(
    (item: Item, list?: Item[]) => {
      click();
      setNavList(list ?? ITEMS);
      setHash(item.id);
    },
    [click, setHash]
  );

  const toggleSave = useCallback(
    (i: Item) => {
      thunk();
      setFavs((prev) => (prev.includes(i.id) ? prev.filter((x) => x !== i.id) : [...prev, i.id]));
    },
    [thunk, setFavs]
  );

  const openCat = (id: CategoryId) => {
    click();
    setView({ t: "cat", id });
    window.scrollTo(0, 0);
  };

  const goAnchor = (id: string) => {
    click();
    setView({ t: "home" });
    setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" }),
      90
    );
  };

  const randomTicket = () => {
    thunk();
    const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    setNavList(ITEMS);
    setHash(it.id);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) setTimeout(thunk, 80);
  };

  const years = ITEMS.map((i) => i.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const portholes = PORTHOLE_IDS.map((id) => ITEMS.find((i) => i.id === id)).filter((x): x is Item => !!x);

  return (
    <div className="min-h-screen font-body text-ink">
      <div className="grain-layer" aria-hidden />
      {intro && !reduced && getSettings().showIntro && (
        <IntroOverlay
          onDone={() => {
            setIntro(false);
            try {
              window.sessionStorage.setItem("sf-intro", "1");
            } catch {
              /* بی‌خیال */
            }
          }}
        />
      )}

      {view.t === "admin" ? (
        <AdminDashboard
          onExit={() => {
            setView({ t: "home" });
            window.scrollTo(0, 0);
          }}
        />
      ) : (
        <>
      {/* ═══ نوار بالای چسبان ═══ */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 py-2.5 sm:px-6">
          <button
            onClick={() => {
              setView({ t: "home" });
              window.scrollTo(0, 0);
            }}
            className="flex shrink-0 items-center gap-2"
            aria-label="سردر شهرفرنگ"
          >
            <StarBurst className="animate-spin-slow h-6 w-6 text-sienna" />
            <span className="font-display text-2xl font-bold leading-none">{getSettings().siteTitle}</span>
            <span className="font-type mt-1 hidden text-[8px] tracking-[0.25em] text-ink-3 xl:block" dir="ltr">
              RETIRED OBJECTS
            </span>
          </button>
          <span className="hidden h-6 w-px bg-line-2 md:block" />
          <nav className="hidden shrink-0 items-center gap-1 md:flex">
            <button onClick={() => goAnchor("halls")} className="rounded-full px-3 py-1.5 text-[13px] font-bold text-ink-2 transition-colors hover:bg-paper-2 hover:text-sienna">
              تالارها
            </button>
            <button onClick={() => goAnchor("decades")} className="rounded-full px-3 py-1.5 text-[13px] font-bold text-ink-2 transition-colors hover:bg-paper-2 hover:text-sienna">
              دهه‌ها
            </button>
            <button onClick={() => goAnchor("timeline")} className="rounded-full px-3 py-1.5 text-[13px] font-bold text-ink-2 transition-colors hover:bg-paper-2 hover:text-sienna">
              تایم‌لاین
            </button>
            <button onClick={() => goAnchor("guestbook")} className="rounded-full px-3 py-1.5 text-[13px] font-bold text-ink-2 transition-colors hover:bg-paper-2 hover:text-sienna">
              یادگاری
            </button>
          </nav>
          <div className="min-w-0 flex-1 sm:ms-auto sm:max-w-xs lg:max-w-sm">
            <SearchBox
              size="sm"
              onOpen={(i) => openItem(i, searchList(i))}
              onOpenGame={(g) => {
                click();
                setGameModal(g);
              }}
            />
          </div>
          <button
            onClick={randomTicket}
            title="یک پرونده‌ی تصادفی باز کن"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-sienna/50 bg-sienna/10 px-3.5 py-1.5 text-[12.5px] font-bold text-sienna transition-all hover:bg-sienna hover:text-cream active:scale-95 lg:flex"
          >
            <DiceIcon className="h-4 w-4" />
            بلیط شانس
          </button>
          <button
            onClick={() => {
              click();
              setDrawerOpen(true);
            }}
            title="دفترچه‌ی بازدیدکننده"
            aria-label="دفترچه‌ی بازدیدکننده"
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-2 text-ink-2 transition-all hover:border-gold hover:text-gold-3 active:scale-90"
          >
            <BookmarkIcon className="h-4 w-4" filled={favs.length > 0} />
            {favs.length > 0 && (
              <span className="absolute -left-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-sienna px-1 text-[9px] font-bold text-cream">
                {toFa(favs.length)}
              </span>
            )}
          </button>
          <button
            onClick={toggleSound}
            title={soundOn ? "خاموش‌کردن صدای ماشین تحریر" : "روشن‌کردن صدای ماشین تحریر"}
            aria-label="تنظیم صدا"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all active:scale-90 ${
              soundOn ? "border-gold/70 bg-gold/15 text-gold-3" : "border-line-2 text-ink-3 hover:border-gold"
            }`}
          >
            {soundOn ? <SoundOnIcon className="h-4 w-4" /> : <SoundOffIcon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              click();
              setView({ t: "admin" });
              window.scrollTo(0, 0);
            }}
            title="پیشخوان مدیریت"
            aria-label="پیشخوان مدیریت"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-2 text-ink-3 transition-all hover:border-gold hover:bg-gold/10 hover:text-gold-3 active:scale-90"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3.2" />
              <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.5-2.4 1a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4L9.6 5a7.7 7.7 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.5 2.4-1a7.7 7.7 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.7 7.7 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5Z" />
            </svg>
          </button>
        </div>
        <ScrollProgress />
      </header>

      {view.t === "cat" && view.id === "games" ? (
        <GamesHallView
          onBack={() => {
            setView({ t: "home" });
            window.scrollTo(0, 0);
          }}
          onOpenItem={(i) => openItem(i)}
        />
      ) : view.t === "cat" && (view.id === "cinema" || view.id === "series") ? (
        <MediaHallView
          cfg={view.id === "cinema" ? CINEMA_HALL : SERIES_HALL}
          onBack={() => {
            setView({ t: "home" });
            window.scrollTo(0, 0);
          }}
        />
      ) : view.t === "cat" ? (
        <CategoryView
          cat={catById(view.id)}
          favs={favs}
          onBack={() => {
            setView({ t: "home" });
            window.scrollTo(0, 0);
          }}
          onOpen={openItem}
          onToggleSave={toggleSave}
        />
      ) : (
        <>
          {/* ═══ سردر موزه ═══ */}
          <section className="relative overflow-hidden">
            <div className="sunburst pointer-events-none absolute inset-0" aria-hidden />
            {DUST.map((d, i) => (
              <span
                key={i}
                aria-hidden
                className="dust pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-gold-2/60"
                style={{ right: d.right, top: d.top, animationDelay: d.d }}
              />
            ))}
            <CornerOrnament className="pointer-events-none absolute right-4 top-4 h-10 w-10 text-gold-3/60 sm:h-14 sm:w-14" />
            <CornerOrnament className="pointer-events-none absolute left-4 top-4 h-10 w-10 rotate-90 text-gold-3/60 sm:h-14 sm:w-14" />
            <CornerOrnament className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 -rotate-90 text-gold-3/60 sm:h-14 sm:w-14" />
            <CornerOrnament className="pointer-events-none absolute bottom-4 left-4 h-10 w-10 rotate-180 text-gold-3/60 sm:h-14 sm:w-14" />

            <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-12 text-center sm:pt-16">
              <Reveal>
                <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-line-2 bg-cream/70 px-4 py-1.5 text-[12px] font-bold text-ink-2">
                  <TicketIcon className="h-4 w-4 text-sienna" />
                  بلیط ورود · رایگان برای همه‌ی دلتنگ‌ها
                  <span className="font-type text-[9px] tracking-[0.2em] text-ink-3" dir="ltr">
                    EST. 1404
                  </span>
                </div>
              </Reveal>

              <Reveal delay={90}>
                <h1 className="font-display mt-6 text-7xl font-bold leading-none text-ink sm:text-8xl lg:text-9xl">
                  شهرفرنگ
                  <span className="mr-3 inline-block text-3xl text-gold sm:text-5xl">✦</span>
                </h1>
                <p className="font-display mt-2 text-3xl font-medium text-sienna sm:text-4xl">موزه‌ی اشیای بازنشسته</p>
                <p className="font-type mt-3 text-[11px] tracking-[0.35em] text-ink-3" dir="ltr">
                  SHAHR-E FARANG · MUSEUM OF RETIRED OBJECTS
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-8 text-ink-2">
                  اینجا تالارِ چیزهایی است که روزگاری وسطِ زندگی بودند و حالا پشت شیشه‌اند؛ از تلگراف و
                  تایپ‌رایتر تا آتاری و پیکان. چراغ‌ها را کم کرده‌ایم، غبارِ خاطره را پاک نکرده‌ایم —
                  بفرمایید قدم بزنید.
                </p>
              </Reveal>

              <Reveal delay={180} className="mt-8">
                <SearchBox
                  onOpen={(i) => openItem(i, searchList(i))}
                  onOpenGame={(g) => {
                    click();
                    setGameModal(g);
                  }}
                />
                <p className="mt-2.5 text-[11px] text-ink-3">
                  {toFa(ITEMS.length)} پرونده در گنجینه · نام شی، دسته یا توضیحش را جستجو کنید
                </p>
              </Reveal>

              <Reveal delay={240} className="mt-10">
                <p className="font-type mb-5 text-[10px] tracking-[0.3em] text-ink-3">از دریچه‌های شهرفرنگ نگاه کنید</p>
                <PortholeStrip items={portholes} onOpen={(i) => openItem(i)} />
              </Reveal>

              {/* بلیط آمار */}
              <Reveal delay={120} className="relative mx-auto mt-12 max-w-3xl">
                <button
                  onClick={randomTicket}
                  title="یک پرونده‌ی کاملاً تصادفی"
                  className="wobble-slow absolute -left-4 -top-8 z-10 hidden h-24 w-24 rotate-6 place-items-center rounded-full border-2 border-dashed border-sienna bg-cream text-center shadow-[0_14px_28px_-14px_rgba(168,67,31,0.6)] transition-all hover:scale-110 hover:rotate-12 active:scale-95 sm:grid"
                >
                  <span>
                    <DiceIcon className="mx-auto h-5 w-5 text-sienna" />
                    <span className="font-display block text-lg font-bold leading-6 text-sienna">بلیط شانس</span>
                    <span className="font-type block text-[7px] tracking-[0.2em] text-ink-3" dir="ltr">
                      RANDOM
                    </span>
                  </span>
                </button>
                <div className="relative rounded-xl border border-line bg-cream shadow-[0_24px_48px_-26px_rgba(43,32,20,0.55)]">
                  <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-line bg-paper" aria-hidden />
                  <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-line bg-paper" aria-hidden />
                  <div className="grid grid-cols-2 divide-x divide-y divide-dashed divide-line-2 sm:grid-cols-4 sm:divide-y-0">
                    <Stat value={ITEMS.length} label="شیء ثبت‌شده" />
                    <Stat value={CATEGORIES.length} label="تالار موضوعی" />
                    <div className="px-4 py-6">
                      <p className="font-display text-3xl font-bold leading-[42px] text-sienna sm:text-4xl">
                        {toFa(minYear)}–{toFa(maxYear)}
                      </p>
                      <p className="mt-2 text-xs font-bold text-ink-3">بازه‌ی زمانی</p>
                    </div>
                    <Stat value={LEGENDARY.length} label="شیء افسانه‌ای" />
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <TickerBar onOpen={(i) => openItem(i)} />

          {/* ═══ تالارها ═══ */}
          <section id="halls" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
            <SectionHead no="۰۱" title="تالارهای موزه" en="THE HALLS" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {CATEGORIES.map((c, idx) => {
                const Icon = CATEGORY_ICONS[c.icon];
                const count =
                  c.id === "games"
                    ? GAMES.length
                    : c.id === "cinema"
                    ? CINEMA_HALL.entries.length
                    : c.id === "series"
                    ? SERIES_HALL.entries.length
                    : ITEMS.filter((i) => i.category === c.id).length;
                const unit = c.id === "cinema" ? "فیلم" : c.id === "series" ? "سریال" : c.id === "games" ? "بازی" : "شیء";
                return (
                  <Reveal key={c.id} delay={(idx % 4) * 80}>
                    <button
                      onClick={() => openCat(c.id)}
                      className="group aged-card w-full cursor-pointer rounded-lg p-5 text-right transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_45px_-20px_rgba(43,32,20,0.55)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-type text-[10px] tracking-[0.25em] text-gold-3">{c.code}</span>
                        <span className="rounded-full border border-line-2 bg-cream/70 px-2.5 py-0.5 text-[11px] font-bold text-ink-2">
                          {toFa(count)} {unit}
                        </span>
                      </div>
                      <span className="mt-4 grid h-16 w-16 place-items-center rounded-full border-2 border-line-2 bg-cream text-gold-3 shadow-[inset_0_2px_8px_rgba(120,80,30,0.18)] transition-all duration-300 group-hover:rotate-6 group-hover:border-gold group-hover:text-sienna">
                        <Icon className="h-8 w-8" />
                      </span>
                      <h3 className="font-display mt-4 text-2xl font-bold leading-9 text-ink">{c.fa}</h3>
                      <p className="font-type text-[9px] tracking-[0.22em] text-ink-3" dir="ltr">
                        {c.en}
                      </p>
                      <p className="mt-2 text-[12.5px] leading-6 text-ink-2">{c.blurb}</p>
                      <span className="mt-4 flex items-center gap-1.5 text-xs font-bold text-gold-3">
                        ورود به تالار
                        <ArrowPrev className="h-3.5 w-3.5 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </section>

          {/* ═══ افسانه‌ها ═══ */}
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
            <SectionHead no="۰۲" title="افسانه‌های تالار" en="HALL OF LEGENDS" />
            <LegendaryStrip items={LEGENDARY} favs={favs} onOpen={(x) => openItem(x, LEGENDARY)} onToggleSave={toggleSave} />
          </section>

          {/* ═══ اتاق خاطره‌ی دهه‌ها ═══ */}
          <section id="decades" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-16 sm:px-6 sm:pb-20">
            <SectionHead no="۰۳" title="اتاق خاطره‌ی دهه‌ها" en="MEMORY ROOM · 60s–80s" />
            <NostalgiaSection />
          </section>

          {/* ═══ تایم‌لاین سراسری ═══ */}
          <section id="timeline" className="dark-panel relative scroll-mt-20 overflow-hidden py-16 text-paper sm:py-20">
            <StarBurst className="pointer-events-none absolute -left-24 top-10 h-72 w-72 text-gold/10" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
              <SectionHead no="۰۴" title="سفر در زمان" en="THE GRAND TIMELINE" dark />
              <TimelineSection onOpen={(i) => openItem(i)} favs={favs} onToggleSave={toggleSave} />
            </div>
          </section>

          {/* ═══ دفتر یادگاری ═══ */}
          <section id="guestbook" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
            <SectionHead no="۰۵" title="دفتر یادگاری" en="THE GUESTBOOK" />
            <Guestbook onStamp={thunk} />
          </section>

          {/* ═══ درباره و آیین‌نامه ═══ */}
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
            <div className="grid gap-12 md:grid-cols-2">
              <Reveal>
                <SectionHead no="۰۶" title="درباره‌ی شهرفرنگ" en="ABOUT THE MUSEUM" />
                <blockquote className="font-display border-s-4 border-sienna ps-5 text-3xl font-medium leading-[1.9] text-ink sm:text-4xl">
                  «هر چیزی که اینجا نشسته، روزی صدای زندگی بود؛ حالا فقط منتظر است کسی دوباره صدایش بزند.»
                </blockquote>
                <p className="mt-6 text-[15px] leading-8 text-ink-2">
                  شهرفرنگ نامِ صندوق‌های نقاشی‌شده‌ای بود که در قهوه‌خانه‌های قدیم، پشت دریچه‌های
                  کوچک‌شان دنیاهای دوردست نشان می‌دادند. ما همان صندوق را دیجیتال کرده‌ایم؛ با این تفاوت
                  که دنیای داخلش، دنیای خودمان است — دنیایی که دیسکت داشت، برفک داشت، و نامه‌هایش بوی
                  کاربن می‌داد.
                </p>
                <p className="mt-4 text-[15px] leading-8 text-ink-2">
                  هر پرونده در این موزه سه نشانه دارد: برچسب وضعیت، شناسنامه‌ی سازنده، و تایم‌لاینِ
                  نسل‌ها. اگر شیئی گم‌شده می‌شناسید، جایش همین‌جاست.
                </p>
              </Reveal>
              <Reveal delay={120}>
                <p className="font-type text-[11px] tracking-[0.3em] text-gold-3" dir="ltr">
                  VISITOR RULES
                </p>
                <h3 className="font-display mt-1 text-3xl font-bold text-ink">آیین‌نامه‌ی بازدید</h3>
                <ol className="mt-6">
                  {[
                    "به اشیاء دست نزنید؛ با یادِ دستانتان لمسشان کنید.",
                    "عکاسی با چشم آزاد است؛ فلاشِ خاطره ممنوع.",
                    "اگر شیئی شما را به یاد کسی انداخت، بلند سلام کنید.",
                    "خروج از موزه با دلتنگی مجاز است؛ بازگشت، همیشگی.",
                  ].map((r, i) => (
                    <li key={i} className="dash-row flex items-start gap-4 py-4">
                      <span className="font-type mt-0.5 rounded border border-line-2 bg-cream px-2 py-0.5 text-sm font-bold text-sienna">
                        {toFa(i + 1).padStart(2, "۰")}
                      </span>
                      <span className="text-[15px] leading-7 text-ink-2">{r}</span>
                    </li>
                  ))}
                </ol>
                <div className="aged-card mt-6 flex items-center gap-3 rounded-lg p-4 text-sm text-ink-2">
                  <TicketIcon className="h-8 w-8 shrink-0 text-sienna" />
                  <span>
                    بلیط شما همین نگاه است؛ تا هر وقت خواستید معتبر است.
                    <span className="font-type block text-[10px] tracking-[0.2em] text-ink-3" dir="ltr">
                      ADMIT ONE · FOREVER
                    </span>
                  </span>
                </div>
              </Reveal>
            </div>
          </section>
        </>
      )}

      {/* ═══ پانوشت ═══ */}
      <footer className="dark-panel border-t border-gold/20 text-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <StarBurst className="h-6 w-6 text-gold-2" />
              <span className="font-display text-3xl font-bold">{getSettings().siteTitle}</span>
            </div>
            <p className="mt-3 text-[13px] leading-7 text-paper/70">
              موزه‌ی دیجیتال اشیای بازنشسته؛ جایی برای قدم‌زدن میان چیزهایی که زمانی همه‌چیز بودند.
            </p>
            <p className="font-type mt-4 text-[9px] tracking-[0.25em] text-gold-2/70" dir="ltr">
              DIGITAL MUSEUM OF RETIRED OBJECTS
            </p>
          </div>
          <div>
            <h4 className="font-type text-[10px] tracking-[0.3em] text-gold-2/80" dir="ltr">
              HALLS
            </h4>
            <p className="font-display mt-2 text-2xl font-bold">تالارها</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <button onClick={() => openCat(c.id)} className="link-underline text-[13px] text-paper/75 transition-colors hover:text-gold-2">
                    {c.fa}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-type text-[10px] tracking-[0.3em] text-gold-2/80" dir="ltr">
              HOT FILES
            </h4>
            <p className="font-display mt-2 text-2xl font-bold">پرونده‌های داغ</p>
            <ul className="mt-3 space-y-2">
              {["paykan", "atari2600", "typewriter", "nokia3310", "polaroid"].map((id) => {
                const it = ITEMS.find((i) => i.id === id);
                if (!it) return null;
                return (
                  <li key={id}>
                    <button onClick={() => openItem(it)} className="link-underline flex items-center gap-2 text-[13px] text-paper/75 transition-colors hover:text-gold-2">
                      <span className="text-base">{it.image}</span>
                      {it.name}
                      <span className="font-type text-[10px] text-paper/40" dir="ltr">
                        {toFa(it.year)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4 className="font-type text-[10px] tracking-[0.3em] text-gold-2/80" dir="ltr">
              VISITING HOURS
            </h4>
            <p className="font-display mt-2 text-2xl font-bold">ساعات بازدید</p>
            <ul className="mt-3 space-y-2 text-[13px] text-paper/75">
              <li className="flex justify-between gap-3 border-b border-dashed border-paper/15 pb-2">
                <span>شنبه تا چهارشنبه</span>
                <span className="text-gold-2">۰۸ تا ۲۳</span>
              </li>
              <li className="flex justify-between gap-3 border-b border-dashed border-paper/15 pb-2">
                <span>پنجشنبه‌ها</span>
                <span className="text-gold-2">تا دیروقت</span>
              </li>
              <li className="flex justify-between gap-3 border-b border-dashed border-paper/15 pb-2">
                <span>جمعه‌ها</span>
                <span className="text-gold-2">وقتی دلتان گرفت</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>تعطیلات</span>
                <span className="text-gold-2">موزه هرگز نمی‌خوابد</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-paper/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-right">
            <p className="text-[12px] text-paper/60">© {toFa(1404)} شهرفرنگ — ساخته‌شده با نوستالژی و کمی غبار</p>
            <button
              onClick={() => {
                setView({ t: "admin" });
                window.scrollTo(0, 0);
              }}
              className="flex items-center gap-1.5 text-[12px] font-bold text-gold-2/80 transition-colors hover:text-gold-2"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.5-2.4 1a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4L9.6 5a7.7 7.7 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.5 2.4-1a7.7 7.7 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.7 7.7 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5Z" />
              </svg>
              پیشخوان مدیریت
            </button>
            <p className="font-type text-[9px] tracking-[0.3em] text-gold-2/60" dir="ltr">
              ALL OBJECTS RETIRED WITH HONOR · 1801–2000
            </p>
          </div>
        </div>
      </footer>
        </>
      )}

      {/* ═══ لایه‌های شناور ═══ */}
      {modalItem && (
        <ItemModal
          item={modalItem}
          list={navList}
          saved={favs.includes(modalItem.id)}
          onClose={() => setHash(null)}
          onNav={(it) => {
            click();
            setHash(it.id);
          }}
          onToggleSave={toggleSave}
          onOpenItem={(x) => openItem(x)}
          onGotoCat={(id) => {
            setHash(null);
            openCat(id);
          }}
        />
      )}

      {gameModal && (
        <GameModal
          game={gameModal}
          list={GAMES}
          onClose={() => setGameModal(null)}
          onNav={(g) => setGameModal(g)}
          onOpenItem={(i) => {
            setGameModal(null);
            openItem(i);
          }}
        />
      )}

      <FavoritesDrawer
        open={drawerOpen}
        items={favItems}
        onClose={() => setDrawerOpen(false)}
        onOpen={(i) => {
          setDrawerOpen(false);
          openItem(i);
        }}
        onRemove={toggleSave}
      />

      <BackToTop />
    </div>
  );
};

/* لیستِ جستجو برای پیمایش بین پرونده‌ها در مودال */
const searchList = (i: Item): Item[] => {
  const r = searchItems(i.name);
  return r.length ? r : ITEMS;
};

export default App;
