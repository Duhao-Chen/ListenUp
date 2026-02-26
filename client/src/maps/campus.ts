// ============================================================
// Hong Kong Learning Campus Map
// A warm, inviting virtual space for learners to gather.
//
// Layout (50x40 tiles):
//   Top: Garden courtyard with cherry blossoms & pond
//   Middle: Main building with classrooms & library
//   Bottom: Open courtyard with café and gathering spaces
// ============================================================

import { TileType as T, ObjectType as O, GameMap, MapZone } from '@shared/types';

const W = 50; // map width in tiles
const H = 40; // map height in tiles

function createGrid<V>(w: number, h: number, fill: V): V[][] {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function fillRect<V>(grid: V[][], x: number, y: number, w: number, h: number, val: V) {
  for (let row = y; row < Math.min(y + h, grid.length); row++) {
    for (let col = x; col < Math.min(x + w, grid[0].length); col++) {
      grid[row][col] = val;
    }
  }
}

function fillBorder<V>(grid: V[][], x: number, y: number, w: number, h: number, val: V) {
  for (let col = x; col < x + w; col++) {
    grid[y][col] = val;
    grid[y + h - 1][col] = val;
  }
  for (let row = y; row < y + h; row++) {
    grid[row][x] = val;
    grid[row][x + w - 1] = val;
  }
}

export function generateCampusMap(): GameMap {
  const ground = createGrid(W, H, T.Grass);
  const objects = createGrid(W, H, O.None);
  const collision = createGrid(W, H, false);
  const overhead = createGrid(W, H, O.None);

  // ============================================================
  // GROUND LAYER — The earth beneath our feet
  // ============================================================

  // Border — dark grass edges
  fillBorder(ground, 0, 0, W, H, T.GrassDark);

  // Scatter some flower grass
  const flowerPositions = [
    [3, 3], [7, 2], [12, 4], [38, 3], [43, 2], [46, 5],
    [3, 35], [8, 37], [42, 36], [46, 38],
    [15, 8], [35, 8], [20, 5], [30, 5],
  ];
  for (const [fx, fy] of flowerPositions) {
    if (fx < W && fy < H) ground[fy][fx] = T.GrassFlower;
  }

  // Light grass patches (sun-dappled areas)
  const lightPatches = [
    [5, 5, 3, 3], [42, 4, 3, 3], [24, 2, 4, 3],
    [5, 33, 4, 3], [40, 34, 4, 3],
  ];
  for (const [px, py, pw, ph] of lightPatches) {
    fillRect(ground, px, py, pw, ph, T.GrassLight);
  }

  // === Main Stone Paths ===

  // Vertical main path (campus spine)
  fillRect(ground, 23, 0, 4, H, T.StonePath);
  // Lighter center line
  fillRect(ground, 24, 0, 2, H, T.StonePathLight);

  // Horizontal path connecting buildings (middle)
  fillRect(ground, 0, 18, W, 3, T.StonePath);
  fillRect(ground, 0, 19, W, 1, T.StonePathLight);

  // Path to left classroom
  fillRect(ground, 5, 15, 3, 3, T.StonePath);
  // Path to right classroom
  fillRect(ground, 35, 15, 3, 3, T.StonePath);

  // Garden paths (top area, curved feel via segments)
  fillRect(ground, 10, 8, 13, 2, T.StonePath);
  fillRect(ground, 27, 8, 13, 2, T.StonePath);
  fillRect(ground, 10, 8, 2, 5, T.StonePath);
  fillRect(ground, 38, 8, 2, 5, T.StonePath);

  // === Pond (top center) ===
  fillRect(ground, 20, 3, 10, 5, T.Water);
  fillRect(ground, 21, 2, 8, 1, T.WaterEdge);
  fillRect(ground, 21, 8, 8, 1, T.WaterEdge);
  // Sand around pond
  fillRect(ground, 19, 2, 1, 7, T.Sand);
  fillRect(ground, 30, 2, 1, 7, T.Sand);

  // Bridge over pond
  fillRect(ground, 23, 3, 4, 5, T.Bridge);

  // === Main Building: Left Classroom ===
  fillRect(ground, 2, 14, 18, 12, T.WoodFloor);
  // Walls
  fillBorder(ground, 2, 14, 18, 12, T.WallFront);
  fillRect(ground, 2, 14, 18, 1, T.WallTop);
  // Door opening
  fillRect(ground, 8, 25, 3, 1, T.WoodFloor);
  // Carpet area in front
  fillRect(ground, 5, 16, 12, 2, T.Carpet);

  // === Main Building: Right Classroom ===
  fillRect(ground, 30, 14, 18, 12, T.WoodFloor);
  fillBorder(ground, 30, 14, 18, 12, T.WallFront);
  fillRect(ground, 30, 14, 18, 1, T.WallTop);
  // Door opening
  fillRect(ground, 38, 25, 3, 1, T.WoodFloor);
  // Red carpet (different feel)
  fillRect(ground, 33, 16, 12, 2, T.CarpetRed);

  // === Library (center, below path) ===
  fillRect(ground, 18, 22, 14, 10, T.WoodFloorDark);
  fillBorder(ground, 18, 22, 14, 10, T.WallFront);
  fillRect(ground, 18, 22, 14, 1, T.WallTop);
  // Door
  fillRect(ground, 23, 22, 4, 1, T.WoodFloorDark);
  // Reading carpet
  fillRect(ground, 21, 25, 8, 4, T.CarpetRed);

  // === Café Area (bottom right) ===
  fillRect(ground, 33, 33, 12, 6, T.TileFloor);
  fillBorder(ground, 33, 33, 12, 6, T.WallFront);
  fillRect(ground, 37, 33, 4, 1, T.TileFloor); // Door

  // === Bottom Courtyard ===
  fillRect(ground, 8, 33, 14, 6, T.StonePath);

  // ============================================================
  // OBJECTS LAYER — The details that make a world
  // ============================================================

  // === Trees (border) ===
  const treeBorderPositions = [
    // Top edge
    [1, 1], [4, 0], [8, 1], [14, 0], [17, 1],
    [33, 0], [36, 1], [41, 0], [44, 1], [48, 1],
    // Bottom edge
    [1, 38], [4, 39], [28, 38], [47, 38],
    // Left edge
    [0, 6], [0, 12], [0, 28], [0, 34],
    // Right edge
    [49, 6], [49, 12], [49, 28], [49, 34],
  ];
  for (const [tx, ty] of treeBorderPositions) {
    if (tx < W && ty < H) {
      objects[ty][tx] = O.Tree;
      collision[ty][tx] = true;
    }
  }

  // === Cherry Blossom Trees (garden area) ===
  const pinkTreePositions = [
    [6, 4], [13, 3], [16, 6],
    [34, 4], [37, 3], [42, 6],
    [12, 10], [38, 10],
  ];
  for (const [tx, ty] of pinkTreePositions) {
    objects[ty][tx] = O.TreePink;
    collision[ty][tx] = true;
  }

  // === Bushes ===
  const bushPositions = [
    [2, 8], [3, 9], [46, 8], [47, 9],
    [2, 26], [17, 26], [30, 26], [47, 26],
    [6, 32], [22, 32], [44, 32],
  ];
  for (const [bx, by] of bushPositions) {
    if (bx < W && by < H) {
      objects[by][bx] = O.Bush;
      collision[by][bx] = true;
    }
  }

  // === Flowers ===
  const redFlowers = [[4, 6], [8, 5], [43, 5], [45, 7]];
  const yellowFlowers = [[6, 7], [10, 6], [40, 6], [44, 8]];
  for (const [fx, fy] of redFlowers) {
    if (fx < W && fy < H) objects[fy][fx] = O.FlowerRed;
  }
  for (const [fx, fy] of yellowFlowers) {
    if (fx < W && fy < H) objects[fy][fx] = O.FlowerYellow;
  }

  // === Bauhinia Flowers (Hong Kong's emblem) ===
  const bauhiniaPositions = [[11, 5], [39, 5], [25, 35], [15, 35]];
  for (const [bx, by] of bauhiniaPositions) {
    if (bx < W && by < H) objects[by][bx] = O.Bauhinia;
  }

  // === Benches (garden) ===
  const benchPositions = [[8, 10], [14, 10], [36, 10], [42, 10], [10, 35], [20, 35]];
  for (const [bx, by] of benchPositions) {
    if (bx < W && by < H) {
      objects[by][bx] = O.Bench;
      collision[by][bx] = true;
    }
  }

  // === Pond decorations ===
  objects[5][19] = O.FlowerYellow;
  objects[5][30] = O.FlowerRed;

  // === Fountain (bottom courtyard center) ===
  objects[35][14] = O.Fountain;
  collision[35][14] = true;

  // === Lanterns along paths ===
  const lanternPositions = [
    [22, 10], [27, 10], // Garden path
    [22, 18], [27, 18], // Middle path
    [22, 30], [27, 30], // Near library
    [10, 18], [40, 18], // Side paths
  ];
  for (const [lx, ly] of lanternPositions) {
    if (lx < W && ly < H) {
      objects[ly][lx] = O.Lantern;
      collision[ly][lx] = true;
    }
  }

  // === Signs ===
  objects[12][24] = O.Sign; // Main entrance sign
  collision[12][24] = true;
  objects[33][37] = O.Sign; // Café sign
  collision[33][37] = true;

  // === Left Classroom Furniture ===
  // Whiteboard at front
  objects[15][10] = O.Whiteboard;
  collision[15][10] = true;
  // Teacher podium
  objects[16][10] = O.Podium;
  collision[16][10] = true;
  // Student desks (3 rows of 4)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const dx = 4 + col * 4;
      const dy = 19 + row * 2;
      if (dx < 18 && dy < 25) {
        objects[dy][dx] = O.Desk;
        collision[dy][dx] = true;
        // Chair behind each desk
        if (dy + 1 < 25) {
          objects[dy + 1][dx] = O.Chair;
        }
      }
    }
  }
  // Plants in corners
  objects[15][3] = O.Plant;
  objects[15][18] = O.Plant;

  // === Right Classroom Furniture ===
  objects[15][39] = O.Whiteboard;
  collision[15][39] = true;
  objects[16][39] = O.Podium;
  collision[16][39] = true;
  // Computers instead of desks (computer lab)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const dx = 32 + col * 4;
      const dy = 19 + row * 2;
      if (dx < 46 && dy < 25) {
        objects[dy][dx] = O.Computer;
        collision[dy][dx] = true;
        if (dy + 1 < 25) {
          objects[dy + 1][dx] = O.Chair;
        }
      }
    }
  }
  objects[15][31] = O.Plant;
  objects[15][46] = O.Plant;

  // === Library Furniture ===
  // Bookshelves along walls
  for (let bx = 19; bx <= 30; bx += 2) {
    objects[23][bx] = O.Bookshelf;
    collision[23][bx] = true;
  }
  objects[24][19] = O.Bookshelf;
  collision[24][19] = true;
  objects[26][19] = O.Bookshelf;
  collision[26][19] = true;
  objects[24][30] = O.Bookshelf;
  collision[24][30] = true;
  objects[26][30] = O.Bookshelf;
  collision[26][30] = true;
  // Reading tables
  objects[27][23] = O.TableRound;
  collision[27][23] = true;
  objects[27][27] = O.TableRound;
  collision[27][27] = true;
  // Comfy lamp
  objects[28][19] = O.Lamp;
  objects[28][30] = O.Lamp;

  // === Café Furniture ===
  objects[35][35] = O.TableRound;
  collision[35][35] = true;
  objects[35][39] = O.TableRound;
  collision[35][39] = true;
  objects[37][37] = O.TableRound;
  collision[37][37] = true;
  objects[35][43] = O.Plant;
  objects[37][43] = O.Plant;

  // === Windows on buildings ===
  objects[14][5] = O.Window;
  objects[14][12] = O.Window;
  objects[14][16] = O.Window;
  objects[14][33] = O.Window;
  objects[14][40] = O.Window;
  objects[14][44] = O.Window;
  objects[22][20] = O.Window;
  objects[22][28] = O.Window;

  // === Collision for walls ===
  // Left classroom walls
  for (let x = 2; x < 20; x++) {
    collision[14][x] = true;
    collision[25][x] = true;
  }
  for (let y = 14; y < 26; y++) {
    collision[y][2] = true;
    collision[y][19] = true;
  }
  // Door openings
  collision[25][8] = false;
  collision[25][9] = false;
  collision[25][10] = false;

  // Right classroom walls
  for (let x = 30; x < 48; x++) {
    collision[14][x] = true;
    collision[25][x] = true;
  }
  for (let y = 14; y < 26; y++) {
    collision[y][30] = true;
    collision[y][47] = true;
  }
  collision[25][38] = false;
  collision[25][39] = false;
  collision[25][40] = false;

  // Library walls
  for (let x = 18; x < 32; x++) {
    collision[22][x] = true;
    collision[31][x] = true;
  }
  for (let y = 22; y < 32; y++) {
    collision[y][18] = true;
    collision[y][31] = true;
  }
  // Library door
  collision[22][23] = false;
  collision[22][24] = false;
  collision[22][25] = false;
  collision[22][26] = false;

  // Café walls
  for (let x = 33; x < 45; x++) {
    collision[33][x] = true;
    collision[38][x] = true;
  }
  for (let y = 33; y < 39; y++) {
    collision[y][33] = true;
    collision[y][44] = true;
  }
  collision[33][37] = false;
  collision[33][38] = false;
  collision[33][39] = false;
  collision[33][40] = false;

  // Pond collision (can't walk on water!)
  for (let y = 2; y < 9; y++) {
    for (let x = 19; x < 31; x++) {
      // Except the bridge
      if (x >= 23 && x <= 26) continue;
      collision[y][x] = true;
    }
  }

  // Map border collision
  for (let x = 0; x < W; x++) {
    collision[0][x] = true;
    collision[H - 1][x] = true;
  }
  for (let y = 0; y < H; y++) {
    collision[y][0] = true;
    collision[y][W - 1] = true;
  }

  // ============================================================
  // ZONES — Named areas for the HUD
  // ============================================================

  const zones: MapZone[] = [
    { name: 'Garden', nameChinese: '花園', x: 0, y: 0, width: 50, height: 13, type: 'outdoor' },
    { name: 'Classroom A', nameChinese: '課室 A', x: 2, y: 14, width: 18, height: 12, type: 'classroom' },
    { name: 'Classroom B', nameChinese: '課室 B', x: 30, y: 14, width: 18, height: 12, type: 'classroom' },
    { name: 'Library', nameChinese: '圖書館', x: 18, y: 22, width: 14, height: 10, type: 'library' },
    { name: 'Café', nameChinese: '咖啡廳', x: 33, y: 33, width: 12, height: 6, type: 'cafe' },
    { name: 'Courtyard', nameChinese: '中庭', x: 8, y: 33, width: 14, height: 6, type: 'outdoor' },
    { name: 'Main Path', nameChinese: '主通道', x: 20, y: 13, width: 10, height: 8, type: 'lobby' },
  ];

  return {
    width: W,
    height: H,
    tileSize: 32,
    ground,
    objects,
    collision,
    overhead,
    spawnPoint: { x: 25, y: 30 },
    zones,
  };
}
