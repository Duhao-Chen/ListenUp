// ============================================================
// Character Sprite Generator
// Beautiful chibi-style pixel art characters, drawn with love.
// Each character is 32x48px (16x24 pixel-art at 2x scale).
// Spritesheet layout: 4 columns (walk frames) x 4 rows (directions)
// ============================================================

import type { CharacterAppearance, Direction } from '@shared/types';

const S = 2; // Pixel scale — each art-pixel is 2x2 screen pixels

// ---- Color Utilities ----

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

function darken(hex: string, amount: number): string {
  return lighten(hex, -amount);
}

// ---- Drawing Primitives ----

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * S, y * S, S, S);
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * S, y * S, w * S, h * S);
}

// ---- Hair Drawing ----

function drawHairDown(ctx: CanvasRenderingContext2D, bob: number, color: string, dark: string, style: string) {
  switch (style) {
    case 'short':
      rect(ctx, 3, 1 + bob, 10, 4, color);
      rect(ctx, 4, 0 + bob, 8, 2, color);
      rect(ctx, 3, 1 + bob, 1, 6, dark);
      rect(ctx, 12, 1 + bob, 1, 6, color);
      break;
    case 'medium':
      rect(ctx, 3, 1 + bob, 10, 4, color);
      rect(ctx, 4, 0 + bob, 8, 2, color);
      rect(ctx, 2, 2 + bob, 2, 8, color);
      rect(ctx, 12, 2 + bob, 2, 8, color);
      rect(ctx, 2, 2 + bob, 1, 8, dark);
      break;
    case 'long':
      rect(ctx, 3, 1 + bob, 10, 4, color);
      rect(ctx, 4, 0 + bob, 8, 2, color);
      rect(ctx, 2, 2 + bob, 2, 12, color);
      rect(ctx, 12, 2 + bob, 2, 12, color);
      rect(ctx, 2, 2 + bob, 1, 12, dark);
      break;
    case 'ponytail':
      rect(ctx, 3, 1 + bob, 10, 4, color);
      rect(ctx, 4, 0 + bob, 8, 2, color);
      rect(ctx, 3, 1 + bob, 1, 5, dark);
      rect(ctx, 12, 1 + bob, 1, 5, color);
      // Ponytail in back (visible when facing down as a tuft)
      rect(ctx, 7, 0 + bob, 3, 1, color);
      break;
    case 'spiky':
      rect(ctx, 3, 2 + bob, 10, 3, color);
      rect(ctx, 4, 1 + bob, 8, 2, color);
      // Spikes
      px(ctx, 4, 0 + bob, color);
      px(ctx, 6, 0 + bob, color);
      px(ctx, 8, 0 + bob, color);
      px(ctx, 10, 0 + bob, color);
      px(ctx, 5, -1 + bob, color);
      px(ctx, 9, -1 + bob, color);
      rect(ctx, 3, 2 + bob, 1, 5, dark);
      rect(ctx, 12, 2 + bob, 1, 4, color);
      break;
    case 'bob':
      rect(ctx, 3, 1 + bob, 10, 4, color);
      rect(ctx, 4, 0 + bob, 8, 2, color);
      rect(ctx, 2, 3 + bob, 2, 7, color);
      rect(ctx, 12, 3 + bob, 2, 7, color);
      rect(ctx, 3, 9 + bob, 10, 1, color);
      rect(ctx, 2, 3 + bob, 1, 7, dark);
      break;
  }
}

