import React, { useState } from "react";
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
import {
  ItemCard,
  ItemModal,
  PortholeStrip,
  SearchBox,
  SectionHead,
  TickerBar,
  TimelineSection,
  useRevealAll,
} from "./components";

type View = { t: "home" } | { t: "cat"; id: CategoryId };

const DUST = [
  { right: "10%", top: "30%", d: "0s" },
  { right: "24%", top: "55%", d: "1.8s" },
  { right: "68%", top: "22%", d: "0.9s" },
  { right: "83%", top: "48%", d: "2.6s" },
  { right: "52%", top: "66%", d: "3.4s" },
  { right: "40%", top: "18%", d: "4.4s" },
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

/* ───────────────────────────── نمایش دسته ───────────────────────────── */

const CategoryView: React.FC<{
  cat: Category;
  onOpen: (item: Item, list: Item[]) => void;
  onBack: () => void;
}> = ({ cat, onOpen, onBack }) => {
  const [filter, setFilter] = useState<"all" | StatusId>("all");
  const all = ITEMS.filter((i) => i.category === cat.id).sort((a, b) => a.year - b.year);
  const shown = filter === "all" ? all : all.filter((i) => i.status === filter);
  const Icon = CATEGORY_ICONS[cat.icon];
  const minYear = Math.min(...all.map((i) => i.year));
  const maxYear = Math.max(...all.map((i) => i.year));

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      <button
        onClick={onBack}
        className="group flex items-center gap-2 rounded-full border border-line-2 bg-cream/70 px-4 py-2 text-sm font-bold text-ink-2 transition-all hover:border-sienna hover:text-sienna"
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

      {/* فیلتر وضعیت */}
      <div className="reveal mt-8 flex flex-wrap items-center gap-2">
        <span className="ml-2 text-sm font-bold text-ink-3">برچسب‌ها:</span>
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${
            filter === "all"
              ? "border-ink bg-ink text-paper"
              : "border-line-2 bg-cream/60 text-ink-2 hover:border-ink"
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
                color: STATUS[s].color,
                background: active ? STATUS[s].color : "transparent",
              }}
              className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${
                active ? "text-cream" : "hover:opacity-70"
              }`}
            >
              {STATUS[s].fa} · {toFa(n)}
            </button>
          );
        })}
      </div>

      {/* شبکه‌ی اشیاء */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((it, i) => (
          <ItemCard key={it.id} item={it} index={i} onOpen={(x) => onOpen(x, shown)} />
        ))}
      </div>
      {shown.length === 0 && (
        <p className="mt-10 rounded-lg border border-dashed border-line-2 py-12 text-center text-ink-3">
          هیچ شیئی با این برچسب در این تالار نیست.
        </p>
      )}

      <p className="mt-8 text-center text-xs text-ink-3">
        اشیای این تالار به ترتیب سال تولد چیده شده‌اند · سال‌ها میلادی‌اند
      </p>
    </main>
  );
};

/* ───────────────────────────── صفحه‌ی اصلی ───────────────────────────── */

const App: React.FC = () => {
  const [view, setView] = useState<View>({ t: "home" });
  const [modal, setModal] = useState<{ item: Item; list: Item[] } | null>(null);
  useRevealAll();

  const openItem = (item: Item, list?: Item[]) =>
    setModal({ item, list: list ?? ITEMS });

  const openCat = (id: CategoryId) => {
    setView({ t: "cat", id });
    window.scrollTo(0, 0);
  };

  const goAnchor = (id: string) => {
    setView({ t: "home" });
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  const years = ITEMS.map((i) => i.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const portholes = PORTHOLE_IDS.map((id) => ITEMS.find((i) => i.id === id)!).filter(Boolean);

  return (
    <div className="min-h-screen font-body text-ink">
      <div className="grain-layer" aria-hidden />

      {/* نوار بالای چسبان + جستجو */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <button onClick={() => { setView({ t: "home" }); window.scrollTo(0, 0); }} className="flex shrink-0 items-center gap-2">
            <StarBurst className="animate-spin-slow h-6 w-6 text-sienna" />
            <span className="font-display text-2xl font-bold leading-none">شهرفرنگ</span>
            <span className="font-type mt-1 hidden text-[8px] tracking-[0.25em] text-ink-3 lg:block" dir="ltr">
              RETIRED OBJECTS
            </span>
          </button>
          <span className="hidden h-6 w-px bg-line-2 sm:block" />
          <nav className="hidden shrink-0 items-center gap-1 sm:flex">
            <button onClick={() => goAnchor("halls")} className="rounded-full px-3 py-1.5 text-[13px] font-bold text-ink-2 transition-colors hover:bg-paper-2 hover:text-sienna">
              تالارها
            </button>
            <button onClick={() => goAnchor("timeline")} className="rounded-full px-3 py-1.5 text-[13px] font-bold text-ink-2 transition-colors hover:bg-paper-2 hover:text-sienna">
              تایم‌لاین
            </button>
          </nav>
          <div className="min-w-0 flex-1 sm:max-w-md sm:mr-auto">
            <SearchBox compact onOpen={(i) => openItem(i, searchList(i))} />
          </div>
        </div>
      </header>

      {view.t === "cat" ? (
        <CategoryView
          cat={catById(view.id)}
          onBack={() => { setView({ t: "home" }); window.scrollTo(0, 0); }}
          onOpen={openItem}
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

            <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-14 text-center sm:pt-20">
              <div className="reveal mx-auto flex w-fit items-center gap-2 rounded-full border border-line-2 bg-cream/70 px-4 py-1.5 text-[12px] font-bold text-ink-2">
                <TicketIcon className="h-4 w-4 text-sienna" />
                بلیط ورود · رایگان برای همه‌ی دلتنگ‌ها
                <span className="font-type text-[9px] tracking-[0.2em] text-ink-3" dir="ltr">
                  EST. 1404
                </span>
              </div>

              <h1 className="font-display reveal mt-6 text-7xl font-bold leading-none text-ink sm:text-8xl lg:text-9xl">
                شهرفرنگ
                <span className="mr-3 inline-block text-3xl text-gold sm:text-5xl">✦</span>
              </h1>
              <p className="font-display reveal mt-2 text-3xl font-medium text-sienna sm:text-4xl">
                موزه‌ی اشیای بازنشسته
              </p>
              <p className="font-type reveal mt-3 text-[11px] tracking-[0.35em] text-ink-3" dir="ltr">
                SHAHR-E FARANG · MUSEUM OF RETIRED OBJECTS
              </p>
              <p className="reveal mx-auto mt-6 max-w-2xl text-[15px] leading-8 text-ink-2">
                اینجا تالارِ چیزهایی است که روزگاری وسطِ زندگی بودند و حالا پشت شیشه‌اند؛
                از تلگراف و تایپ‌رایتر تا آتاری و پیکان. چراغ‌ها را کم کرده‌ایم،
                غبارِ خاطره را پاک نکرده‌ایم — بفرمایید قدم بزنید.
              </p>

              <div className="reveal mt-8">
                <SearchBox onOpen={(i) => openItem(i, searchList(i))} />
                <p className="mt-2 text-[11px] text-ink-3">
                  {toFa(ITEMS.length)} پرونده در گنجینه · نام شی، دسته یا توضیحش را جستجو کنید
                </p>
              </div>

              <div className="reveal mt-12">
                <p className="font-type mb-4 text-[10px] tracking-[0.3em] text-ink-3">
                  از دریچه‌های شهرفرنگ نگاه کنید
                </p>
                <PortholeStrip items={portholes} onOpen={(i) => openItem(i)} />
              </div>

              {/* بلیط آمار */}
              <div className="reveal relative mx-auto mt-14 max-w-3xl rounded-xl border border-line bg-cream shadow-[0_20px_40px_-25px_rgba(43,32,20,0.5)]">
                <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-line bg-paper" aria-hidden />
                <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-line bg-paper" aria-hidden />
                <div className="grid grid-cols-2 divide-x divide-y divide-dashed divide-line-2 sm:grid-cols-4 sm:divide-y-0">
                  {[
                    { v: toFa(ITEMS.length), l: "شیء ثبت‌شده" },
                    { v: toFa(CATEGORIES.length), l: "تالار موضوعی" },
                    { v: `${toFa(minYear)}–${toFa(maxYear)}`, l: "بازه‌ی زمانی" },
                    { v: toFa(LEGENDARY.length), l: "شیء افسانه‌ای" },
                  ].map((s, i) => (
                    <div key={i} className="px-4 py-6">
                      <p className="font-display text-4xl font-bold leading-none text-sienna">{s.v}</p>
                      <p className="mt-2 text-xs font-bold text-ink-3">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <TickerBar onOpen={(i) => openItem(i)} />

          {/* ═══ تالارها ═══ */}
          <section id="halls" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
            <SectionHead no="۰۱" title="تالارهای موزه" en="THE HALLS" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORIES.map((c, idx) => {
                const Icon = CATEGORY_ICONS[c.icon];
                const count = ITEMS.filter((i) => i.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => openCat(c.id)}
                    style={{ transitionDelay: `${(idx % 4) * 80}ms` }}
                    className="reveal group aged-card rounded-lg p-5 text-right transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_45px_-20px_rgba(43,32,20,0.55)] cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-type text-[10px] tracking-[0.25em] text-gold-3">{c.code}</span>
                      <span className="rounded-full border border-line-2 bg-cream/70 px-2.5 py-0.5 text-[11px] font-bold text-ink-2">
                        {toFa(count)} شیء
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
                );
              })}
            </div>
          </section>

          {/* ═══ افسانه‌ها ═══ */}
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
            <SectionHead no="۰۲" title="افسانه‌های تالار" en="HALL OF LEGENDS" />
            <div className="no-scrollbar flex snap-x gap-5 overflow-x-auto pb-4">
              {LEGENDARY.map((it, i) => (
                <ItemCard key={it.id} item={it} index={i} wide onOpen={(x) => openItem(x, LEGENDARY)} />
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-ink-3 sm:hidden">
              ← برای دیدن بقیه‌ی افسانه‌ها بکشید →
            </p>
          </section>

          {/* ═══ تایم‌لاین سراسری ═══ */}
          <section id="timeline" className="dark-panel relative scroll-mt-20 overflow-hidden py-16 text-paper sm:py-20">
            <StarBurst className="pointer-events-none absolute -left-24 top-10 h-72 w-72 text-gold/10" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
              <SectionHead no="۰۳" title="سفر در زمان" en="THE GRAND TIMELINE" dark />
              <TimelineSection onOpen={(i) => openItem(i)} />
            </div>
          </section>

          {/* ═══ آیین‌نامه ═══ */}
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid gap-12 md:grid-cols-2">
              <div className="reveal">
                <SectionHead no="۰۴" title="درباره‌ی شهرفرنگ" en="ABOUT THE MUSEUM" />
                <blockquote className="font-display border-s-4 border-sienna ps-5 text-3xl font-medium leading-[1.9] text-ink sm:text-4xl">
                  «هر چیزی که اینجا نشسته، روزی صدای زندگی بود؛
                  حالا فقط منتظر است کسی دوباره صدایش بزند.»
                </blockquote>
                <p className="mt-6 text-[15px] leading-8 text-ink-2">
                  شهرفرنگ نامِ صندوق‌های نقاشی‌شده‌ای بود که در قهوه‌خانه‌های قدیم، پشت دریچه‌های
                  کوچک‌شان دنیاهای دوردست نشان می‌دادند. ما همان صندوق را دیجیتال کرده‌ایم؛
                  با این تفاوت که دنیای داخلش، دنیای خودمان است — دنیایی که دیسکت داشت،
                  برفک داشت، و نامه‌هایش بوی کاربن می‌داد.
                </p>
                <p className="mt-4 text-[15px] leading-8 text-ink-2">
                  هر پرونده در این موزه سه نشانه دارد: برچسب وضعیت، شناسنامه‌ی سازنده،
                  و تایم‌لاینِ نسل‌ها. اگر شیئی گم‌شده می‌شناسید، جایش همین‌جاست.
                </p>
              </div>
              <div className="reveal" style={{ transitionDelay: "120ms" }}>
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
              </div>
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
              <span className="font-display text-3xl font-bold">شهرفرنگ</span>
            </div>
            <p className="mt-3 text-[13px] leading-7 text-paper/70">
              موزه‌ی دیجیتال اشیای بازنشسته؛ جایی برای قدم‌زدن میان چیزهایی
              که زمانی همه‌چیز بودند.
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
                const it = ITEMS.find((i) => i.id === id)!;
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
                <span>شنبه تا چهارشنبه</span><span className="text-gold-2">۰۸ تا ۲۳</span>
              </li>
              <li className="flex justify-between gap-3 border-b border-dashed border-paper/15 pb-2">
                <span>پنجشنبه‌ها</span><span className="text-gold-2">تا دیروقت</span>
              </li>
              <li className="flex justify-between gap-3 border-b border-dashed border-paper/15 pb-2">
                <span>جمعه‌ها</span><span className="text-gold-2">وقتی دلتان گرفت</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>تعطیلات</span><span className="text-gold-2">موزه هرگز نمی‌خوابد</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-paper/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-right">
            <p className="text-[12px] text-paper/60">
              © {toFa(1404)} شهرفرنگ — ساخته‌شده با نوستالژی و کمی غبار
            </p>
            <p className="font-type text-[9px] tracking-[0.3em] text-gold-2/60" dir="ltr">
              ALL OBJECTS RETIRED WITH HONOR · 1801–2000
            </p>
          </div>
        </div>
      </footer>

      {modal && (
        <ItemModal
          item={modal.item}
          list={modal.list}
          onClose={() => setModal(null)}
          onNav={(it) => setModal({ item: it, list: modal.list })}
        />
      )}
    </div>
  );
};

/* لیستِ جستجو برای پیمایش بین پرونده‌ها در مودال */
const searchList = (i: Item): Item[] => {
  const r = searchItems(i.name);
  return r.length ? r : ITEMS;
};

export default App;
