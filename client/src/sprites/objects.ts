// ============================================================
// Object Sprite Generator
// Trees, furniture, decorations — each drawn with personality.
// Objects can be larger than a single tile.
// ============================================================

import { ObjectType } from '@shared/types';

const S = 2; // pixel scale

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * S, y * S, S, S);
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * S, y * S, w * S, h * S);
}

interface SpriteSpec {
  width: number;   // in tiles
  height: number;  // in tiles
  draw: (ctx: CanvasRenderingContext2D) => void;
}

// ---- Tree (1x2 tiles = 32x64px, drawn on 16x32 pixel grid) ----

function drawTree(ctx: CanvasRenderingContext2D) {
  // Trunk
  rect(ctx, 6, 20, 4, 10, '#6B4226');
  rect(ctx, 6, 20, 1, 10, '#5A3620');
  rect(ctx, 9, 20, 1, 10, '#7A4E30');

  // Trunk roots
  rect(ctx, 5, 29, 2, 2, '#6B4226');
  rect(ctx, 9, 29, 2, 2, '#6B4226');

  // Canopy layers (lush, rounded)
  const green1 = '#3D8B37';
  const green2 = '#4CA845';
  const green3 = '#2D6B2A';
  const green4 = '#5BB85A';

  // Layer 1 (back, darkest)
  fillCirclePixels(ctx, 8, 14, 7, green3);
  // Layer 2
  fillCirclePixels(ctx, 6, 12, 5, green1);
  fillCirclePixels(ctx, 10, 12, 5, green1);
  // Layer 3 (front, lightest)
  fillCirclePixels(ctx, 8, 10, 6, green2);
  // Highlights
  fillCirclePixels(ctx, 6, 9, 3, green4);
  fillCirclePixels(ctx, 10, 8, 2, green4);

  // Shadow on ground
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.ellipse(8 * S, 31 * S, 6 * S, 2 * S, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTreePink(ctx: CanvasRenderingContext2D) {
  // Cherry blossom / Bauhinia tree
  // Trunk
  rect(ctx, 6, 20, 4, 10, '#7A5240');
  rect(ctx, 6, 20, 1, 10, '#6B4435');
  rect(ctx, 9, 20, 1, 10, '#8B6050');

  // Canopy — soft pinks and whites
  const pink1 = '#E8829A';
  const pink2 = '#F2A5B5';
  const pink3 = '#CC6B82';
  const pink4 = '#FFD0DC';

  fillCirclePixels(ctx, 8, 14, 7, pink3);
  fillCirclePixels(ctx, 6, 12, 5, pink1);
  fillCirclePixels(ctx, 10, 12, 5, pink1);
  fillCirclePixels(ctx, 8, 10, 6, pink2);
  fillCirclePixels(ctx, 6, 9, 3, pink4);
  fillCirclePixels(ctx, 10, 8, 2, pink4);

  // Scattered petals
  const petalColors = ['#FFB8C8', '#FF9AB0', '#FFD0DC'];
  px(ctx, 2, 22, petalColors[0]);
  px(ctx, 13, 18, petalColors[1]);
  px(ctx, 1, 26, petalColors[2]);
  px(ctx, 14, 25, petalColors[0]);
  px(ctx, 3, 16, petalColors[1]);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.ellipse(8 * S, 31 * S, 6 * S, 2 * S, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTreeSmall(ctx: CanvasRenderingContext2D) {
  // Smaller tree (fits in 1 tile)
  rect(ctx, 7, 12, 2, 4, '#6B4226');
  fillCirclePixels(ctx, 8, 9, 5, '#3D8B37');
  fillCirclePixels(ctx, 8, 8, 4, '#4CA845');
  fillCirclePixels(ctx, 7, 7, 2, '#5BB85A');
}

function drawBush(ctx: CanvasRenderingContext2D) {
  fillCirclePixels(ctx, 8, 11, 5, '#3D7A35');
  fillCirclePixels(ctx, 6, 10, 3, '#4A9040');
  fillCirclePixels(ctx, 10, 10, 3, '#4A9040');
  fillCirclePixels(ctx, 8, 9, 3, '#5AA04A');
}

function drawFlower(ctx: CanvasRenderingContext2D, color: string) {
  // Stem
  rect(ctx, 7, 10, 2, 6, '#4A8040');
  // Leaves
  rect(ctx, 5, 12, 2, 2, '#4A8040');
  rect(ctx, 9, 13, 2, 2, '#4A8040');
  // Petals
  rect(ctx, 7, 6, 2, 2, color);
  rect(ctx, 5, 8, 2, 2, color);
  rect(ctx, 9, 8, 2, 2, color);
  rect(ctx, 7, 10, 2, 2, color);
  // Center
  rect(ctx, 7, 8, 2, 2, '#FFE066');
}

function drawDesk(ctx: CanvasRenderingContext2D) {
  // Desktop surface
  rect(ctx, 1, 6, 14, 1, '#6B5240');
  rect(ctx, 1, 7, 14, 5, '#9B7B5A');
  rect(ctx, 1, 7, 14, 1, '#A8876B');

  // Legs
  rect(ctx, 2, 12, 1, 4, '#6B5240');
  rect(ctx, 13, 12, 1, 4, '#6B5240');

  // Items on desk — a book and pencil
  rect(ctx, 3, 5, 4, 2, '#4A90D9'); // book
  rect(ctx, 3, 5, 4, 1, '#3A7BC8');
  rect(ctx, 9, 5, 1, 3, '#FFD700'); // pencil
  px(ctx, 9, 4, '#FF8C00');
}

function drawChair(ctx: CanvasRenderingContext2D) {
  // Seat
  rect(ctx, 3, 9, 10, 3, '#C0392B');
  rect(ctx, 3, 9, 10, 1, '#D44B3E');
  // Backrest
  rect(ctx, 3, 4, 10, 5, '#C0392B');
  rect(ctx, 3, 4, 10, 1, '#D44B3E');
  rect(ctx, 3, 4, 1, 5, '#A83228');
  // Legs
  rect(ctx, 4, 12, 1, 3, '#5A3620');
  rect(ctx, 11, 12, 1, 3, '#5A3620');
}

function drawWhiteboard(ctx: CanvasRenderingContext2D) {
  // Frame
  rect(ctx, 0, 0, 16, 14, '#B0B0B0');
  // White surface
  rect(ctx, 1, 1, 14, 11, '#F5F5F5');
  // Some "writing" marks
  rect(ctx, 3, 3, 8, 1, '#4A90D9');
  rect(ctx, 3, 5, 10, 1, '#4A90D9');
  rect(ctx, 3, 7, 6, 1, '#E74C3C');
  rect(ctx, 3, 9, 9, 1, '#4A90D9');
  // Tray
  rect(ctx, 2, 12, 12, 2, '#888888');
  // Marker on tray
  rect(ctx, 5, 12, 3, 1, '#E74C3C');
}

function drawBookshelf(ctx: CanvasRenderingContext2D) {
  // Shelf frame
  rect(ctx, 0, 0, 16, 16, '#6B4226');
  rect(ctx, 1, 0, 14, 16, '#7A5030');

  // Shelf dividers
  rect(ctx, 0, 5, 16, 1, '#5A3620');
  rect(ctx, 0, 10, 16, 1, '#5A3620');

  // Books — colorful, varied heights. Each one a little world.
  const bookColors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#34495E'];
  let x = 1;
  for (let shelf = 0; shelf < 3; shelf++) {
    const shelfY = shelf * 5;
    x = 1;
    for (let i = 0; i < 6 && x < 14; i++) {
      const bw = 1 + (i % 2);
      const bh = 3 + (i % 2);
      const color = bookColors[(shelf * 6 + i) % bookColors.length];
      rect(ctx, x, shelfY + (5 - bh), bw, bh, color);
      // Spine highlight
      if (bw > 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x * S, (shelfY + (5 - bh)) * S, S, bh * S);
      }
      x += bw + (i % 3 === 0 ? 1 : 0);
    }
  }
}

function drawLantern(ctx: CanvasRenderingContext2D) {
  // Pole
  rect(ctx, 7, 0, 2, 16, '#5A5A5A');
  rect(ctx, 7, 0, 1, 16, '#4A4A4A');

  // Lantern body — warm red and gold
  rect(ctx, 4, 2, 8, 6, '#D4443B');
  rect(ctx, 5, 1, 6, 1, '#B8963E');
  rect(ctx, 5, 8, 6, 1, '#B8963E');
  // Gold trim
  rect(ctx, 4, 2, 8, 1, '#D4A843');
  rect(ctx, 4, 7, 8, 1, '#D4A843');
  // Character on lantern (simplified 學)
  rect(ctx, 6, 3, 1, 1, '#FFE066');
  rect(ctx, 7, 4, 2, 1, '#FFE066');
  rect(ctx, 6, 5, 4, 1, '#FFE066');
  rect(ctx, 7, 6, 2, 1, '#FFE066');
  // Tassel
  rect(ctx, 7, 9, 2, 2, '#D4443B');
  rect(ctx, 7, 11, 1, 1, '#B83530');

  // Warm glow
  ctx.fillStyle = 'rgba(255, 200, 80, 0.12)';
  ctx.beginPath();
  ctx.ellipse(8 * S, 5 * S, 8 * S, 6 * S, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBench(ctx: CanvasRenderingContext2D) {
  // Seat planks
  rect(ctx, 1, 8, 14, 2, '#8B6B4A');
  rect(ctx, 1, 8, 14, 1, '#9B7B5A');
  // Back rest
  rect(ctx, 1, 4, 14, 2, '#8B6B4A');
  rect(ctx, 1, 4, 14, 1, '#9B7B5A');
  // Legs
  rect(ctx, 2, 10, 2, 5, '#5A4030');
  rect(ctx, 12, 10, 2, 5, '#5A4030');
  // Supports
  rect(ctx, 2, 6, 2, 2, '#5A4030');
  rect(ctx, 12, 6, 2, 2, '#5A4030');
}

function drawFountain(ctx: CanvasRenderingContext2D) {
  // Base pool
  ctx.fillStyle = 'rgba(59, 142, 191, 0.4)';
  ctx.beginPath();
  ctx.ellipse(8 * S, 12 * S, 7 * S, 3 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone base
  ctx.fillStyle = '#A0937D';
  ctx.beginPath();
  ctx.ellipse(8 * S, 12 * S, 7 * S, 3 * S, 0, 0, Math.PI * 2);
  ctx.stroke();
  rect(ctx, 6, 8, 4, 5, '#A0937D');
  rect(ctx, 7, 5, 2, 4, '#B0A390');

  // Water spout
  rect(ctx, 7, 4, 2, 1, '#8899AA');

  // Water spray (sparkle pixels)
  const waterBlue = '#7BC4E8';
  px(ctx, 5, 4, waterBlue);
  px(ctx, 10, 5, waterBlue);
  px(ctx, 4, 6, waterBlue);
  px(ctx, 11, 4, waterBlue);
  px(ctx, 8, 2, waterBlue);
  px(ctx, 7, 3, waterBlue);
  px(ctx, 9, 3, waterBlue);

  // Water shimmer
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(4 * S, 11 * S, 3 * S, S);
  ctx.fillRect(9 * S, 12 * S, 4 * S, S);
}

function drawTableRound(ctx: CanvasRenderingContext2D) {
  // Table top (circle)
  ctx.fillStyle = '#9B7B5A';
  ctx.beginPath();
  ctx.ellipse(8 * S, 7 * S, 6 * S, 4 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.ellipse(7 * S, 6 * S, 3 * S, 2 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  // Leg
  rect(ctx, 7, 10, 2, 5, '#6B5240');
  // Base
  rect(ctx, 5, 14, 6, 1, '#6B5240');
}

function drawComputer(ctx: CanvasRenderingContext2D) {
  // Monitor
  rect(ctx, 2, 1, 12, 8, '#333333');
  rect(ctx, 3, 2, 10, 6, '#4A6B8A');
  // Screen content (code-like)
  rect(ctx, 4, 3, 4, 1, '#5BE8A0');
  rect(ctx, 4, 4, 6, 1, '#FFFFFF');
  rect(ctx, 4, 5, 3, 1, '#FFB347');
  rect(ctx, 4, 6, 7, 1, '#FFFFFF');
  // Stand
  rect(ctx, 7, 9, 2, 2, '#444444');
  rect(ctx, 5, 11, 6, 1, '#444444');
  // Keyboard
  rect(ctx, 3, 13, 10, 2, '#555555');
  rect(ctx, 4, 13, 8, 1, '#666666');
}

function drawPlant(ctx: CanvasRenderingContext2D) {
  // Pot
  rect(ctx, 4, 10, 8, 5, '#C0785A');
  rect(ctx, 5, 9, 6, 1, '#C0785A');
  rect(ctx, 4, 10, 8, 1, '#D08A6A');
  // Soil
  rect(ctx, 5, 10, 6, 1, '#5A4030');
  // Leaves
  const green = '#4CA845';
  const greenDark = '#3D8B37';
  fillCirclePixels(ctx, 8, 7, 4, greenDark);
  fillCirclePixels(ctx, 6, 6, 3, green);
  fillCirclePixels(ctx, 10, 6, 3, green);
  fillCirclePixels(ctx, 8, 5, 3, '#5BB85A');
}

function drawPodium(ctx: CanvasRenderingContext2D) {
  // Main body
  rect(ctx, 3, 3, 10, 12, '#7A5C3E');
  rect(ctx, 3, 3, 10, 1, '#8B6B4A');
  rect(ctx, 3, 3, 1, 12, '#6B4E32');
  // Top surface
  rect(ctx, 2, 2, 12, 2, '#8B6B4A');
  // Microphone
  rect(ctx, 7, 0, 1, 3, '#555555');
  fillCirclePixels(ctx, 7, 0, 1, '#333333');
  // Emblem (star)
  px(ctx, 8, 8, '#D4A843');
  px(ctx, 7, 9, '#D4A843');
  px(ctx, 9, 9, '#D4A843');
  px(ctx, 8, 10, '#D4A843');
}

function drawSign(ctx: CanvasRenderingContext2D) {
  // Post
  rect(ctx, 7, 6, 2, 10, '#6B5240');
  // Sign board
  rect(ctx, 1, 1, 14, 6, '#F5E6C8');
  rect(ctx, 1, 1, 14, 1, '#D4A843');
  rect(ctx, 1, 6, 14, 1, '#D4A843');
  // Text lines
  rect(ctx, 3, 2, 8, 1, '#5A4030');
  rect(ctx, 3, 4, 10, 1, '#5A4030');
}

function drawLamp(ctx: CanvasRenderingContext2D) {
  // Pole
  rect(ctx, 7, 4, 2, 12, '#6B6B6B');
  // Lamp head
  rect(ctx, 4, 1, 8, 4, '#F5E6C8');
  rect(ctx, 4, 1, 8, 1, '#E0D0B0');
  // Light glow
  ctx.fillStyle = 'rgba(255, 230, 150, 0.15)';
  ctx.beginPath();
  ctx.ellipse(8 * S, 5 * S, 6 * S, 4 * S, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBauhinia(ctx: CanvasRenderingContext2D) {
  // Hong Kong's beautiful Bauhinia blakeana
  // Stem
  rect(ctx, 7, 10, 2, 6, '#4A8040');
  rect(ctx, 5, 12, 2, 2, '#4A8040');
  rect(ctx, 9, 13, 2, 2, '#4A8040');

  // Five petals arranged in a star
  const petalColor = '#C24B6E';
  const petalLight = '#D4697F';
  const angles = [0, 72, 144, 216, 288];

  for (const angle of angles) {
    const rad = (angle - 90) * (Math.PI / 180);
    const cx = 8 + Math.cos(rad) * 3;
    const cy = 6 + Math.sin(rad) * 3;
    fillCirclePixels(ctx, Math.round(cx), Math.round(cy), 2, petalColor);
    // Highlight on petal
    px(ctx, Math.round(cx), Math.round(cy) - 1, petalLight);
  }
  // Center
  px(ctx, 8, 6, '#FFE066');
  px(ctx, 7, 6, '#FFD700');
}

function drawStoneWall(ctx: CanvasRenderingContext2D) {
  rect(ctx, 0, 0, 16, 16, '#7A8A7A');
  // Stone pattern
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, 7 * S, 4 * S);
  ctx.strokeRect(8 * S, 1, 7 * S, 4 * S);
  ctx.strokeRect(1, 4 * S + 1, 5 * S, 4 * S);
  ctx.strokeRect(6 * S, 4 * S + 1, 9 * S, 4 * S);
}

function drawWindow(ctx: CanvasRenderingContext2D) {
  // Frame
  rect(ctx, 1, 1, 14, 12, '#6B5240');
  // Glass
  rect(ctx, 2, 2, 12, 10, '#8BBEE8');
  // Cross frame
  rect(ctx, 7, 2, 2, 10, '#6B5240');
  rect(ctx, 2, 6, 12, 2, '#6B5240');
  // Sky reflection
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(3 * S, 3 * S, 3 * S, 2 * S);
}

function drawDoorFrame(ctx: CanvasRenderingContext2D) {
  rect(ctx, 2, 0, 12, 16, '#6B4226');
  rect(ctx, 3, 1, 10, 15, '#8B6B4A');
  // Door handle
  rect(ctx, 10, 8, 2, 2, '#D4A843');
  // Top arch detail
  rect(ctx, 2, 0, 12, 2, '#5A3620');
}

// ---- Helper: Filled Circle with Pixels ----

function fillCirclePixels(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) {
        ctx.fillRect((cx + x) * S, (cy + y) * S, S, S);
      }
    }
  }
}

// ---- Object Sprite Registry ----

const SPECS: Partial<Record<ObjectType, SpriteSpec>> = {
  [ObjectType.Tree]: { width: 1, height: 2, draw: drawTree },
  [ObjectType.TreePink]: { width: 1, height: 2, draw: drawTreePink },
  [ObjectType.TreeSmall]: { width: 1, height: 1, draw: drawTreeSmall },
  [ObjectType.Bush]: { width: 1, height: 1, draw: drawBush },
  [ObjectType.FlowerRed]: { width: 1, height: 1, draw: (ctx) => drawFlower(ctx, '#E74C3C') },
  [ObjectType.FlowerYellow]: { width: 1, height: 1, draw: (ctx) => drawFlower(ctx, '#F1C40F') },
  [ObjectType.Desk]: { width: 1, height: 1, draw: drawDesk },
  [ObjectType.Chair]: { width: 1, height: 1, draw: drawChair },
  [ObjectType.ChairLeft]: { width: 1, height: 1, draw: drawChair }, // same sprite, placement differs
  [ObjectType.ChairRight]: { width: 1, height: 1, draw: drawChair },
  [ObjectType.Whiteboard]: { width: 1, height: 1, draw: drawWhiteboard },
  [ObjectType.Bookshelf]: { width: 1, height: 1, draw: drawBookshelf },
  [ObjectType.Lantern]: { width: 1, height: 1, draw: drawLantern },
  [ObjectType.Bench]: { width: 1, height: 1, draw: drawBench },
  [ObjectType.Fountain]: { width: 1, height: 1, draw: drawFountain },
  [ObjectType.TableRound]: { width: 1, height: 1, draw: drawTableRound },
  [ObjectType.Computer]: { width: 1, height: 1, draw: drawComputer },
  [ObjectType.Plant]: { width: 1, height: 1, draw: drawPlant },
  [ObjectType.Podium]: { width: 1, height: 1, draw: drawPodium },
  [ObjectType.Sign]: { width: 1, height: 1, draw: drawSign },
  [ObjectType.Lamp]: { width: 1, height: 1, draw: drawLamp },
  [ObjectType.StoneWall]: { width: 1, height: 1, draw: drawStoneWall },
  [ObjectType.Window]: { width: 1, height: 1, draw: drawWindow },
  [ObjectType.DoorFrame]: { width: 1, height: 1, draw: drawDoorFrame },
  [ObjectType.Bauhinia]: { width: 1, height: 1, draw: drawBauhinia },
};

export interface ObjectSprite {
  canvas: HTMLCanvasElement;
  widthTiles: number;
  heightTiles: number;
}

export function generateObjectSprites(): Map<ObjectType, ObjectSprite> {
  const sprites = new Map<ObjectType, ObjectSprite>();

  for (const [typeStr, spec] of Object.entries(SPECS)) {
    const type = Number(typeStr) as ObjectType;
    if (!spec) continue;

    const canvas = document.createElement('canvas');
    canvas.width = spec.width * 32;
    canvas.height = spec.height * 32;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    spec.draw(ctx);

    sprites.set(type, {
      canvas,
      widthTiles: spec.width,
      heightTiles: spec.height,
    });
  }

  return sprites;
}
