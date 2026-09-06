/* ============================================================
   شهرفرنگ — ذخیره‌ساز مدیریتی (Admin Store)
   منبعِ زنده‌ی داده‌ها برای پیشخوان مدیریت؛ تغییرات را ماندگار
   می‌کند و در آرایه‌های مشترک اعمال می‌کند تا در سایت هم دیده شوند.
   ============================================================ */

import { useEffect, useState } from "react";
import { CATEGORIES, ITEMS, type Item } from "./data";
import { GAMES, type Game } from "./games";
import { CINEMA_HALL, SERIES_HALL, type MediaEntry } from "./cinema";
import { NOSTALGIA, type NostalgiaItem, type DecadeId } from "./nostalgia";

export type Memory = NostalgiaItem & { decade: DecadeId };

/* ---------- کلیدهای ماندگاری ---------- */
const K = {
  items: "sf-adm-items",
  games: "sf-adm-games",
  movies: "sf-adm-movies",
  series: "sf-adm-series",
  memories: "sf-adm-memories",
  log: "sf-adm-log",
  settings: "sf-adm-settings",
};

export interface ActivityEntry {
  t: number;
  icon: string;
  text: string;
}

export interface AdminSettings {
  siteTitle: string;
  showIntro: boolean;
  maintenance: boolean;
}

const DEFAULT_SETTINGS: AdminSettings = {
  siteTitle: "شهرفرنگ",
  showIntro: true,
  maintenance: false,
};

/* ---------- خواندن/نوشتن امن ---------- */
const read = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const write = (key: string, val: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* حافظه پر */
  }
};

/* ---------- جایگزینی درجا (حفظ مرجع آرایه‌های مشترک) ---------- */
function replaceInPlace<T>(target: T[], next: T[]) {
  target.length = 0;
  target.push(...next);
}

/* ---------- بارگذاری اولیه‌ی داده‌های ماندگار ---------- */
function hydrate() {
  const it = read<Item[]>(K.items);
  if (it) replaceInPlace(ITEMS, it);
  const gm = read<Game[]>(K.games);
  if (gm) replaceInPlace(GAMES, gm);
  const mv = read<MediaEntry[]>(K.movies);
  if (mv) replaceInPlace(CINEMA_HALL.entries, mv);
  const sr = read<MediaEntry[]>(K.series);
  if (sr) replaceInPlace(SERIES_HALL.entries, sr);
  const mm = read<Memory[]>(K.memories);
  if (mm) replaceInPlace(NOSTALGIA, mm);
}
hydrate();

/* ---------- اشتراک و اطلاع‌رسانی ---------- */
const listeners = new Set<() => void>();
export const subscribeAdmin = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const emit = () => listeners.forEach((fn) => fn());

export function useAdminVersion(): number {
  const [v, setV] = useState(0);
  useEffect(() => subscribeAdmin(() => setV((x) => x + 1)), []);
  return v;
}

/* ---------- گزارش فعالیت ---------- */
export function getLog(): ActivityEntry[] {
  return read<ActivityEntry[]>(K.log) ?? [];
}
function log(icon: string, text: string) {
  const list = [{ t: Date.now(), icon, text }, ...getLog()].slice(0, 40);
  write(K.log, list);
}

/* ---------- دریافت‌کننده‌های زنده ---------- */
export const liveItems = () => ITEMS;
export const liveGames = () => GAMES;
export const liveMovies = () => CINEMA_HALL.entries;
export const liveSeries = () => SERIES_HALL.entries;
export const liveMemories = () => NOSTALGIA as Memory[];

/* ---------- ذخیره‌ی مجموعه‌ها ---------- */
export function commitItems(next: Item[], note = "") {
  replaceInPlace(ITEMS, next);
  write(K.items, next);
  log("🗂️", note || "مجموعه‌ی اشیاء به‌روزرسانی شد");
  emit();
}
export function commitGames(next: Game[], note = "") {
  replaceInPlace(GAMES, next);
  write(K.games, next);
  log("🎮", note || "مجموعه‌ی بازی‌ها به‌روزرسانی شد");
  emit();
}
export function commitMovies(next: MediaEntry[], note = "") {
  replaceInPlace(CINEMA_HALL.entries, next);
  write(K.movies, next);
  log("🎬", note || "مجموعه‌ی فیلم‌ها به‌روزرسانی شد");
  emit();
}
export function commitSeries(next: MediaEntry[], note = "") {
  replaceInPlace(SERIES_HALL.entries, next);
  write(K.series, next);
  log("📺", note || "مجموعه‌ی سریال‌ها به‌روزرسانی شد");
  emit();
}
export function commitMemories(next: Memory[], note = "") {
  replaceInPlace(NOSTALGIA, next);
  write(K.memories, next);
  log("🕰️", note || "مجموعه‌ی خاطره‌ها به‌روزرسانی شد");
  emit();
}

/* ---------- یادداشت‌های مهمان ---------- */
export interface GuestNote {
  name: string;
  text: string;
  at: number;
}
export function getGuestNotes(): GuestNote[] {
  return read<GuestNote[]>("sf-guestbook") ?? [];
}
export function deleteGuestNote(at: number) {
  const next = getGuestNotes().filter((n) => n.at !== at);
  write("sf-guestbook", next);
  log("🗒️", "یک یادداشت مهمان حذف شد");
  emit();
}

/* ---------- تنظیمات ---------- */
export function getSettings(): AdminSettings {
  return { ...DEFAULT_SETTINGS, ...(read<Partial<AdminSettings>>(K.settings) ?? {}) };
}
export function saveSettings(next: AdminSettings) {
  write(K.settings, next);
  log("⚙️", "تنظیمات سایت ذخیره شد");
  emit();
}

/* ---------- پشتیبان‌گیری ---------- */
export function exportAll(): string {
  return JSON.stringify(
    {
      app: "shahr-e-farang",
      version: 2,
      exportedAt: new Date().toISOString(),
      items: liveItems(),
      games: liveGames(),
      movies: liveMovies(),
      series: liveSeries(),
      memories: liveMemories(),
      settings: getSettings(),
    },
    null,
    2
  );
}

export function importAll(json: string): { ok: boolean; message: string } {
  try {
    const d = JSON.parse(json);
    if (!d || typeof d !== "object") return { ok: false, message: "فایل معتبر نیست." };
    if (Array.isArray(d.items)) commitItems(d.items as Item[]);
    if (Array.isArray(d.games)) commitGames(d.games as Game[]);
    if (Array.isArray(d.movies)) commitMovies(d.movies as MediaEntry[]);
    if (Array.isArray(d.series)) commitSeries(d.series as MediaEntry[]);
    if (Array.isArray(d.memories)) commitMemories(d.memories as Memory[]);
    if (d.settings) saveSettings(d.settings as AdminSettings);
    log("📥", "پشتیبان وارد شد");
    return { ok: true, message: "پشتیبان با موفقیت وارد شد." };
  } catch {
    return { ok: false, message: "خطا در خواندن فایل پشتیبان." };
  }
}

export function resetAll() {
  Object.values(K).forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem("sf-guestbook");
  log("♻️", "همه‌ی داده‌های مدیریتی بازنشانی شد");
  emit();
}

/* ---------- آمار کلی ---------- */
export function hallCounts(): { id: string; fa: string; count: number }[] {
  return CATEGORIES.map((c) => ({
    id: c.id,
    fa: c.fa,
    count:
      c.id === "games"
        ? liveGames().length
        : c.id === "cinema"
        ? liveMovies().length
        : c.id === "series"
        ? liveSeries().length
        : liveItems().filter((i) => i.category === c.id).length,
  }));
}