function drawHairUp(ctx: CanvasRenderingContext2D, bob: number, color: string, dark: string, style: string) {
  rect(ctx, 3, 1 + bob, 10, 5, color);
  rect(ctx, 4, 0 + bob, 8, 2, color);
  rect(ctx, 3, 1 + bob, 10, 1, dark);
  if (style === 'ponytail') {
    rect(ctx, 6, 5 + bob, 3, 8, color);
    rect(ctx, 7, 12 + bob, 2, 2, color);
    rect(ctx, 6, 5 + bob, 1, 8, dark);
  }
  if (style === 'long') {
    rect(ctx, 2, 3 + bob, 2, 11, color);
    rect(ctx, 12, 3 + bob, 2, 11, color);
    rect(ctx, 2, 3 + bob, 1, 11, dark);
  }
  if (style === 'spiky') {
    px(ctx, 4, 0 + bob, color);
    px(ctx, 6, -1 + bob, color);
    px(ctx, 8, 0 + bob, color);
    px(ctx, 10, -1 + bob, color);
  }
}

function drawHairSide(ctx: CanvasRenderingContext2D, bob: number, color: string, dark: string, style: string, flip: boolean) {
  rect(ctx, 3, 1 + bob, 10, 4, color);
  rect(ctx, 4, 0 + bob, 8, 2, color);
  if (!flip) {
    rect(ctx, 2, 2 + bob, 2, 6, color);
    rect(ctx, 2, 2 + bob, 1, 6, dark);
  } else {
    rect(ctx, 12, 2 + bob, 2, 6, color);
  }
  if (style === 'long' || style === 'bob') {
    const ext = style === 'long' ? 11 : 7;
    if (!flip) {
      rect(ctx, 2, 2 + bob, 2, ext, color);
      rect(ctx, 2, 2 + bob, 1, ext, dark);
    } else {
      rect(ctx, 12, 2 + bob, 2, ext, color);
    }
  }
  if (style === 'ponytail') {
    if (!flip) {
      rect(ctx, 12, 3 + bob, 2, 2, color);
      rect(ctx, 13, 5 + bob, 2, 6, color);
      rect(ctx, 14, 10 + bob, 2, 2, color);
    } else {
      rect(ctx, 2, 3 + bob, 2, 2, color);
      rect(ctx, 1, 5 + bob, 2, 6, color);
      rect(ctx, 0, 10 + bob, 2, 2, color);
    }
  }
  if (style === 'spiky') {
    px(ctx, 5, 0 + bob, color);
    px(ctx, 7, -1 + bob, color);
    px(ctx, 9, 0 + bob, color);
    px(ctx, 11, -1 + bob, color);
  }
}

// ---- Character Frame Drawing ----

