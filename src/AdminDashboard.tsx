/* ============================================================
   شهرفرنگ — پیشخوان مدیریت (Admin Dashboard)
   اتاق فرمان موزه: مدیریت همه‌ی بخش‌ها، آمار، پشتیبان‌گیری
   ============================================================ */

import React, { useMemo, useRef, useState } from "react";
import { CATEGORIES, STATUS, toFa, type Item, type StatusId } from "./data";
import { GENRES, PLATFORMS, type Game } from "./games";
import { CINEMA_HALL, SERIES_HALL, type MediaEntry } from "./cinema";
import { DECADES, GROUP_LABEL } from "./nostalgia";
import {
  commitGames,
  commitItems,
  commitMemories,
  commitMovies,
  commitSeries,
  deleteGuestNote,
  exportAll,
  getGuestNotes,
  getLog,
  getSettings,
  hallCounts,
  importAll,
  liveGames,
  liveItems,
  liveMemories,
  liveMovies,
  liveSeries,
  resetAll,
  saveSettings,
  useAdminVersion,
  type Memory,
} from "./adminStore";

/* ---------------- آیکون‌های کوچک ---------------- */
type IP = { className?: string };
const I = ({ d, className }: IP & { d: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Ic = {
  overview: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V10h-6v10Zm0-16v6h6V4h-6Z",
  box: "M21 8 12 3 3 8v8l9 5 9-5V8Zm-9 5L3 8m9 5 9-5m-9 5v8",
  game: "M6 12h4M8 10v4M15 11h.01M18 13h.01M17.3 5H6.7a4 4 0 0 0-3.9 3.2L2 15a2.5 2.5 0 0 0 4.4 1.8L8 15h8l1.6 1.8A2.5 2.5 0 0 0 22 15l-.8-6.8A4 4 0 0 0 17.3 5Z",
  film: "M4 4h16v16H4V4Zm0 4h16M4 16h16M8 4v16M16 4v16",
  tv: "M4 7h16v12H4V7Zm4-3 4 3 4-3",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2",
  note: "M6 3h9l4 4v14H6V3Zm9 0v4h4M9 12h7M9 16h7",
  save: "M5 3h11l3 3v15H5V3Zm3 0v6h7V3M8 21v-7h8v7",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.06-.4.1-.8.1-1.2Z",
  back: "M9 6l6 6-6 6",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20l4-1L20 7l-3-3L5 16l-1 4Zm10-14 3 3",
  trash: "M4 7h16M9 7V5h6v2m-9 0 1 13h10l1-13M10 11v6m4-6v6",
  search: "M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm5.5 2 5 5",
  down: "M12 3v12m0 0 4-4m-4 4-4-4M4 21h16",
  up: "M12 21V9m0 0 4 4m-4-4-4 4M4 3h16",
  x: "M6 6l12 12M18 6 6 18",
  check: "M4 12l5 5L20 6",
};

/* ---------------- بارگذاری پرونده از هارد ---------------- */
const MB = 1024 * 1024;

const readImage = (f: File, maxDim = 900, quality = 0.75): Promise<string> =>
  new Promise((res, rej) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        rej(new Error("no canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rej(new Error("تصویر نامعتبر"));
    };
    img.src = url;
  });

const readAudio = (f: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(new Error("خواندن پرونده ناموفق بود"));
    r.readAsDataURL(f);
  });

/* ---------------- تعریف فیلدها و مجموعه‌ها ---------------- */
type FType = "text" | "number" | "select" | "textarea" | "emoji";
interface Field {
  key: string;
  label: string;
  type: FType;
  options?: string[];
  ltr?: boolean;
  wide?: boolean;
}

const STATUS_OPTS = (Object.keys(STATUS) as StatusId[]).map((s) => s);
const STATUS_FA = (s: string) => STATUS[s as StatusId]?.fa ?? s;

interface EditorState {
  record: Record<string, unknown>;
  isNew: boolean;
}

/* ---------------- نمودار دونات ---------------- */
const Donut: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  let acc = 0;
  const R = 42;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(217,178,95,0.12)" strokeWidth="14" />
        {data.map((d) => {
          const frac = d.value / total;
          const dash = frac * C;
          const off = -acc * C;
          acc += frac;
          return (
            <circle
              key={d.label}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={off}
            />
          );
        })}
      </svg>
      <ul className="space-y-1.5">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-[12px]">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-ink/75">{d.label}</span>
            <span className="font-type text-ink/50" dir="ltr">{toFa(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ---------------- مدیر مجموعه‌ی عمومی ---------------- */
interface ColConfig {
  key: string;
  title: string;
  singular: string;
  icon: React.FC<IP>;
  accent: string;
  fields: Field[];
  rows: () => Record<string, unknown>[];
  commit: (next: Record<string, unknown>[], note?: string) => void;
  blank: () => Record<string, unknown>;
  searchKeys: string[];
  filters: { key: string; label: string; options: { v: string; fa: string }[] }[];
  titleKey: string;
  subKeys: string[];
  photoUpload?: boolean; // امکان بارگذاری تصاویر از هارد
  audioUpload?: boolean; // امکان بارگذاری نغمه از هارد
}

function CollectionManager({ cfg }: { cfg: ColConfig }) {
  useAdminVersion();
  const [q, setQ] = useState("");
  const [filt, setFilt] = useState<Record<string, string>>({});
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [armDelete, setArmDelete] = useState<string | null>(null);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");

  const rows = cfg.rows();
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      const okQ =
        !s ||
        cfg.searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(s)) ||
        String(r.id).toLowerCase().includes(s);
      const okF = cfg.filters.every((f) => !filt[f.key] || r[f.key] === filt[f.key]);
      return okQ && okF;
    });
  }, [rows, q, filt, cfg]);

  const openNew = () => {
    setJsonMode(false);
    setEditor({ record: cfg.blank(), isNew: true });
  };
  const openEdit = (r: Record<string, unknown>) => {
    setJsonMode(false);
    setJsonText(JSON.stringify(r, null, 2));
    setEditor({ record: { ...r }, isNew: false });
  };

  const setField = (key: string, val: unknown) =>
    setEditor((e) => (e ? { ...e, record: { ...e.record, [key]: val } } : e));

  const [uploadErr, setUploadErr] = useState("");

  const addPhotos = async (files: FileList | null) => {
    if (!files || !editor) return;
    setUploadErr("");
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    try {
      const urls = await Promise.all(arr.map((f) => readImage(f)));
      setEditor((e) =>
        e
          ? { ...e, record: { ...e.record, photos: [...((e.record.photos as string[]) ?? []), ...urls] } }
          : e
      );
    } catch {
      setUploadErr("در خواندن تصویر خطایی رخ داد؛ پرونده‌ی دیگری امتحان کنید.");
    }
  };

  const removePhoto = (idx: number) =>
    setEditor((e) =>
      e
        ? { ...e, record: { ...e.record, photos: ((e.record.photos as string[]) ?? []).filter((_, i) => i !== idx) } }
        : e
    );

  const setAudio = async (file: File | null) => {
    if (!file || !editor) return;
    setUploadErr("");
    if (file.size > 4 * MB) {
      setUploadErr("حجم نغمه بیش از ۴ مگابایت است؛ برای ماندگاری در مرورگر پرونده‌ی کوچک‌تری انتخاب کنید.");
      return;
    }
    try {
      const url = await readAudio(file);
      setEditor((e) => (e ? { ...e, record: { ...e.record, audio: url } } : e));
    } catch {
      setUploadErr("در خواندن پرونده‌ی صوتی خطایی رخ داد.");
    }
  };

  const save = () => {
    if (!editor) return;
    let rec = editor.record;
    if (jsonMode) {
      try {
        rec = JSON.parse(jsonText);
      } catch {
        alert("JSON معتبر نیست.");
        return;
      }
    }
    if (!rec.id) rec = { ...rec, id: `new-${Date.now()}` };
    const next = editor.isNew ? [...rows, rec] : rows.map((r) => (r.id === rec.id ? rec : r));
    cfg.commit(next as never, editor.isNew ? `«${String(rec[cfg.titleKey])}» افزوده شد` : `«${String(rec[cfg.titleKey])}» ویرایش شد`);
    setEditor(null);
  };

  const del = (id: unknown) => {
    const rec = rows.find((r) => r.id === id);
    cfg.commit(rows.filter((r) => r.id !== id), `«${String(rec?.[cfg.titleKey] ?? id)}» حذف شد`);
    setArmDelete(null);
  };

  const exportCsv = () => {
    const cols = ["id", ...cfg.fields.map((f) => f.key)];
    const lines = [
      cols.join(","),
      ...shown.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")),
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `shahrfarang-${cfg.key}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      {/* نوار ابزار */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-lg border border-line-2 bg-cream/80 px-3 py-2 transition-all focus-within:border-gold">
          <I d={Ic.search} className="h-4 w-4 shrink-0 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`جستجو در ${cfg.title}…`}
            className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3/70"
          />
        </div>
        {cfg.filters.map((f) => (
          <select
            key={f.key}
            value={filt[f.key] ?? ""}
            onChange={(e) => setFilt((p) => ({ ...p, [f.key]: e.target.value }))}
            className="rounded-lg border border-line-2 bg-cream/80 px-3 py-2 text-[12.5px] font-bold text-ink-2 outline-none focus:border-gold"
          >
            <option value="">{f.label}: همه</option>
            {f.options.map((o) => (
              <option key={o.v} value={o.v}>{o.fa}</option>
            ))}
          </select>
        ))}
        <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-lg border border-line-2 bg-cream/80 px-3 py-2 text-[12.5px] font-bold text-ink-2 transition-colors hover:border-gold hover:text-gold-3">
          <I d={Ic.down} className="h-4 w-4" /> خروجی CSV
        </button>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-bold text-cream shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: cfg.accent }}
        >
          <I d={Ic.plus} className="h-4 w-4" /> {cfg.singular} جدید
        </button>
      </div>

      <p className="mt-3 text-[12px] text-ink-3">
        {toFa(shown.length)} از {toFa(rows.length)} {cfg.singular}
      </p>

      {/* جدول */}
      <div className="mt-3 overflow-x-auto rounded-xl border border-line-2 bg-cream/60">
        <table className="w-full min-w-[640px] text-right">
          <thead>
            <tr className="border-b border-line-2 bg-paper-2/70 text-[11px] font-bold text-ink-3">
              <th className="px-4 py-2.5">نماد</th>
              <th className="px-2 py-2.5">نام</th>
              <th className="px-2 py-2.5">مشخصات</th>
              <th className="px-2 py-2.5">شناسه</th>
              <th className="px-4 py-2.5 text-left">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, 120).map((r) => (
              <tr key={String(r.id)} className="border-b border-dashed border-line transition-colors hover:bg-gold/10">
                <td className="px-4 py-2 text-xl">{String(r.emoji ?? r.image ?? "▫️")}</td>
                <td className="px-2 py-2">
                  <span className="block text-[14px] font-bold text-ink">{String(r[cfg.titleKey])}</span>
                </td>
                <td className="px-2 py-2 text-[12px] text-ink-2">
                  {cfg.subKeys.map((k) => String(r[k] ?? "")).filter(Boolean).join(" · ")}
                </td>
                <td className="px-2 py-2">
                  <span className="font-type rounded bg-paper-2 px-1.5 py-0.5 text-[10px] text-ink-3" dir="ltr">{String(r.id)}</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1.5">
                    {armDelete === r.id ? (
                      <>
                        <button onClick={() => del(r.id)} className="flex items-center gap-1 rounded-md bg-sienna px-2.5 py-1.5 text-[11px] font-bold text-cream">
                          <I d={Ic.check} className="h-3.5 w-3.5" /> بله، حذف شود
                        </button>
                        <button onClick={() => setArmDelete(null)} className="rounded-md border border-line-2 px-2.5 py-1.5 text-[11px] font-bold text-ink-3">
                          انصراف
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => openEdit(r)} aria-label="ویرایش" className="grid h-8 w-8 place-items-center rounded-md border border-line-2 text-ink-2 transition-colors hover:border-gold hover:text-gold-3">
                          <I d={Ic.edit} className="h-4 w-4" />
                        </button>
                        <button onClick={() => setArmDelete(String(r.id))} aria-label="حذف" className="grid h-8 w-8 place-items-center rounded-md border border-line-2 text-ink-2 transition-colors hover:border-sienna hover:text-sienna">
                          <I d={Ic.trash} className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[13px] text-ink-3">
                  موردی یافت نشد؛ فیلترها را تغییر دهید.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {shown.length > 120 && (
          <p className="border-t border-line-2 px-4 py-2 text-[11px] text-ink-3">
            برای راحتی، {toFa(120)} ردیف نخست نمایش داده می‌شود؛ از جستجو و فیلتر استفاده کنید.
          </p>
        )}
      </div>

      {/* ویرایشگر */}
      {editor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="fade-in absolute inset-0 bg-espresso/70 backdrop-blur-[2px]" onClick={() => setEditor(null)} aria-hidden />
          <div className="modal-panel aged-card relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-type text-[9px] tracking-[0.3em] text-gold-3" dir="ltr">{editor.isNew ? "NEW RECORD" : "EDIT RECORD"}</p>
                <h3 className="font-display mt-1 text-3xl font-bold text-ink">
                  {editor.isNew ? `${cfg.singular} جدید` : `ویرایش «${String(editor.record[cfg.titleKey])}»`}
                </h3>
              </div>
              <button onClick={() => setEditor(null)} aria-label="بستن" className="grid h-9 w-9 place-items-center rounded-full border border-line-2 bg-cream/90 text-ink-2 transition-all hover:rotate-90 hover:border-sienna hover:text-sienna">
                <I d={Ic.x} className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
              {cfg.fields.map((f) => {
                const val = editor.record[f.key] ?? "";
                const base = "w-full rounded-lg border border-line-2 bg-cream px-3 py-2 text-[13.5px] text-ink outline-none transition-all focus:border-gold focus:shadow-[0_0_0_3px_rgba(185,138,47,0.15)]";
                return (
                  <label key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
                    <span className="mb-1 block text-[11.5px] font-bold text-ink-3">{f.label}</span>
                    {f.type === "select" ? (
                      <select value={String(val)} onChange={(e) => setField(f.key, e.target.value)} className={base}>
                        {f.options?.map((o) => (
                          <option key={o} value={o}>{(STATUS_OPTS as string[]).includes(o) ? STATUS_FA(o) : o}</option>
                        ))}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea value={String(val)} onChange={(e) => setField(f.key, e.target.value)} rows={3} className={`${base} resize-y leading-6`} />
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : "text"}
                        value={f.type === "number" ? Number(val) || "" : String(val)}
                        onChange={(e) => setField(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                        dir={f.ltr ? "ltr" : undefined}
                        className={base}
                      />
                    )}
                  </label>
                );
              })}
            </div>

            {/* بارگذاری تصاویر از هارد */}
            {cfg.photoUpload && (
              <div className="mt-5 rounded-xl border border-line-2 bg-paper-2/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12.5px] font-bold text-ink">تصاویر {cfg.singular} (از هارد)</p>
                    <p className="mt-0.5 text-[11px] leading-5 text-ink-3">
                      چند تصویر انتخاب کنید؛ در پرونده‌ی نمایشی به‌جای عکس ویکی‌پدیا استفاده می‌شوند.
                    </p>
                  </div>
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-bold text-cream transition-all hover:-translate-y-0.5 active:translate-y-0" style={{ background: cfg.accent }}>
                    <I d={Ic.plus} className="h-4 w-4" /> افزودن تصویر
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        void addPhotos(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {((editor.record.photos as string[]) ?? []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {((editor.record.photos as string[]) ?? []).map((p, i) => (
                      <div key={i} className="group relative h-20 w-24 overflow-hidden rounded-lg border border-line-2">
                        <img src={p} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          aria-label="حذف تصویر"
                          className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-espresso/80 text-cream opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <I d={Ic.x} className="h-3.5 w-3.5" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 right-1 rounded bg-gold-3 px-1.5 py-0.5 text-[9px] font-bold text-cream">اصلی</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* بارگذاری نغمه از هارد */}
            {cfg.audioUpload && (
              <div className="mt-4 rounded-xl border border-line-2 bg-paper-2/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12.5px] font-bold text-ink">نغمه‌ی {cfg.singular} (از هارد)</p>
                    <p className="mt-0.5 text-[11px] leading-5 text-ink-3">
                      یک پرونده‌ی صوتی (MP3/WAV/OGG) بارگذاری کنید؛ در پرونده‌ی نمایشی پخش می‌شود.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editor.record.audio ? (
                      <button
                        onClick={() => setEditor((e) => (e ? { ...e, record: { ...e.record, audio: undefined } } : e))}
                        className="flex items-center gap-1.5 rounded-lg border border-sienna px-3.5 py-2 text-[12.5px] font-bold text-sienna transition-colors hover:bg-sienna hover:text-cream"
                      >
                        <I d={Ic.trash} className="h-4 w-4" /> حذف نغمه
                      </button>
                    ) : (
                      <label className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-bold text-cream transition-all hover:-translate-y-0.5 active:translate-y-0" style={{ background: cfg.accent }}>
                        <I d={Ic.up} className="h-4 w-4" /> بارگذاری نغمه
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            void setAudio(e.target.files?.[0] ?? null);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
                {Boolean(editor.record.audio) && (
                  <audio controls src={editor.record.audio as string} className="mt-3 h-10 w-full" />
                )}
              </div>
            )}

            {uploadErr && (
              <p className="mt-3 rounded-lg border border-sienna/50 bg-sienna/10 px-3 py-2 text-[12px] font-bold text-sienna">
                {uploadErr}
              </p>
            )}

            {/* ویرایش پیشرفته‌ی JSON */}
            <div className="mt-5 rounded-xl border border-line-2 bg-paper-2/60">
              <button onClick={() => { setJsonMode((m) => !m); setJsonText(JSON.stringify(editor.record, null, 2)); }} className="flex w-full items-center justify-between px-4 py-2.5 text-[12px] font-bold text-ink-2">
                <span>ویرایش پیشرفته (JSON کامل رکورد)</span>
                <span className="font-type text-[10px] text-ink-3" dir="ltr">{jsonMode ? "−" : "+"}</span>
              </button>
              {jsonMode && (
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={9}
                  dir="ltr"
                  className="font-type m-3 mt-0 w-[calc(100%-24px)] resize-y rounded-lg border border-line-2 bg-cream p-3 text-[11px] leading-5 text-ink outline-none focus:border-gold"
                />
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button onClick={() => setEditor(null)} className="rounded-lg border border-line-2 px-4 py-2 text-[13px] font-bold text-ink-2 transition-colors hover:border-ink">
                انصراف
              </button>
              <button onClick={save} className="flex items-center gap-1.5 rounded-lg px-5 py-2 text-[13px] font-bold text-cream shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0" style={{ background: cfg.accent }}>
                <I d={Ic.check} className="h-4 w-4" /> ذخیره‌ی تغییرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- پیکربندی مجموعه‌ها ---------------- */
const itemFilters = [
  { key: "category", label: "تالار", options: CATEGORIES.map((c) => ({ v: c.id, fa: c.fa })) },
  { key: "status", label: "وضعیت", options: STATUS_OPTS.map((s) => ({ v: s, fa: STATUS_FA(s) })) },
];

const COLS: Record<string, ColConfig> = {
  items: {
    key: "items", title: "اشیای موزه", singular: "شیء", icon: (p) => <I {...p} d={Ic.box} />, accent: "#a8431f",
    fields: [
      { key: "name", label: "نام شیء", type: "text" },
      { key: "nameEn", label: "نام انگلیسی", type: "text", ltr: true },
      { key: "image", label: "نماد (ایموجی)", type: "emoji" },
      { key: "year", label: "سال", type: "number" },
      { key: "era", label: "دوران", type: "text" },
      { key: "category", label: "تالار", type: "select", options: CATEGORIES.map((c) => c.id) },
      { key: "status", label: "وضعیت", type: "select", options: STATUS_OPTS },
      { key: "description", label: "توضیح کوتاه", type: "textarea", wide: true },
      { key: "long", label: "شرح بلند", type: "textarea", wide: true },
    ],
    rows: () => liveItems() as unknown as Record<string, unknown>[],
    commit: (n, note) => commitItems(n as unknown as Item[], note),
    blank: () => ({
      id: "", name: "", nameEn: "", category: "home", year: 1950, era: "", description: "", image: "📦",
      status: "retired", long: "", milestones: [], specs: { maker: "", country: "", fate: "" },
    }),
    searchKeys: ["name", "nameEn", "description"],
    filters: itemFilters,
    titleKey: "name",
    subKeys: ["year", "category", "status"],
    photoUpload: true,
    audioUpload: true,
  },
  games: {
    key: "games", title: "بازی‌ها", singular: "بازی", icon: (p) => <I {...p} d={Ic.game} />, accent: "#2f5d6e",
    fields: [
      { key: "name", label: "نام بازی", type: "text" },
      { key: "nameEn", label: "نام انگلیسی", type: "text", ltr: true },
      { key: "emoji", label: "نماد", type: "emoji" },
      { key: "year", label: "سال انتشار", type: "number" },
      { key: "platform", label: "سکو", type: "select", options: PLATFORMS.map((p) => p.id) },
      { key: "genre", label: "ژانر", type: "select", options: GENRES },
      { key: "desc", label: "توضیح", type: "textarea", wide: true },
      { key: "note", label: "دانستنی", type: "textarea", wide: true },
    ],
    rows: () => liveGames() as unknown as Record<string, unknown>[],
    commit: (n, note) => commitGames(n as unknown as Game[], note),
    blank: () => ({ id: "", name: "", nameEn: "", platform: "megadrive", year: 1990, genre: GENRES[0], emoji: "🎮", desc: "", note: "" }),
    searchKeys: ["name", "nameEn", "desc"],
    filters: [
      { key: "platform", label: "سکو", options: PLATFORMS.map((p) => ({ v: p.id, fa: p.fa })) },
      { key: "genre", label: "ژانر", options: GENRES.map((g) => ({ v: g, fa: g })) },
    ],
    titleKey: "name",
    subKeys: ["year", "platform", "genre"],
    photoUpload: true,
    audioUpload: true,
  },
  movies: {
    key: "movies", title: "فیلم‌ها", singular: "فیلم", icon: (p) => <I {...p} d={Ic.film} />, accent: "#7c5aa2",
    fields: [
      { key: "name", label: "نام فیلم", type: "text" },
      { key: "nameEn", label: "نام انگلیسی", type: "text", ltr: true },
      { key: "emoji", label: "نماد", type: "emoji" },
      { key: "year", label: "سال", type: "number" },
      { key: "genre", label: "ژانر", type: "select", options: CINEMA_HALL.genres },
      { key: "director", label: "کارگردان", type: "text" },
      { key: "country", label: "کشور", type: "text" },
      { key: "desc", label: "توضیح", type: "textarea", wide: true },
      { key: "note", label: "دانستنی", type: "textarea", wide: true },
    ],
    rows: () => liveMovies() as unknown as Record<string, unknown>[],
    commit: (n, note) => commitMovies(n as unknown as MediaEntry[], note),
    blank: () => ({ id: "", name: "", nameEn: "", year: 1970, genre: CINEMA_HALL.genres[0], emoji: "🎬", director: "", country: "", desc: "", note: "" }),
    searchKeys: ["name", "nameEn", "director", "desc"],
    filters: [{ key: "genre", label: "ژانر", options: CINEMA_HALL.genres.map((g) => ({ v: g, fa: g })) }],
    titleKey: "name",
    subKeys: ["year", "genre", "director"],
    photoUpload: true,
    audioUpload: true,
  },
  series: {
    key: "series", title: "سریال‌ها", singular: "سریال", icon: (p) => <I {...p} d={Ic.tv} />, accent: "#3f7d50",
    fields: [
      { key: "name", label: "نام سریال", type: "text" },
      { key: "nameEn", label: "نام انگلیسی", type: "text", ltr: true },
      { key: "emoji", label: "نماد", type: "emoji" },
      { key: "year", label: "سال", type: "number" },
      { key: "genre", label: "ژانر", type: "select", options: SERIES_HALL.genres },
      { key: "director", label: "سازنده / کارگردان", type: "text" },
      { key: "country", label: "کشور / شبکه", type: "text" },
      { key: "desc", label: "توضیح", type: "textarea", wide: true },
      { key: "note", label: "دانستنی", type: "textarea", wide: true },
    ],
    rows: () => liveSeries() as unknown as Record<string, unknown>[],
    commit: (n, note) => commitSeries(n as unknown as MediaEntry[], note),
    blank: () => ({ id: "", name: "", nameEn: "", year: 1990, genre: SERIES_HALL.genres[0], emoji: "📺", director: "", country: "", desc: "", note: "" }),
    searchKeys: ["name", "nameEn", "director", "desc"],
    filters: [{ key: "genre", label: "ژانر", options: SERIES_HALL.genres.map((g) => ({ v: g, fa: g })) }],
    titleKey: "name",
    subKeys: ["year", "genre", "director"],
    photoUpload: true,
    audioUpload: true,
  },
  memories: {
    key: "memories", title: "خاطره‌های دهه‌ها", singular: "خاطره", icon: (p) => <I {...p} d={Ic.clock} />, accent: "#b98a2f",
    fields: [
      { key: "title", label: "عنوان خاطره", type: "text" },
      { key: "year", label: "سال (شمسی)", type: "text" },
      { key: "emoji", label: "نماد", type: "emoji" },
      { key: "decade", label: "دهه", type: "select", options: DECADES.map((d) => d.id) },
      { key: "group", label: "قفسه", type: "select", options: Object.keys(GROUP_LABEL) },
      { key: "text", label: "شرح کوتاه", type: "textarea", wide: true },
      { key: "long", label: "شرح بلند", type: "textarea", wide: true },
    ],
    rows: () => liveMemories() as unknown as Record<string, unknown>[],
    commit: (n, note) => commitMemories(n as unknown as Memory[], note),
    blank: () => ({ id: "", title: "", year: "۱۳۷۰", group: "tv", emoji: "📺", text: "", long: "", decade: "70" }),
    searchKeys: ["title", "text"],
    filters: [
      { key: "decade", label: "دهه", options: DECADES.map((d) => ({ v: d.id, fa: d.fa })) },
      { key: "group", label: "قفسه", options: Object.entries(GROUP_LABEL).map(([v, fa]) => ({ v, fa })) },
    ],
    titleKey: "title",
    subKeys: ["year", "decade", "group"],
    photoUpload: true,
    audioUpload: true,
  },
};

/* ---------------- بخش‌ها ---------------- */
type Section = "overview" | "items" | "games" | "movies" | "series" | "memories" | "halls" | "guest" | "backup" | "settings";

const STAT_COLORS: Record<StatusId, string> = {
  legendary: "#e0764a", museum: "#d9a94b", retired: "#9aa86a", rare: "#6f9c8a",
};

const Overview: React.FC = () => {
  useAdminVersion();
  const items = liveItems();
  const counts = hallCounts();
  const total = items.length + liveGames().length + liveMovies().length + liveSeries().length + liveMemories().length;
  const statusData = (Object.keys(STATUS) as StatusId[]).map((s) => ({
    label: STATUS[s].fa,
    value: items.filter((i) => i.status === s).length,
    color: STAT_COLORS[s],
  }));
  const log = getLog();

  const eraBuckets = useMemo(() => {
    const b = [
      { label: "پیش از ۱۹۰۰", min: 0, max: 1900 },
      { label: "۱۹۰۰–۱۹۵۰", min: 1900, max: 1950 },
      { label: "۱۹۵۰–۱۹۸۰", min: 1950, max: 1980 },
      { label: "۱۹۸۰–۲۰۰۰", min: 1980, max: 2000 },
      { label: "۲۰۰۰ به بعد", min: 2000, max: 9999 },
    ];
    return b.map((x) => ({ ...x, n: items.filter((i) => i.year >= x.min && i.year < x.max).length }));
  }, [items]);
  const maxEra = Math.max(...eraBuckets.map((b) => b.n), 1);

  const stats = [
    { label: "اشیای موزه", n: items.length, icon: Ic.box, c: "#a8431f" },
    { label: "بازی‌ها", n: liveGames().length, icon: Ic.game, c: "#2f5d6e" },
    { label: "فیلم‌ها", n: liveMovies().length, icon: Ic.film, c: "#7c5aa2" },
    { label: "سریال‌ها", n: liveSeries().length, icon: Ic.tv, c: "#3f7d50" },
    { label: "خاطره‌ها", n: liveMemories().length, icon: Ic.clock, c: "#b98a2f" },
    { label: "مجموع رکوردها", n: total, icon: Ic.overview, c: "#5c4a30" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="aged-card rounded-xl p-4">
            <span className="grid h-9 w-9 place-items-center rounded-lg text-cream" style={{ background: s.c }}>
              <I d={s.icon} className="h-5 w-5" />
            </span>
            <p className="font-display mt-3 text-4xl font-bold leading-none text-ink">{toFa(s.n)}</p>
            <p className="mt-1.5 text-[12px] font-bold text-ink-3">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="aged-card rounded-xl p-5">
          <h3 className="font-display text-2xl font-bold text-ink">پراکندگی تالارها</h3>
          <div className="mt-4 space-y-2.5">
            {counts.map((c) => {
              const max = Math.max(...counts.map((x) => x.count), 1);
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-[11.5px] font-bold text-ink-2">
                    <span>{c.fa}</span>
                    <span className="font-type text-ink-3" dir="ltr">{toFa(c.count)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-paper-3/60">
                    <div className="h-full rounded-full bg-gradient-to-l from-gold to-sienna transition-all" style={{ width: `${(c.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="aged-card rounded-xl p-5">
          <h3 className="font-display text-2xl font-bold text-ink">وضعیت اشیاء</h3>
          <div className="mt-4">
            <Donut data={statusData} />
          </div>
          <h3 className="font-display mt-6 text-2xl font-bold text-ink">توزیع زمانی اشیاء</h3>
          <div className="mt-3 flex h-28 items-end gap-2">
            {eraBuckets.map((b) => (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="font-type text-[11px] font-bold text-ink-2" dir="ltr">{toFa(b.n)}</span>
                <div className="w-full rounded-t-md bg-gradient-to-t from-espresso/80 to-gold transition-all" style={{ height: `${(b.n / maxEra) * 72}px` }} />
                <span className="text-[9.5px] text-ink-3">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="aged-card rounded-xl p-5">
        <h3 className="font-display text-2xl font-bold text-ink">گزارش فعالیت‌های اخیر</h3>
        {log.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-3">هنوز فعالیتی ثبت نشده است.</p>
        ) : (
          <ul className="mt-3 divide-y divide-dashed divide-line">
            {log.slice(0, 10).map((l, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5">
                <span className="text-lg">{l.icon}</span>
                <span className="flex-1 text-[13px] text-ink-2">{l.text}</span>
                <span className="font-type text-[10px] text-ink-3" dir="ltr">
                  {new Date(l.t).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const HallsView: React.FC = () => {
  useAdminVersion();
  const counts = hallCounts();
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CATEGORIES.map((c) => {
        const n = counts.find((x) => x.id === c.id)?.count ?? 0;
        return (
          <div key={c.id} className="aged-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="font-type text-[10px] tracking-[0.25em] text-gold-3" dir="ltr">{c.code}</span>
              <span className="rounded-full border border-line-2 bg-cream/70 px-2.5 py-0.5 text-[11px] font-bold text-ink-2">{toFa(n)} رکورد</span>
            </div>
            <h3 className="font-display mt-3 text-2xl font-bold text-ink">{c.fa}</h3>
            <p className="font-type text-[9px] tracking-[0.2em] text-ink-3" dir="ltr">{c.en}</p>
            <p className="mt-2 text-[12.5px] leading-6 text-ink-2">{c.blurb}</p>
          </div>
        );
      })}
    </div>
  );
};

const GuestView: React.FC = () => {
  useAdminVersion();
  const notes = getGuestNotes();
  const [arm, setArm] = useState<number | null>(null);
  return (
    <div>
      <p className="text-[13px] text-ink-3">{toFa(notes.length)} یادداشت از بازدیدکنندگان</p>
      {notes.length === 0 ? (
        <div className="aged-card mt-4 rounded-xl p-10 text-center text-[13px] text-ink-3">هنوز یادداشتی ثبت نشده است.</div>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((n) => (
            <li key={n.at} className="aged-card flex items-start gap-4 rounded-xl p-4">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-7 text-ink-2">«{n.text}»</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-sienna">{n.name}</span>
                  <span className="font-type text-[10px] text-ink-3">{new Date(n.at).toLocaleDateString("fa-IR")}</span>
                </div>
              </div>
              {arm === n.at ? (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button onClick={() => { deleteGuestNote(n.at); setArm(null); }} className="rounded-md bg-sienna px-2.5 py-1.5 text-[11px] font-bold text-cream">حذف شود</button>
                  <button onClick={() => setArm(null)} className="rounded-md border border-line-2 px-2.5 py-1.5 text-[11px] font-bold text-ink-3">انصراف</button>
                </div>
              ) : (
                <button onClick={() => setArm(n.at)} className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line-2 text-ink-2 transition-colors hover:border-sienna hover:text-sienna" aria-label="حذف یادداشت">
                  <I d={Ic.trash} className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const BackupView: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [armReset, setArmReset] = useState(false);
  const doExport = () => {
    const blob = new Blob([exportAll()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `shahrfarang-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg({ ok: true, text: "فایل پشتیبان دانلود شد." });
  };
  const doImport = (f: File) => {
    const r = new FileReader();
    r.onload = () => setMsg((p) => { const res = importAll(String(r.result)); return { ok: res.ok, text: res.message }; });
    r.readAsText(f);
  };
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="aged-card rounded-xl p-6">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-moss text-cream"><I d={Ic.down} className="h-6 w-6" /></span>
        <h3 className="font-display mt-4 text-2xl font-bold text-ink">دریافت پشتیبان</h3>
        <p className="mt-2 text-[13px] leading-6 text-ink-2">
          همه‌ی اشیاء، بازی‌ها، فیلم‌ها، سریال‌ها، خاطره‌ها و تنظیمات در یک فایل JSON ذخیره می‌شود.
        </p>
        <button onClick={doExport} className="mt-4 flex items-center gap-2 rounded-lg bg-moss px-5 py-2.5 text-[13px] font-bold text-cream transition-all hover:-translate-y-0.5 active:translate-y-0">
          <I d={Ic.down} className="h-4 w-4" /> دانلود پشتیبان کامل
        </button>
      </div>
      <div className="aged-card rounded-xl p-6">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-gold-3 text-cream"><I d={Ic.up} className="h-6 w-6" /></span>
        <h3 className="font-display mt-4 text-2xl font-bold text-ink">بازیابی پشتیبان</h3>
        <p className="mt-2 text-[13px] leading-6 text-ink-2">فایل پشتیبان را بارگذاری کنید تا همه‌ی داده‌ها جایگزین شوند.</p>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
        <button onClick={() => fileRef.current?.click()} className="mt-4 flex items-center gap-2 rounded-lg bg-gold-3 px-5 py-2.5 text-[13px] font-bold text-cream transition-all hover:-translate-y-0.5 active:translate-y-0">
          <I d={Ic.up} className="h-4 w-4" /> بارگذاری فایل پشتیبان
        </button>
      </div>
      {msg && (
        <div className={`rounded-xl border p-4 text-[13px] font-bold lg:col-span-2 ${msg.ok ? "border-moss/50 bg-moss/10 text-moss" : "border-sienna/50 bg-sienna/10 text-sienna"}`}>
          {msg.text}
        </div>
      )}
      <div className="rounded-xl border border-sienna/40 bg-sienna/5 p-6 lg:col-span-2">
        <h3 className="font-display text-2xl font-bold text-sienna">منطقه‌ی خطر</h3>
        <p className="mt-2 text-[13px] leading-6 text-ink-2">
          با بازنشانی، همه‌ی تغییرات مدیریتی پاک شده و داده‌ها به حالت اولیه‌ی موزه برمی‌گردند. این عمل قابل بازگشت نیست.
        </p>
        {armReset ? (
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => { resetAll(); window.location.reload(); }}
              className="flex items-center gap-2 rounded-lg bg-sienna px-5 py-2.5 text-[13px] font-bold text-cream transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <I d={Ic.check} className="h-4 w-4" /> بله، همه‌چیز پاک شود
            </button>
            <button onClick={() => setArmReset(false)} className="rounded-lg border border-line-2 px-5 py-2.5 text-[13px] font-bold text-ink-2 transition-colors hover:border-ink">
              انصراف
            </button>
          </div>
        ) : (
          <button
            onClick={() => setArmReset(true)}
            className="mt-4 rounded-lg border-2 border-sienna px-5 py-2.5 text-[13px] font-bold text-sienna transition-all hover:bg-sienna hover:text-cream"
          >
            بازنشانی کامل داده‌ها
          </button>
        )}
      </div>
    </div>
  );
};

const SettingsView: React.FC = () => {
  useAdminVersion();
  const [s, setS] = useState(getSettings());
  const [saved, setSaved] = useState(false);
  const update = (patch: Partial<typeof s>) => setS((p) => ({ ...p, ...patch }));
  const save = () => { saveSettings(s); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const Toggle = ({ on, onClick, label, desc }: { on: boolean; onClick: () => void; label: string; desc: string }) => (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-4 rounded-xl border border-line-2 bg-cream/70 p-4 text-right transition-colors hover:border-gold">
      <span>
        <span className="block text-[14px] font-bold text-ink">{label}</span>
        <span className="mt-0.5 block text-[12px] text-ink-3">{desc}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-moss" : "bg-paper-3"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow transition-all ${on ? "right-0.5" : "right-[22px]"}`} />
      </span>
    </button>
  );
  return (
    <div className="max-w-2xl space-y-4">
      <div className="aged-card rounded-xl p-5">
        <h3 className="font-display text-2xl font-bold text-ink">هویت سایت</h3>
        <label className="mt-4 block">
          <span className="mb-1 block text-[11.5px] font-bold text-ink-3">نام نمایشی موزه</span>
          <input value={s.siteTitle} onChange={(e) => update({ siteTitle: e.target.value })} className="w-full rounded-lg border border-line-2 bg-cream px-3 py-2 text-[14px] text-ink outline-none focus:border-gold" />
        </label>
      </div>
      <Toggle on={s.showIntro} onClick={() => update({ showIntro: !s.showIntro })} label="نمایش درهای ورودی" desc="انیمیشن باز شدن درهای موزه برای بازدیدکنندگان جدید" />
      <Toggle on={s.maintenance} onClick={() => update({ maintenance: !s.maintenance })} label="حالت تعمیرات" desc="نمایش پیام نگهداری به بازدیدکنندگان (به‌زودی)" />
      <div className="flex items-center gap-3">
        <button onClick={save} className="flex items-center gap-2 rounded-lg bg-sienna px-6 py-2.5 text-[13px] font-bold text-cream transition-all hover:-translate-y-0.5 active:translate-y-0">
          <I d={Ic.save} className="h-4 w-4" /> ذخیره‌ی تنظیمات
        </button>
        {saved && <span className="rise-in flex items-center gap-1.5 text-[13px] font-bold text-moss"><I d={Ic.check} className="h-4 w-4" /> ذخیره شد</span>}
      </div>
    </div>
  );
};

/* ---------------- پوسته‌ی اصلی داشبورد ---------------- */
export const AdminDashboard: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [sec, setSec] = useState<Section>("overview");

  const NAV: { id: Section; label: string; icon: React.FC<IP>; badge?: number }[] = [
    { id: "overview", label: "نمای کلی", icon: (p) => <I {...p} d={Ic.overview} /> },
    { id: "items", label: "اشیای موزه", icon: (p) => <I {...p} d={Ic.box} />, badge: liveItems().length },
    { id: "games", label: "بازی‌ها", icon: (p) => <I {...p} d={Ic.game} />, badge: liveGames().length },
    { id: "movies", label: "فیلم‌ها", icon: (p) => <I {...p} d={Ic.film} />, badge: liveMovies().length },
    { id: "series", label: "سریال‌ها", icon: (p) => <I {...p} d={Ic.tv} />, badge: liveSeries().length },
    { id: "memories", label: "خاطره‌ها", icon: (p) => <I {...p} d={Ic.clock} />, badge: liveMemories().length },
    { id: "halls", label: "تالارها", icon: (p) => <I {...p} d={Ic.overview} /> },
    { id: "guest", label: "یادداشت مهمان‌ها", icon: (p) => <I {...p} d={Ic.note} /> },
    { id: "backup", label: "پشتیبان‌گیری", icon: (p) => <I {...p} d={Ic.save} /> },
    { id: "settings", label: "تنظیمات", icon: (p) => <I {...p} d={Ic.gear} /> },
  ];

  const titles: Record<Section, string> = {
    overview: "نمای کلی موزه", items: "مدیریت اشیای موزه", games: "مدیریت بازی‌ها", movies: "مدیریت فیلم‌ها",
    series: "مدیریت سریال‌ها", memories: "مدیریت خاطره‌های دهه‌ها", halls: "تالارهای موزه", guest: "یادداشت‌های مهمان",
    backup: "پشتیبان‌گیری و بازیابی", settings: "تنظیمات سایت",
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#221910] text-paper">
      {/* نوار بالا */}
      <header className="sticky top-0 z-40 border-b border-gold/25 bg-[#241a10]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3.5 sm:px-6">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-gold-2 to-sienna text-espresso">
            <I d={Ic.gear} className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-type text-[9px] tracking-[0.3em] text-gold-2/70" dir="ltr">ADMIN CONSOLE</p>
            <h1 className="font-display truncate text-2xl font-bold leading-7 text-paper">پیشخوان مدیریت شهرفرنگ</h1>
          </div>
          <button onClick={onExit} className="flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-[13px] font-bold text-gold-2 transition-all hover:bg-gold/15">
            <I d={Ic.back} className="h-4 w-4 rotate-180" /> بازگشت به موزه
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
        {/* منوی کناری */}
        <nav className="hidden w-56 shrink-0 md:block">
          <ul className="sticky top-24 space-y-1">
            {NAV.map((n) => {
              const active = sec === n.id;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => setSec(n.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-bold transition-all ${
                      active ? "bg-gold/20 text-gold-2 shadow-[inset_3px_0_0_#d9b25f]" : "text-paper/65 hover:bg-paper/5 hover:text-paper"
                    }`}
                  >
                    <n.icon className="h-4.5 w-4.5 h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 text-right">{n.label}</span>
                    {typeof n.badge === "number" && (
                      <span className="font-type rounded-full bg-paper/10 px-2 py-0.5 text-[10px] text-paper/60" dir="ltr">{toFa(n.badge)}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* محتوا */}
        <main className="min-w-0 flex-1 rounded-2xl border border-gold/20 bg-[#f4ead2] p-4 text-ink sm:p-6">
          {/* منوی افقی موبایل */}
          <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto md:hidden">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setSec(n.id)} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-all ${sec === n.id ? "border-sienna bg-sienna text-cream" : "border-line-2 bg-cream/70 text-ink-2"}`}>
                {n.label}
              </button>
            ))}
          </div>

          <div className="mb-5 flex items-end justify-between gap-3 border-b border-dashed border-line-2 pb-4">
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{titles[sec]}</h2>
            <span className="font-type hidden text-[10px] tracking-[0.25em] text-ink-3 sm:block" dir="ltr">
              {new Date().toLocaleDateString("fa-IR")}
            </span>
          </div>

          {sec === "overview" && <Overview />}
          {sec === "items" && <CollectionManager cfg={COLS.items} />}
          {sec === "games" && <CollectionManager cfg={COLS.games} />}
          {sec === "movies" && <CollectionManager cfg={COLS.movies} />}
          {sec === "series" && <CollectionManager cfg={COLS.series} />}
          {sec === "memories" && <CollectionManager cfg={COLS.memories} />}
          {sec === "halls" && <HallsView />}
          {sec === "guest" && <GuestView />}
          {sec === "backup" && <BackupView />}
          {sec === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
};
