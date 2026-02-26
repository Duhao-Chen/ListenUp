// ============================================================
// Tile Sprite Generator
// Rich, textured tiles that make the world feel alive.
// Each tile is 32x32px, generated programmatically with
// dithering, texture, and warmth.
// ============================================================

import { TileType } from '@shared/types';

const TILE_SIZE = 32;

// Seeded random for deterministic tile patterns
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  baseColor: string,
  variance: number,
  seed: number
) {
  const [r, g, b] = hexToRgb(baseColor);
  const rng = seededRandom(seed);

  for (let y = 0; y < TILE_SIZE; y += 2) {
    for (let x = 0; x < TILE_SIZE; x += 2) {
      const v = (rng() - 0.5) * variance;
      ctx.fillStyle = `rgb(${r + v},${g + v},${b + v})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

// ---- Individual Tile Generators ----

function drawGrass(ctx: CanvasRenderingContext2D, variant: number) {
  drawNoise(ctx, '#5B8C3E', 20, 100 + variant);

  // Occasional lighter tufts
  const rng = seededRandom(200 + variant);
  for (let i = 0; i < 3; i++) {
    const x = Math.floor(rng() * 14) * 2;
    const y = Math.floor(rng() * 14) * 2;
    ctx.fillStyle = variant % 3 === 0 ? '#6EA84D' : '#4D7A33';
    ctx.fillRect(x, y, 2, 4);
  }
}

function drawGrassLight(ctx: CanvasRenderingContext2D) {
  drawNoise(ctx, '#6EA84D', 18, 150);
  const rng = seededRandom(250);
  for (let i = 0; i < 2; i++) {
    const x = Math.floor(rng() * 14) * 2;
    const y = Math.floor(rng() * 14) * 2;
    ctx.fillStyle = '#7DB85A';
    ctx.fillRect(x, y, 2, 4);
  }
}

function drawGrassDark(ctx: CanvasRenderingContext2D) {
  drawNoise(ctx, '#4D7A33', 15, 300);
}

function drawGrassFlower(ctx: CanvasRenderingContext2D, variant: number) {
  drawGrass(ctx, variant + 50);

  // Tiny flowers — delicate and charming
  const rng = seededRandom(400 + variant);
  const flowerColors = ['#FF6B8A', '#FFD93D', '#FF8E53', '#C77DFF', '#FFFFFF'];

  for (let i = 0; i < 2; i++) {
    const fx = Math.floor(rng() * 13) * 2 + 2;
    const fy = Math.floor(rng() * 13) * 2 + 2;
    const color = flowerColors[Math.floor(rng() * flowerColors.length)];

    // Petals (cross pattern)
    ctx.fillStyle = color;
    ctx.fillRect(fx, fy - 2, 2, 2);
    ctx.fillRect(fx, fy + 2, 2, 2);
    ctx.fillRect(fx - 2, fy, 2, 2);
    ctx.fillRect(fx + 2, fy, 2, 2);
    // Center
    ctx.fillStyle = '#FFE066';
    ctx.fillRect(fx, fy, 2, 2);
  }
}

function drawStonePath(ctx: CanvasRenderingContext2D, variant: number) {
  // Base
  drawNoise(ctx, '#A0937D', 12, 500 + variant);

  // Stone outlines — irregular, natural shapes
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;

  const rng = seededRandom(600 + variant);
  // Large stones
  ctx.beginPath();
  ctx.roundRect(2, 2, 14, 12, 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(18, 1, 12, 13, 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(1, 16, 12, 14, 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(15, 17, 15, 13, 3);
  ctx.stroke();

  // Subtle highlights on stones
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(4, 4, 8, 4);
  ctx.fillRect(20, 3, 6, 4);
  ctx.fillRect(3, 18, 6, 4);
  ctx.fillRect(17, 19, 8, 4);
}

function drawStonePathLight(ctx: CanvasRenderingContext2D) {
  drawStonePath(ctx, 50);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
}

function drawWoodFloor(ctx: CanvasRenderingContext2D, variant: number) {
  drawNoise(ctx, '#9B7653', 10, 700 + variant);

  // Wood grain lines
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  for (let y = 0; y < TILE_SIZE; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(TILE_SIZE, y + 0.5);
    ctx.stroke();
  }

  // Subtle grain variation
  const rng = seededRandom(800 + variant);
  ctx.strokeStyle = 'rgba(139, 105, 63, 0.2)';
  for (let i = 0; i < 4; i++) {
    const y = Math.floor(rng() * TILE_SIZE);
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(TILE_SIZE, y + 0.5);
    ctx.stroke();
  }
}

function drawWoodFloorDark(ctx: CanvasRenderingContext2D) {
  drawNoise(ctx, '#7A5C3E', 10, 750);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  for (let y = 0; y < TILE_SIZE; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(TILE_SIZE, y + 0.5);
    ctx.stroke();
  }
}

function drawTileFloor(ctx: CanvasRenderingContext2D) {
  // Clean classroom tiles
  drawNoise(ctx, '#D5CFC5', 8, 850);

  // Tile grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

  // Subtle inner highlight
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
}

function drawWater(ctx: CanvasRenderingContext2D, variant: number) {
  drawNoise(ctx, '#3B8EBF', 15, 900 + variant);

  // Animated wave highlights (variant creates animation frames)
  const phase = (variant % 4) * 8;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let x = 0; x < TILE_SIZE; x += 10) {
    const y = 8 + Math.sin((x + phase) * 0.3) * 4;
    ctx.fillRect(x, y, 6, 2);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let x = 5; x < TILE_SIZE; x += 12) {
    const y = 20 + Math.sin((x + phase) * 0.25) * 3;
    ctx.fillRect(x, y, 4, 2);
  }
}

function drawWaterEdge(ctx: CanvasRenderingContext2D) {
  // Half grass, half water
  drawNoise(ctx, '#5B8C3E', 20, 950);
  // Water portion (bottom half)
  const waterCtx = ctx;
  waterCtx.fillStyle = '#3B8EBF';
  waterCtx.beginPath();
  waterCtx.moveTo(0, 16);
  waterCtx.bezierCurveTo(8, 14, 16, 18, 24, 14);
  waterCtx.lineTo(32, 14);
  waterCtx.lineTo(32, 32);
  waterCtx.lineTo(0, 32);
  waterCtx.closePath();
  waterCtx.fill();

  // Water texture
  waterCtx.fillStyle = 'rgba(255,255,255,0.1)';
  waterCtx.fillRect(4, 22, 8, 2);
  waterCtx.fillRect(18, 24, 6, 2);
}

function drawWallTop(ctx: CanvasRenderingContext2D) {
  drawNoise(ctx, '#6B7B8D', 8, 1000);
  // Dark edge at bottom
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, TILE_SIZE - 4, TILE_SIZE, 4);
}

function drawWallFront(ctx: CanvasRenderingContext2D) {
  drawNoise(ctx, '#8899AA', 10, 1050);

  // Brick pattern
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (let y = 0; y < TILE_SIZE; y += 8) {
    const offset = (y / 8) % 2 === 0 ? 0 : 8;
    for (let x = offset; x < TILE_SIZE; x += 16) {
      ctx.strokeRect(x + 0.5, y + 0.5, 15, 7);
    }
  }

  // Top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 0, TILE_SIZE, 2);
}

function drawCarpet(ctx: CanvasRenderingContext2D, isRed: boolean) {
  const base = isRed ? '#A0524C' : '#4A6B82';
  drawNoise(ctx, base, 8, isRed ? 1100 : 1150);

  // Carpet texture — subtle cross-hatch
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i < TILE_SIZE; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 2, TILE_SIZE);
    ctx.stroke();
  }
}

function drawSand(ctx: CanvasRenderingContext2D) {
  drawNoise(ctx, '#DBC49E', 12, 1200);
}

function drawBridge(ctx: CanvasRenderingContext2D) {
  drawNoise(ctx, '#8B7355', 8, 1250);
  // Planks
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  for (let x = 0; x < TILE_SIZE; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, TILE_SIZE);
    ctx.stroke();
  }
  // Railings
  ctx.fillStyle = 'rgba(90, 65, 40, 0.6)';
  ctx.fillRect(0, 0, TILE_SIZE, 3);
  ctx.fillRect(0, TILE_SIZE - 3, TILE_SIZE, 3);
}

// ---- Generate All Tile Sprites ----

export function generateTileSpritesheet(): Map<TileType, HTMLCanvasElement[]> {
  const tiles = new Map<TileType, HTMLCanvasElement[]>();

  function gen(type: TileType, draw: (ctx: CanvasRenderingContext2D, variant: number) => void, variants: number = 1) {
    const canvases: HTMLCanvasElement[] = [];
    for (let v = 0; v < variants; v++) {
      const canvas = document.createElement('canvas');
      canvas.width = TILE_SIZE;
      canvas.height = TILE_SIZE;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      draw(ctx, v);
      canvases.push(canvas);
    }
    tiles.set(type, canvases);
  }

  gen(TileType.Grass, drawGrass, 4);
  gen(TileType.GrassLight, (ctx) => drawGrassLight(ctx));
  gen(TileType.GrassDark, (ctx) => drawGrassDark(ctx));
  gen(TileType.GrassFlower, drawGrassFlower, 3);
  gen(TileType.StonePath, drawStonePath, 2);
  gen(TileType.StonePathLight, (ctx) => drawStonePathLight(ctx));
  gen(TileType.WoodFloor, drawWoodFloor, 2);
  gen(TileType.WoodFloorDark, (ctx) => drawWoodFloorDark(ctx));
  gen(TileType.TileFloor, (ctx) => drawTileFloor(ctx));
  gen(TileType.Water, drawWater, 4);
  gen(TileType.WaterEdge, (ctx) => drawWaterEdge(ctx));
  gen(TileType.WallTop, (ctx) => drawWallTop(ctx));
  gen(TileType.WallFront, (ctx) => drawWallFront(ctx));
  gen(TileType.Carpet, (ctx) => drawCarpet(ctx, false));
  gen(TileType.CarpetRed, (ctx) => drawCarpet(ctx, true));
  gen(TileType.Sand, (ctx) => drawSand(ctx));
  gen(TileType.Bridge, (ctx) => drawBridge(ctx));
  gen(TileType.Empty, (ctx) => { ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 32, 32); });

  return tiles;
}