function drawCharDown(ctx: CanvasRenderingContext2D, frame: number, app: CharacterAppearance) {
  const walkOffset = [0, 1, 0, -1][frame];
  const bob = (frame === 1 || frame === 3) ? -1 : 0;
  const armSwing = [0, 1, 0, -1][frame];

  const skinDark = darken(app.skinTone, 20);
  const shirtDark = darken(app.shirtColor, 25);
  const shirtLight = lighten(app.shirtColor, 20);
  const pantsDark = darken(app.pantsColor, 20);
  const hairDark = darken(app.hairColor, 30);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(8 * S, 23 * S, 5 * S, 1.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Feet
  rect(ctx, 4, 21 + walkOffset, 3, 2, pantsDark);
  rect(ctx, 9, 21 - walkOffset, 3, 2, pantsDark);

  // Legs
  rect(ctx, 4, 17 + walkOffset, 4, 4, app.pantsColor);
  rect(ctx, 4, 17 + walkOffset, 1, 4, pantsDark);
  rect(ctx, 8, 17 - walkOffset, 4, 4, app.pantsColor);
  rect(ctx, 11, 17 - walkOffset, 1, 4, pantsDark);

  // Belt
  rect(ctx, 4, 16 + bob, 8, 1, pantsDark);

  // Body
  rect(ctx, 4, 11 + bob, 8, 6, app.shirtColor);
  rect(ctx, 4, 11 + bob, 1, 6, shirtDark);
  rect(ctx, 11, 11 + bob, 1, 6, shirtLight);
  // Collar detail
  rect(ctx, 6, 11 + bob, 4, 1, shirtDark);

  // Left arm
  rect(ctx, 2, 11 + bob + armSwing, 2, 5, app.shirtColor);
  rect(ctx, 2, 14 + bob + armSwing, 2, 2, app.skinTone);
  rect(ctx, 2, 11 + bob + armSwing, 1, 5, shirtDark);

  // Right arm
  rect(ctx, 12, 11 + bob - armSwing, 2, 5, app.shirtColor);
  rect(ctx, 12, 14 + bob - armSwing, 2, 2, app.skinTone);
  rect(ctx, 13, 11 + bob - armSwing, 1, 5, shirtLight);

  // Head
  rect(ctx, 3, 2 + bob, 10, 9, app.skinTone);
  rect(ctx, 3, 2 + bob, 1, 9, skinDark);

  // Eyes — big and expressive
  rect(ctx, 5, 5 + bob, 2, 3, '#FFFFFF');
  rect(ctx, 9, 5 + bob, 2, 3, '#FFFFFF');
  px(ctx, 5, 6 + bob, app.eyeColor);
  px(ctx, 6, 6 + bob, app.eyeColor);
  px(ctx, 9, 6 + bob, app.eyeColor);
  px(ctx, 10, 6 + bob, app.eyeColor);
  // Pupil highlight
  px(ctx, 6, 5 + bob, '#FFFFFF');
  px(ctx, 10, 5 + bob, '#FFFFFF');

  // Mouth
  px(ctx, 7, 9 + bob, '#D4756B');
  px(ctx, 8, 9 + bob, '#D4756B');

  // Blush — that warm, alive feeling
  ctx.fillStyle = 'rgba(255, 160, 140, 0.35)';
  ctx.fillRect(4 * S, (7 + bob) * S, 2 * S, S);
  ctx.fillRect(10 * S, (7 + bob) * S, 2 * S, S);

  // Hair (drawn on top)
  drawHairDown(ctx, bob, app.hairColor, hairDark, app.hairStyle);
}

function drawCharUp(ctx: CanvasRenderingContext2D, frame: number, app: CharacterAppearance) {
  const walkOffset = [0, 1, 0, -1][frame];
  const bob = (frame === 1 || frame === 3) ? -1 : 0;
  const armSwing = [0, -1, 0, 1][frame];

  const skinDark = darken(app.skinTone, 20);
  const shirtDark = darken(app.shirtColor, 25);
  const shirtLight = lighten(app.shirtColor, 20);
  const pantsDark = darken(app.pantsColor, 20);
  const hairDark = darken(app.hairColor, 30);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(8 * S, 23 * S, 5 * S, 1.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Feet
  rect(ctx, 4, 21 + walkOffset, 3, 2, pantsDark);
  rect(ctx, 9, 21 - walkOffset, 3, 2, pantsDark);

  // Legs
  rect(ctx, 4, 17 + walkOffset, 4, 4, app.pantsColor);
  rect(ctx, 8, 17 - walkOffset, 4, 4, app.pantsColor);
  rect(ctx, 4, 17 + walkOffset, 1, 4, pantsDark);

  // Belt
  rect(ctx, 4, 16 + bob, 8, 1, pantsDark);

  // Body
  rect(ctx, 4, 11 + bob, 8, 6, app.shirtColor);
  rect(ctx, 4, 11 + bob, 1, 6, shirtDark);
  rect(ctx, 11, 11 + bob, 1, 6, shirtLight);

  // Arms
  rect(ctx, 2, 11 + bob + armSwing, 2, 5, app.shirtColor);
  rect(ctx, 2, 14 + bob + armSwing, 2, 2, app.skinTone);
  rect(ctx, 12, 11 + bob - armSwing, 2, 5, app.shirtColor);
  rect(ctx, 12, 14 + bob - armSwing, 2, 2, app.skinTone);

  // Head (back of head — all hair color)
  rect(ctx, 3, 2 + bob, 10, 9, app.skinTone);

  // Hair covers the back completely
  drawHairUp(ctx, bob, app.hairColor, hairDark, app.hairStyle);

  // Ears (tiny skin peeks)
  px(ctx, 3, 5 + bob, app.skinTone);
  px(ctx, 12, 5 + bob, app.skinTone);
}

function drawCharLeft(ctx: CanvasRenderingContext2D, frame: number, app: CharacterAppearance) {
  const walkOffset = [0, 1, 0, -1][frame];
  const bob = (frame === 1 || frame === 3) ? -1 : 0;
  const armSwing = [0, 1, 0, -1][frame];

  const skinDark = darken(app.skinTone, 20);
  const shirtDark = darken(app.shirtColor, 25);
  const pantsDark = darken(app.pantsColor, 20);
  const hairDark = darken(app.hairColor, 30);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(8 * S, 23 * S, 5 * S, 1.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back leg
  rect(ctx, 7, 17 - walkOffset, 3, 4, pantsDark);
  rect(ctx, 7, 21 - walkOffset, 3, 2, darken(app.pantsColor, 30));

  // Back arm
  rect(ctx, 8, 11 + bob - armSwing, 2, 5, shirtDark);
  rect(ctx, 8, 14 + bob - armSwing, 2, 2, skinDark);

  // Body
  rect(ctx, 4, 11 + bob, 6, 6, app.shirtColor);
  rect(ctx, 4, 11 + bob, 1, 6, shirtDark);

  // Front leg
  rect(ctx, 5, 17 + walkOffset, 3, 4, app.pantsColor);
  rect(ctx, 5, 21 + walkOffset, 3, 2, pantsDark);

  // Belt
  rect(ctx, 4, 16 + bob, 6, 1, pantsDark);

  // Front arm
  rect(ctx, 3, 11 + bob + armSwing, 2, 5, app.shirtColor);
  rect(ctx, 3, 14 + bob + armSwing, 2, 2, app.skinTone);

  // Head
  rect(ctx, 3, 2 + bob, 9, 9, app.skinTone);
  rect(ctx, 3, 2 + bob, 1, 9, skinDark);

  // Eye (just one visible, looking left)
  rect(ctx, 4, 5 + bob, 2, 3, '#FFFFFF');
  px(ctx, 4, 6 + bob, app.eyeColor);
  px(ctx, 5, 6 + bob, app.eyeColor);
  px(ctx, 4, 5 + bob, '#FFFFFF');

  // Mouth
  px(ctx, 5, 9 + bob, '#D4756B');

  // Blush
  ctx.fillStyle = 'rgba(255, 160, 140, 0.35)';
  ctx.fillRect(3 * S, (7 + bob) * S, 2 * S, S);

  // Hair
  drawHairSide(ctx, bob, app.hairColor, hairDark, app.hairStyle, false);
}

function drawCharRight(ctx: CanvasRenderingContext2D, frame: number, app: CharacterAppearance) {
  const walkOffset = [0, 1, 0, -1][frame];
  const bob = (frame === 1 || frame === 3) ? -1 : 0;
  const armSwing = [0, -1, 0, 1][frame];

  const skinDark = darken(app.skinTone, 20);
  const shirtDark = darken(app.shirtColor, 25);
  const shirtLight = lighten(app.shirtColor, 20);
  const pantsDark = darken(app.pantsColor, 20);
  const hairDark = darken(app.hairColor, 30);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(8 * S, 23 * S, 5 * S, 1.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back leg
  rect(ctx, 6, 17 - walkOffset, 3, 4, pantsDark);
  rect(ctx, 6, 21 - walkOffset, 3, 2, darken(app.pantsColor, 30));

  // Back arm
  rect(ctx, 6, 11 + bob - armSwing, 2, 5, shirtDark);
  rect(ctx, 6, 14 + bob - armSwing, 2, 2, skinDark);

  // Body
  rect(ctx, 6, 11 + bob, 6, 6, app.shirtColor);
  rect(ctx, 11, 11 + bob, 1, 6, shirtLight);

  // Front leg
  rect(ctx, 8, 17 + walkOffset, 3, 4, app.pantsColor);
  rect(ctx, 8, 21 + walkOffset, 3, 2, pantsDark);

  // Belt
  rect(ctx, 6, 16 + bob, 6, 1, pantsDark);

  // Front arm
  rect(ctx, 11, 11 + bob + armSwing, 2, 5, app.shirtColor);
  rect(ctx, 11, 14 + bob + armSwing, 2, 2, app.skinTone);

  // Head
  rect(ctx, 4, 2 + bob, 9, 9, app.skinTone);

  // Eye
  rect(ctx, 10, 5 + bob, 2, 3, '#FFFFFF');
  px(ctx, 10, 6 + bob, app.eyeColor);
  px(ctx, 11, 6 + bob, app.eyeColor);
  px(ctx, 11, 5 + bob, '#FFFFFF');

  // Mouth
  px(ctx, 10, 9 + bob, '#D4756B');

  // Blush
  ctx.fillStyle = 'rgba(255, 160, 140, 0.35)';
  ctx.fillRect(11 * S, (7 + bob) * S, 2 * S, S);

  // Hair
  drawHairSide(ctx, bob, app.hairColor, hairDark, app.hairStyle, true);
}

// ---- Public API ----

const DIRS: Direction[] = ['down', 'left', 'right', 'up'];
const DRAW_FNS = [drawCharDown, drawCharLeft, drawCharRight, drawCharUp];

export function generateCharacterSpritesheet(appearance: CharacterAppearance): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 32 * 4;  // 4 frames
  canvas.height = 48 * 4; // 4 directions
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  for (let d = 0; d < 4; d++) {
    for (let f = 0; f < 4; f++) {
      ctx.save();
      ctx.translate(f * 32, d * 48);
      DRAW_FNS[d](ctx, f, appearance);
      ctx.restore();
    }
  }

  return canvas;
}

export function getDirectionRow(dir: Direction): number {
  return DIRS.indexOf(dir);
}

// ---- Preset Appearances ----

export const APPEARANCE_PRESETS: CharacterAppearance[] = [
  { skinTone: '#FDDCB5', hairColor: '#2C1810', hairStyle: 'short', shirtColor: '#4A90D9', pantsColor: '#34495E', eyeColor: '#2C1810' },
  { skinTone: '#F5C5A3', hairColor: '#8B4513', hairStyle: 'long', shirtColor: '#E74C3C', pantsColor: '#2C3E50', eyeColor: '#634E34' },
  { skinTone: '#E8B88A', hairColor: '#1A1A1A', hairStyle: 'ponytail', shirtColor: '#2ECC71', pantsColor: '#34495E', eyeColor: '#1A1A1A' },
  { skinTone: '#D4956B', hairColor: '#2C1810', hairStyle: 'bob', shirtColor: '#9B59B6', pantsColor: '#2C3E50', eyeColor: '#3D2314' },
  { skinTone: '#FDDCB5', hairColor: '#C0392B', hairStyle: 'spiky', shirtColor: '#F39C12', pantsColor: '#7F8C8D', eyeColor: '#27AE60' },
  { skinTone: '#F5C5A3', hairColor: '#1A1A1A', hairStyle: 'medium', shirtColor: '#1ABC9C', pantsColor: '#34495E', eyeColor: '#1A1A1A' },
  { skinTone: '#8D5524', hairColor: '#1A1A1A', hairStyle: 'short', shirtColor: '#E67E22', pantsColor: '#2C3E50', eyeColor: '#3D2314' },
  { skinTone: '#C68642', hairColor: '#2C1810', hairStyle: 'medium', shirtColor: '#3498DB', pantsColor: '#34495E', eyeColor: '#2C1810' },
];
