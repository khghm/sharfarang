/* ============================================================
   شهرفرنگ — نغمه‌های اختصاصی بازی‌ها و دهه‌ها
   هر بازی، ملودی مخصوص خودش را دارد:
   - بازی‌های مشهور: موتیف شناخته‌شده‌ی خودشان
   - بقیه: ملودی یکتای ساخته‌شده از ژانر، سکو و سال (با هسته‌ی تصادفی از شناسه‌ی بازی)
   ============================================================ */

export type Note = [number, number]; // [midi, طول بر حسب واحدِ یک‌هشتم]

export interface Motif {
  tempo: number;
  wave: OscillatorType;
  notes: Note[];
  hats?: boolean;
  root: number;
}

interface MotifDef {
  tempo: number;
  wave: OscillatorType;
  seq: string;
  hats?: boolean;
}

const OFF: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

export const parseMotif = (s: string): Note[] =>
  s
    .trim()
    .split(/\s+/)
    .map((tok) => {
      if (tok === "R") return [-1, 1] as Note;
      const m = tok.match(/^([A-G](?:#|b)?)(\d)(?::(\d+))?$/);
      if (!m) return [-1, 1] as Note;
      const midi = (Number(m[2]) + 1) * 12 + (OFF[m[1]] ?? 0);
      return [midi, m[3] ? Number(m[3]) : 1] as Note;
    });

const build = (d: MotifDef): Motif => {
  const notes = parseMotif(d.seq);
  const used = notes.filter((n) => n[0] >= 0).map((n) => n[0]);
  const root = used.length ? Math.min(...used) - 12 : 48;
  return { tempo: d.tempo, wave: d.wave, notes, hats: d.hats ?? d.tempo >= 150, root };
};

/* ── موتیف بازی‌های مشهور (هر بازی، نغمه‌ی خودش) ── */

const GAME_MOTIFS: Record<string, MotifDef> = {
  /* نینتندو و دوستان */
  "super-mario-bros": { tempo: 200, wave: "square", seq: "E5 R E5 R E5 R C5 E5 R G5:2 R R G4:2" },
  "super-mario-2": { tempo: 188, wave: "square", seq: "C5 E5 G5 E5 C5:2 G4:2 A4 C5 E5 C5 A4:2 E4:2" },
  "super-mario-3": { tempo: 192, wave: "square", seq: "G4:1 C5 E5 G5 C6:2 G5:1 E5:1 C5:2 G4:2" },
  "super-mario-world": { tempo: 176, wave: "square", seq: "C5:1 D5 E5 G5 A5 G5 E5 D5 C5:2 E5 G5 C6:3" },
  "super-mario-64": { tempo: 168, wave: "square", seq: "C5 E5 G5 C6 E6:2 C6:1 G5:1 E5:2 C5:2" },
  zelda: { tempo: 92, wave: "triangle", seq: "G5:1 D6:1 F6:2 E6:2 C6:1 E6:1 G6:2 F6:2 D6:1 F6:1 A6:2 G6:2" },
  "zelda-oot": { tempo: 92, wave: "triangle", seq: "G5:1 D6:1 F6:2 E6:2 C6:1 E6:1 G6:2 F6:2 D6:1 F6:1 A6:2 G6:2" },
  "zelda-la": { tempo: 116, wave: "square", seq: "D5:1 F5 A5 D6:2 A5:1 F5:1 D5:2 A4:2" },
  metroid: { tempo: 84, wave: "triangle", seq: "C4:2 Eb4:2 F4:1 G4:1 Bb4:3 G4:1 F4:1 Eb4:2 C4:4" },
  megaman: { tempo: 176, wave: "square", seq: "C5:1 E5 G5 C6:1 G5 E5 F5 A5 C6:1 A5 F5 G5 B5 D6:2" },
  megaman2: { tempo: 176, wave: "square", seq: "C5:1 E5 G5 C6:1 G5 E5 F5 A5 C6:1 A5 F5 G5 B5 D6:2" },
  "mega-man-wily": { tempo: 172, wave: "square", seq: "A4:1 C5 E5 A5:1 E5 C5 D5 F5 A5:1 F5 D5 E5 G5 B5:2" },
  castlevania: { tempo: 132, wave: "square", seq: "E5:1 G5 A5 B5 C6:1 B5 A5 G5 E5:1 D5 E5:3 R E5 G5:2" },
  "castlevania-bloodlines": { tempo: 138, wave: "sawtooth", seq: "E5:1 G5 A5 B5 C6:1 B5 A5 G5 E5:2 D5:1 E5:3" },
  contra: { tempo: 168, wave: "square", seq: "A4:1 C5 E5 A5:1 G5 E5 C5 A4:1 G4 A4:2 R A4 C5 E5:2" },
  "contra-hard-corps": { tempo: 170, wave: "sawtooth", seq: "A4:1 C5 E5 A5:1 G5 E5 D5 C5 A4:2 G4:1 A4:3" },
  tetris: { tempo: 148, wave: "square", seq: "E5:2 B4:1 C5:1 D5:2 C5:1 B4:1 A4:2 A4:1 C5:1 E5:2 D5:1 C5:1 B4:3 C5:1 D5:1 E5:2 C5:2 A4:2 A4:4" },
  "tetris-gb": { tempo: 140, wave: "square", seq: "E5:2 B4:1 C5:1 D5:2 C5:1 B4:1 A4:2 A4:1 C5:1 E5:2 D5:1 C5:1 B4:3 C5:1 D5:1 E5:2 C5:2 A4:2 A4:4" },
  "pokemon-red": { tempo: 120, wave: "square", seq: "C5:1 E5 G5 E5 A5:1 G5 E5 C5 D5:1 F5 A5 F5 G5:2 E5:2" },
  kirby: { tempo: 132, wave: "square", seq: "G5:1 A5 B5 D6:1 B5 A5 G5:1 E5 G5:2 R A5:1 B5 C6:2" },
  "donkey-kong": { tempo: 150, wave: "square", seq: "G4:1 A4 G4:1 R E5:2 R G4:1 A4 G4:1 R D5:2" },
  "donkey-kong-country": { tempo: 128, wave: "triangle", seq: "D4:2 F4 G4 A4:2 C5 A4 G4 F4 D4:3" },
  "mario-kart-64": { tempo: 160, wave: "square", seq: "C5:1 C5 C5:2 F5:2 E5:1 D5 C5:1 D5:2 R G5:2 F5:1 E5 D5:2" },
  "star-fox": { tempo: 152, wave: "square", seq: "C5:1 G5:1 C6:2 G5:1 E5:1 C5:2 D5:1 A5:1 D6:2" },
  "f-zero": { tempo: 164, wave: "square", seq: "G4:1 B4 D5 G5:2 D5:1 B4:1 G4:2 A4:1 C5 E5 A5:2" },
  "earthbound": { tempo: 124, wave: "square", seq: "E5:1 G5 A5 C6:1 A5 G5 E5:2 D5:1 F5 A5 C6:2" },
  "mother3": { tempo: 118, wave: "triangle", seq: "G4:1 B4 D5 G5:1 D5 B4 G4:2 A4:1 C5 E5 A5:2" },
  "fire-emblem": { tempo: 108, wave: "triangle", seq: "D5:2 F5:1 A5:1 C6:2 A5:1 F5:1 D5:2 Eb5:1 F5:3" },
  "warioware": { tempo: 176, wave: "square", seq: "C5:1 C5 D5:1 E5:1 C5:1 D5 E5:2 G5:2 E5:1 D5 C5:2" },

  /* آرکیدهای کلاسیک */
  pacman: { tempo: 190, wave: "square", seq: "B4:1 B5:1 B4:1 B5:1 B4:1 B5:1 C6:1 B5:1 A5:1 G5:1 F5:1 E5:1 D5:1 C5:1" },
  "ms-pacman": { tempo: 190, wave: "square", seq: "B4:1 B5:1 B4:1 B5:1 B4:1 B5:1 C6:1 B5:1 A5:1 G5:1 F5:1 E5:1 D5:1 C5:1" },
  galaga: { tempo: 140, wave: "square", seq: "C5:1 E5 G5 C6:2 G5:1 E5:1 C5:2 G5:1 B5 D6:2" },
  "space-invaders": { tempo: 100, wave: "triangle", seq: "E3:1 D3 C3 B2 E3:1 D3 C3 B2" },
  asteroids: { tempo: 112, wave: "triangle", seq: "A3:2 C4:1 E4:1 A4:3 E4:1 C4:1 A3:3" },
  centipede: { tempo: 144, wave: "square", seq: "E5:1 D5 C5 B4 C5 D5 E5:2 R E5 D5 C5:2" },
  defender: { tempo: 132, wave: "square", seq: "C5:1 Eb5 F5 G5 Bb5:2 G5:1 F5 Eb5 C5:2" },
  frogger: { tempo: 136, wave: "square", seq: "C5:1 E5 G5 C6:1 R G5:1 E5:1 C5:2 D5 F5 A5 D6:2" },
  "dig-dug": { tempo: 128, wave: "square", seq: "G4:1 B4 D5 G5:1 D5 B4 G4:2 A4:1 C5 E5 A5:2" },
  xevious: { tempo: 148, wave: "square", seq: "A4:1 C5 E5 A5:1 C6 A5 E5 C5 A4:2" },
  nineteen42: { tempo: 152, wave: "square", seq: "E5:1 G5 A5 B5 D6:2 B5:1 A5 G5 E5:2" },
  "pole-position": { tempo: 156, wave: "sawtooth", seq: "G4:1 B4 D5 G5:1 F5 D5 B4 G4:2 A4 C5 E5 A5:2" },
  "gng-arcade": { tempo: 124, wave: "square", seq: "D5:1 F5 A5 D6:2 A5:1 F5:1 D5:2 Bb4:1 C5:3" },
  sf2: { tempo: 128, wave: "sawtooth", seq: "C4:1 Db4 C4:1 G3:1 C4 Db4 Eb4:1 Db4 C4:1 G3:1 C4:3" },
  mk1: { tempo: 108, wave: "sawtooth", seq: "G2:1 G2:1 G3:2 F3:1 Eb3:1 D3:1 C3:3 R:1 G2 G2 G3:2" },
  "mk2": { tempo: 116, wave: "sawtooth", seq: "G2:1 Bb2 C3:2 Eb3:1 C3 Bb2:1 G2:3 F2:1 G2:3" },
  "nba-jam": { tempo: 150, wave: "square", seq: "C5:1 C5 G4:1 C5 Eb5:2 F5:1 Eb5 C5:2 Bb4:1 C5:3" },
  "metal-slug": { tempo: 160, wave: "square", seq: "A4:1 C5 D5 E5 G5:1 E5 D5 C5 A4:2 G4:1 A4:3" },
  "virtua-fighter": { tempo: 120, wave: "sawtooth", seq: "D4:1 F4 A4 D5:2 A4:1 F4:1 D4:2 Eb4:1 F4:3" },
  "double-dragon": { tempo: 122, wave: "square", seq: "E4:1 G4 A4 B4 E5:1 B4 A4 G4 E4:2 D4:1 E4:3" },
  "final-fight": { tempo: 118, wave: "sawtooth", seq: "A3:1 C4 E4 A4:2 E4:1 C4:1 A3:2 Bb3:1 C4:3" },
  "ninja-gaiden": { tempo: 156, wave: "square", seq: "E5:1 G5 A5 B5 E6:2 B5:1 A5 G5 E5:2" },

  /* سگا */
  "sonic-1": { tempo: 168, wave: "square", seq: "E5:1 G5 B5 E6:2 B5:1 G5:1 A5 C6 E6:2 C6:1 A5:1 G5:2" },
  "sonic-2": { tempo: 172, wave: "square", seq: "C5:1 E5 G5 C6:2 G5:1 E5:1 F5 A5 C6:2 A5:1 F5:1 E5:2" },
  "sonic-3": { tempo: 170, wave: "square", seq: "D5:1 F5 A5 D6:2 A5:1 F5:1 G5 B5 D6:2 B5:1 G5:1 F5:2" },
  "sonic-gg": { tempo: 160, wave: "square", seq: "E5:1 G5 B5 E6:2 B5:1 G5:1 A5 C6 E6:2" },
  "streets-of-rage": { tempo: 108, wave: "sawtooth", seq: "A3:2 C4:1 E4:1 A4:2 G4:1 E4 C4:1 A3:2 G3:1 A3:3" },
  "streets-of-rage-2": { tempo: 118, wave: "sawtooth", hats: true, seq: "A3:2 C4:1 E4:1 G4:1 A4:2 G4:1 E4 C4:1 A3:2 R:1 A3 C4:2" },
  "streets-of-rage-3": { tempo: 126, wave: "sawtooth", hats: true, seq: "A3:1 C4 Eb4:1 E4:1 G4:2 F4 Eb4:1 C4:1 A3:2 G3:1 A3:3" },
  "sor-gg": { tempo: 112, wave: "sawtooth", seq: "A3:2 C4:1 E4:1 A4:2 G4:1 E4 C4:1 A3:2" },
  "golden-axe": { tempo: 100, wave: "sawtooth", seq: "D4:1 F4 A4 D5:2 C5:1 A4 F4:1 D4:2 Eb5:1 D5:3" },
  "golden-axe-2": { tempo: 104, wave: "sawtooth", seq: "D4:1 F4 A4 D5:2 F5:1 D5 A4:1 F4:2 D4:3" },
  "golden-axe-3": { tempo: 106, wave: "sawtooth", seq: "C4:1 Eb4 G4 C5:2 Bb4:1 G4 Eb4:1 C4:2 Db5:1 C5:3" },
  "altered-beast": { tempo: 96, wave: "sawtooth", seq: "E3:2 G3:1 A3:1 B3:2 E4:2 B3:1 A3 G3:1 E3:3" },
  "phantasy-star": { tempo: 96, wave: "triangle", seq: "D5:1 F5 A5 C6:2 A5:1 F5:1 D5:2 Bb4:1 A4:3" },
  "phantasy4": { tempo: 104, wave: "triangle", seq: "C5:1 Eb5 F5 G5 Bb5:2 G5:1 F5 Eb5:1 C5:2 D5:1 Eb5:3" },
  ecco: { tempo: 84, wave: "sine", seq: "E5:2 G5:2 B5:2 D6:3 B5:1 G5:1 E5:4" },
  "comix-zone": { tempo: 126, wave: "sawtooth", seq: "C4:1 Eb4 F4:1 F#4:1 G4:2 F#4:1 F4 Eb4:1 C4:2" },
  "earthworm-jim": { tempo: 120, wave: "square", seq: "G4:1 Bb4 C5:1 Db5:1 C5 Bb4:1 G4:1 F4:1 G4:2" },
  "gunstar-heroes": { tempo: 170, wave: "square", hats: true, seq: "A4:1 B4 C5 E5 G5:1 E5 C5 B4 A4:2 G4:1 A4:2" },
  "toejam-earl": { tempo: 100, wave: "triangle", seq: "D3:2 F3:1 G3:1 A3:2 C4:2 A3:1 G3 F3:1 D3:3" },
  ristar: { tempo: 132, wave: "square", seq: "C5:1 D5 E5 G5 A5:1 G5 E5 D5 C5:2 E5:1 G5:2" },
  "columns-md": { tempo: 92, wave: "triangle", seq: "E4:2 G4:1 B4:1 E5:2 B4:1 G4:1 E4:3 D4:1 E4:3" },
  "mean-bean": { tempo: 122, wave: "square", seq: "A4:1 C5 E5 A5:1 E5 C5 A4:2 G4:1 A4 B4:2" },
  "alex-kidd": { tempo: 144, wave: "square", seq: "G5:1 A5 G5:1 R E5:2 R G5:1 A5 G5:1 R D5:2" },
  "wonder-boy": { tempo: 136, wave: "square", seq: "C5:1 E5 F5 G5 A5:1 G5 F5 E5 D5:1 C5:2" },
  "wonder-boy-3": { tempo: 124, wave: "square", seq: "C5:1 E5 F5 G5 A5:2 G5:1 F5 E5:1 D5:1 C5:2" },
  "fantasy-zone": { tempo: 128, wave: "square", seq: "F5:1 A5 C6:2 A5:1 F5:1 D5:1 C5:2 A5:1 C6:2" },
  "psycho-fox": { tempo: 140, wave: "square", seq: "G5:1 B5 D6:2 B5:1 G5:1 E5:1 D5:1 C5:2" },
  "ghost-house": { tempo: 104, wave: "triangle", seq: "D4:1 F4 Ab4:2 D5:2 Ab4:1 F4:1 D4:2 E4:1 F4:3" },
  "revenge-of-shinobi": { tempo: 104, wave: "sawtooth", seq: "E4:2 G4:1 A4:1 B4:2 E5:2 B4:1 A4 G4:1 E4:3" },
  shinobi3: { tempo: 164, wave: "square", hats: true, seq: "E5:1 G5 A5 B5 D6:1 B5 A5 G5 E5:2 D5:1 E5:2" },
  "shadow-dancer": { tempo: 112, wave: "sawtooth", seq: "E4:1 G4 A4 B4:2 D5:1 B4 A4:1 G4:1 E4:2" },
  "kid-chameleon": { tempo: 148, wave: "square", seq: "G5:1 A5 B5 D6:1 B5 A5 G5:2 E5:1 G5 A5:2" },
  daytona: { tempo: 150, wave: "sawtooth", hats: true, seq: "C5:1 E5 G5 C6:2 E6:1 C6:1 G5 E5:1 C5:2" },
  "daytona-usa": { tempo: 150, wave: "sawtooth", hats: true, seq: "C5:1 E5 G5 C6:2 E6:1 C6:1 G5 E5:1 C5:2" },
  "sega-rally": { tempo: 148, wave: "sawtooth", hats: true, seq: "D5:1 F5 A5 D6:2 C6:1 A5:1 F5 D5:2" },
  outrun: { tempo: 132, wave: "sawtooth", seq: "F5:1 A5 C6:2 D6:1 C6:1 A5 F5:1 D5:1 C5:2" },
  "space-harrier": { tempo: 156, wave: "square", seq: "A4:1 C5 E5 A5:1 C6 A5 E5 C5 A4:2" },
  "after-burner-2": { tempo: 150, wave: "sawtooth", seq: "E5:1 G5 B5 E6:2 D6:1 B5:1 G5 E5:2" },
  "virtua-cop": { tempo: 122, wave: "sawtooth", seq: "C4:1 D4 Eb4:1 G4:1 Bb4:2 G4:1 Eb4 D4:1 C4:2" },
  "super-monaco-gp": { tempo: 144, wave: "square", seq: "G4:1 B4 D5 G5:2 F5:1 D5:1 B4 G4:2" },
  "hang-on": { tempo: 140, wave: "square", seq: "A4:1 C5 E5 A5:2 G5:1 E5:1 C5 A4:2" },
  "super-hang-on": { tempo: 146, wave: "square", seq: "A4:1 C5 E5 A5:2 C6:1 A5:1 E5 C5 A4:2" },
  "power-drift": { tempo: 142, wave: "square", seq: "G4:1 C5 E5 G5:2 A5:1 G5:1 E5 C5:2" },
  "alien-syndrome": { tempo: 126, wave: "square", seq: "E4:1 G4 Bb4:2 E5:2 Bb4:1 G4:1 E4:2 F4:1 G4:2" },
  "eternal-champions": { tempo: 114, wave: "sawtooth", seq: "D4:1 F4 A4:2 D5:2 C5:1 A4 F4:1 D4:3" },
  "virtua-racing": { tempo: 152, wave: "sawtooth", seq: "E4:1 G4 B4 E5:2 D5:1 B4:1 G4 E4:2" },
  "thunder-force-4": { tempo: 158, wave: "sawtooth", hats: true, seq: "A4:1 C5 E5 A5:2 C6:1 A5 E5:1 C5:1 A4:2" },
  sparkster: { tempo: 150, wave: "square", seq: "D5:1 F5 A5 D6:2 C6:1 A5 F5:1 D5:2" },
  "rocket-knight": { tempo: 146, wave: "square", seq: "C5:1 E5 G5 C6:2 Bb5:1 G5 E5:1 C5:2" },
  "alien-soldier": { tempo: 160, wave: "sawtooth", hats: true, seq: "E5:1 G5 B5:2 E6:2 D6:1 B5 G5:1 E5:2" },
  "bonanza-bros": { tempo: 118, wave: "triangle", seq: "G4:1 Bb4 C5:2 D5:2 C5:1 Bb4 G4:1 F4:1 G4:2" },
  "gain-ground": { tempo: 120, wave: "square", seq: "D5:1 F5 A5:2 D6:2 A5:1 F5:1 D5:2" },
  "battletoads-md": { tempo: 148, wave: "sawtooth", seq: "E4:1 G4 A4 B4:2 E5:2 B4:1 A4 G4:1 E4:2" },
  "beyond-oasis": { tempo: 100, wave: "triangle", seq: "D5:2 F5:1 A5:1 D6:2 A5:1 F5:1 D5:2 G5:1 A5:3" },
  "landstalker": { tempo: 116, wave: "triangle", seq: "G4:1 B4 D5 G5:2 F5:1 D5 B4:1 G4:2" },
  "shining-force-2": { tempo: 104, wave: "triangle", seq: "C5:1 Eb5 F5 G5 Bb5:2 G5:1 F5 Eb5:1 C5:2" },
  "dune-2-md": { tempo: 96, wave: "sawtooth", seq: "D3:2 F3:1 A3:1 D4:2 C4:1 A3 F3:1 D3:3" },
  "sonic-spinball": { tempo: 158, wave: "square", seq: "E5:1 G5 B5 E6:2 D6:1 B5 G5:1 E5:2" },
  "skies": { tempo: 108, wave: "triangle", seq: "C5:2 E5:1 G5:1 C6:2 G5:1 E5:1 C5:2 D5:1 E5:3" },
  "virtua-tennis": { tempo: 134, wave: "square", seq: "G4:1 C5 E5 G5:2 A5:1 G5:1 E5 C5:2" },

  /* رایانه و بقیه */
  "prince-of-persia": { tempo: 96, wave: "triangle", seq: "D4:1 Eb4:1 F#4:1 G4:2 A4:1 Bb4:1 C5:1 D5:2 C5:1 Bb4 A4:1 G4 F#4:1 Eb4:1 D4:3" },
  "another-world": { tempo: 72, wave: "sine", seq: "A4:2 C5:2 E5:2 G5:4 E5:2 C5:2 A4:4" },
  lemmings: { tempo: 120, wave: "square", seq: "E5:1 E5 F5 G5 G5 F5 E5 D5 C5 C5 D5 E5 E5:2 D5:1 D5:2" },
  doom: { tempo: 140, wave: "sawtooth", hats: true, seq: "E3:1 E3 E4:1 E3:1 G4:2 F4:1 E4:1 D4:1 C4:1 D4:2" },
  "monkey-island": { tempo: 116, wave: "square", seq: "D5:1 F5 G5 A5 C6:1 A5 G5 F5 D5:2" },
  simcity: { tempo: 80, wave: "triangle", seq: "C5:2 E5:1 G5:1 C6:3 G5:1 E5:1 C5:3" },
  diablo: { tempo: 84, wave: "triangle", seq: "D3:2 F3:1 A3:1 C4:2 D4:2 C4:1 A3 F3:1 D3:3" },
  "metal-gear": { tempo: 100, wave: "sawtooth", seq: "A4:1 C5:1 E5:2 A5:2 G5:1 E5:1 C5:2 A4:3" },
  "metal-gear-solid": { tempo: 104, wave: "sawtooth", seq: "A4:1 C5:1 E5:2 A5:2 G5:1 E5:1 D5:1 C5:2 A4:3" },
  "resident-evil": { tempo: 72, wave: "sine", seq: "Eb4:2 R Gb4:2 R A4:3 R Eb4:2 R:2" },
  "silent-hill": { tempo: 76, wave: "sine", seq: "D4:2 F4:2 G#4:2 A4:4 F4:2 D4:4" },
  "tomb-raider": { tempo: 112, wave: "triangle", seq: "C5:1 Eb5 F5 G5 Bb5:1 G5 F5 Eb5 C5:2" },
  "crash-bandicoot": { tempo: 132, wave: "square", seq: "E5:1 G5:1 A5:1 B5:2 A5:1 G5:1 E5:2 D5:1 E5:3" },
  ff7: { tempo: 96, wave: "triangle", seq: "A4:1 C5 E5 A5:1 G5 E5 C5 A4:1 F5 E5 D5 C5:2" },
  "final-fantasy": { tempo: 96, wave: "triangle", seq: "C5:2 E5:1 G5:1 C6:2 G5:1 E5:1 C5:2 D5:1 E5:3" },
  "dragon-quest": { tempo: 104, wave: "triangle", seq: "G4:1 C5 E5 G5:2 E5:1 C5:1 G4:2 A4:1 C5:2" },
  "tony-hawk": { tempo: 168, wave: "sawtooth", hats: true, seq: "E5:1 G5 A5 B5:1 A5 G5 E5:1 D5:1 E5:2" },
  "half-life": { tempo: 108, wave: "sawtooth", seq: "E4:1 G4 A4 B4:2 D5:1 B4 A4:1 G4:1 E4:2" },
  warcraft: { tempo: 100, wave: "sawtooth", seq: "D4:1 F4 A4 D5:2 C5:1 A4 F4:1 D4:3" },
  "star-craft": { tempo: 108, wave: "sawtooth", seq: "C4:1 Eb4 G4 C5:2 Bb4:1 G4 Eb4:1 C4:3" },
  "age-of-empires": { tempo: 112, wave: "triangle", seq: "D4:1 G4 A4 B4 D5:2 B4:1 A4 G4:1 D4:2" },
  "civilization": { tempo: 92, wave: "triangle", seq: "C4:2 E4:1 G4:1 C5:2 G4:1 E4:1 C4:3" },
  "sim-city": { tempo: 80, wave: "triangle", seq: "C5:2 E5:1 G5:1 C6:3 G5:1 E5:1 C5:3" },
  "worms": { tempo: 128, wave: "square", seq: "C5:1 C5 G4:1 C5 Eb5:2 F5:1 Eb5 C5:2" },
  turrican: { tempo: 144, wave: "square", seq: "C5:1 D5 Eb5 G5 Bb5:1 G5 Eb5 D5 C5:2" },
  "sensible-soccer": { tempo: 140, wave: "square", seq: "G4:1 C5 E5 G5:2 F5:1 E5 D5:1 C5:2" },
  "cannon-fodder": { tempo: 132, wave: "square", seq: "A4:1 C5 D5 E5:2 D5:1 C5 A4:1 G4:1 A4:2" },
  "yie-ar-kung-fu": { tempo: 128, wave: "square", seq: "D5:1 E5 F5 A5 C6:1 A5 F5 E5 D5:2" },
  gradius: { tempo: 150, wave: "square", seq: "E5:1 G5 A5 B5 D6:1 C6 B5 A5 G5 E5:2" },
  "bubble-bobble": { tempo: 136, wave: "square", seq: "C5:1 E5 G5 C6:2 G5:1 E5:1 C5:2 D5 F5 A5:2" },
  "snow-bros": { tempo: 130, wave: "square", seq: "F5:1 A5 C6 F6:2 C6:1 A5:1 F5:2" },
  "cadillacs-dinosaurs": { tempo: 124, wave: "sawtooth", seq: "E4:1 G4 B4 E5:2 D5:1 B4 G4:1 E4:2" },
  "dynasty-warriors": { tempo: 120, wave: "sawtooth", seq: "D4:1 F4 G4 A4 C5:2 A4:1 G4 F4:1 D4:2" },
};

/* ── الگوهای ژانر و سکو برای بقیه‌ی بازی‌ها ── */

const GENRE_SCALE: Record<string, number[]> = {
  "پلتفرمر": [0, 2, 4, 5, 7, 9, 11],
  "اکشن": [0, 2, 3, 5, 7, 8, 10],
  "ماجراجویی": [0, 2, 3, 5, 7, 9, 10],
  "نقش‌آفرینی": [0, 2, 4, 6, 7, 9, 11],
  "شوتر": [0, 2, 3, 5, 7, 8, 10],
  "مبارزه‌ای": [0, 1, 3, 5, 7, 8, 10],
  "مسابقه‌ای": [0, 2, 4, 5, 7, 9, 10],
  "ورزشی": [0, 2, 4, 5, 7, 9, 10],
  "استراتژی": [0, 2, 3, 5, 7, 9, 10],
  "معمایی": [0, 2, 4, 7, 9],
  "وحشت": [0, 1, 3, 5, 6, 8, 10],
  "شبیه‌ساز": [0, 2, 4, 5, 7, 9, 11],
  /* ژانرهای سینما و سریال */
  "درام": [0, 2, 3, 5, 7, 8, 10],
  "کمدی": [0, 2, 4, 5, 7, 9, 11],
  "حماسی": [0, 2, 4, 7, 9, 11],
  "وسترن": [0, 2, 4, 5, 7, 9],
  "جنایی": [0, 1, 3, 5, 7, 8, 10],
  "عاشقانه": [0, 2, 4, 5, 7, 9, 11],
  "جنگی": [0, 2, 3, 5, 7, 10],
  "علمی‌تخیلی": [0, 1, 4, 5, 7, 8, 11],
  "خانوادگی": [0, 2, 4, 5, 7, 9],
  "کودک": [0, 2, 4, 5, 7, 9, 11],
  "تاریخی": [0, 2, 3, 5, 7, 8],
  "مذهبی": [0, 2, 4, 7, 9],
  "رازآلود": [0, 1, 3, 5, 6, 8],
  "انیمیشن": [0, 2, 4, 5, 7, 9, 11],
  "جاسوسی": [0, 2, 3, 6, 7, 10],
};

const GENRE_TEMPO: Record<string, number> = {
  "پلتفرمر": 148, "اکشن": 132, "ماجراجویی": 112, "نقش‌آفرینی": 100,
  "شوتر": 156, "مبارزه‌ای": 124, "مسابقه‌ای": 152, "ورزشی": 138,
  "استراتژی": 104, "معمایی": 96, "وحشت": 76, "شبیه‌ساز": 88,
  /* ژانرهای سینما و سریال */
  "درام": 92, "کمدی": 128, "حماسی": 84, "وسترن": 100, "جنایی": 96,
  "عاشقانه": 80, "جنگی": 108, "علمی‌تخیلی": 116, "خانوادگی": 104,
  "کودک": 132, "تاریخی": 88, "مذهبی": 76, "رازآلود": 84, "انیمیشن": 124, "جاسوسی": 112,
};

const PLATFORM_WAVE: Record<string, OscillatorType> = {
  atari2600: "square", arcade: "square", nes: "square", snes: "triangle",
  megadrive: "sawtooth", sms: "square", gameboy: "square", gamegear: "square",
  ps1: "sawtooth", n64: "triangle", ps2: "sawtooth", gamecube: "sawtooth",
  dreamcast: "sawtooth", pc: "sawtooth", msx: "square", amiga: "sawtooth",
  saturn: "sawtooth", gba: "square",
};

export const hashStr = (s: string): number => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
};

export const mulberry32 = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const generate = (
  rng: () => number,
  scale: number[],
  root: number,
  tempo: number,
  wave: OscillatorType
): Motif => {
  const notes: Note[] = [];
  let deg = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < 26; i++) {
    if (rng() < 0.16) {
      notes.push([-1, 1]);
      continue;
    }
    deg = Math.min(scale.length * 2 - 1, Math.max(0, deg + Math.floor(rng() * 5) - 2));
    const oct = Math.floor(deg / scale.length);
    const midi = root + 12 * (oct + 1) + scale[deg % scale.length];
    const len = rng() < 0.14 ? 2 : 1;
    notes.push([midi, len]);
    if (len === 2) i++;
  }
  return { tempo, wave, notes, hats: tempo >= 144, root };
};

/* ── موتیف هر بازی ── */

export function motifForGame(g: { id: string; genre: string; platform: string }): Motif {
  const def = GAME_MOTIFS[g.id];
  if (def) return build(def);
  const rng = mulberry32(hashStr(g.id));
  const scale = GENRE_SCALE[g.genre] ?? [0, 2, 4, 5, 7, 9, 11];
  const tempo = (GENRE_TEMPO[g.genre] ?? 120) + Math.floor(rng() * 13) - 6;
  const wave = PLATFORM_WAVE[g.platform] ?? "square";
  return generate(rng, scale, 48 + Math.floor(rng() * 7), tempo, wave);
}

/* ── نغمه‌ی دهه‌ها (با حال‌وهوای موسیقی ایرانی هر دهه) ── */

const DECADE_STYLE: Record<string, { scale: number[]; tempo: number; wave: OscillatorType; root: number }> = {
  "60": { scale: [0, 1, 3, 5, 7, 8, 10], tempo: 86, wave: "triangle", root: 50 }, // دستگاه شور
  "70": { scale: [0, 2, 4, 7, 9], tempo: 112, wave: "square", root: 48 }, // پاپ
  "80": { scale: [0, 2, 3, 5, 7, 8, 10], tempo: 132, wave: "sawtooth", root: 45 }, // الکترونیک
};

export function motifForMemory(n: { id: string; decade: string }): Motif {
  const st = DECADE_STYLE[n.decade] ?? DECADE_STYLE["70"];
  const rng = mulberry32(hashStr(n.id));
  return generate(rng, st.scale, st.root, st.tempo + Math.floor(rng() * 9) - 4, st.wave);
}
