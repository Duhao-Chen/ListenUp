// ============================================================
// Renderer
// Paints the world onto the canvas — layer by layer,
// with depth sorting, ambient lighting, and that warm glow.
// ============================================================

import type { PlayerState, GameMap, Direction } from '@shared/types';
import { TileType, ObjectType } from '@shared/types';
import { Camera } from './Camera';
import { SpriteManager } from './SpriteManager';
import { getDirectionRow } from '../sprites/characters';

const TILE = 32;
const CHAR_W = 32;
const CHAR_H = 48;

interface RenderableEntity {
  type: 'player';
  x: number;
  y: number;
  sortY: number;
  player: PlayerState;
  animFrame: number;
}

interface RenderableObject {
  type: 'object';
  x: number;
  y: number;
  sortY: number;
  objType: ObjectType;
}

type Renderable = RenderableEntity | RenderableObject;

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private sprites: SpriteManager;
  private animCounter = 0;
  private waterFrame = 0;
  private waterTimer = 0;

  // Particle system for cherry blossom petals
  private petals: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    rotSpeed: number;
    alpha: number;
    color: string;
  }> = [];

  constructor(ctx: CanvasRenderingContext2D, sprites: SpriteManager) {
    this.ctx = ctx;
    this.sprites = sprites;
    this.initPetals();
  }

  private initPetals() {
    const colors = ['#FFB8C8', '#FF9AB0', '#FFD0DC', '#FFC8D8', '#FFFFFF'];
    for (let i = 0; i < 30; i++) {
      this.petals.push({
        x: Math.random() * 1600,
        y: Math.random() * 1280,
        vx: 0.3 + Math.random() * 0.4,
        vy: 0.2 + Math.random() * 0.3,
        size: 2 + Math.random() * 3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        alpha: 0.3 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  render(
    map: GameMap,
    players: Map<string, PlayerState>,
    localPlayerId: string,
    camera: Camera,
    playerAnimFrames: Map<string, number>,
    dt: number
  ) {
    const ctx = this.ctx;
    const canvas = ctx.canvas;
    ctx.imageSmoothingEnabled = false;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

    // Update water animation
    this.waterTimer += dt;
    if (this.waterTimer > 400) {
      this.waterFrame = (this.waterFrame + 1) % 4;
      this.waterTimer = 0;
    }

    // Determine visible tile range
    const startCol = Math.max(0, Math.floor(camera.x / TILE) - 1);
    const endCol = Math.min(map.width, Math.ceil((camera.x + camera.width) / TILE) + 1);
    const startRow = Math.max(0, Math.floor(camera.y / TILE) - 1);
    const endRow = Math.min(map.height, Math.ceil((camera.y + camera.height) / TILE) + 1);

    // ---- Layer 1: Ground tiles ----
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const tileType = map.ground[row][col];
        let variant = 0;

        if (tileType === TileType.Water) {
          variant = this.waterFrame;
        } else if (tileType === TileType.Grass || tileType === TileType.GrassFlower) {
          // Use position-based variant for visual variety
          variant = (col * 7 + row * 13) % 4;
        } else {
          variant = (col + row) % 2;
        }

        const sprite = this.sprites.getTileSprite(tileType, variant);
        if (sprite) {
          ctx.drawImage(sprite, col * TILE, row * TILE);
        }
      }
    }

    // ---- Build sorted renderables (objects + players) ----
    const renderables: Renderable[] = [];

    // Collect visible objects
    for (let row = startRow; row < endRow + 2; row++) {
      for (let col = startCol; col < endCol; col++) {
        if (row >= map.height || col >= map.width) continue;
        const objType = map.objects[row][col];
        if (objType === ObjectType.None) continue;

        const objSprite = this.sprites.getObjectSprite(objType);
        if (!objSprite) continue;

        const drawY = row * TILE - (objSprite.heightTiles - 1) * TILE;
        renderables.push({
          type: 'object',
          x: col * TILE,
          y: drawY,
          sortY: row * TILE + TILE, // Sort by bottom of object
          objType,
        });
      }
    }

    // Collect players
    players.forEach((player) => {
      const animFrame = playerAnimFrames.get(player.id) || 0;
      renderables.push({
        type: 'player',
        x: player.position.x - CHAR_W / 2,
        y: player.position.y - CHAR_H + 8, // Feet at position
        sortY: player.position.y,
        player,
        animFrame,
      });
    });

    // Sort by Y (depth sorting)
    renderables.sort((a, b) => a.sortY - b.sortY);

    // ---- Layer 2: Render sorted entities ----
    for (const r of renderables) {
      if (r.type === 'object') {
        const objSprite = this.sprites.getObjectSprite(r.objType);
        if (objSprite) {
          ctx.drawImage(objSprite.canvas, r.x, r.y);
        }
      } else if (r.type === 'player') {
        this.drawPlayer(r.player, r.animFrame, r.player.id === localPlayerId);
      }
    }

    // ---- Layer 3: Cherry blossom petals (world-space) ----
    this.updateAndDrawPetals(ctx, map, dt);

    ctx.restore();

    // ---- Layer 4: Ambient vignette overlay ----
    this.drawVignette(canvas.width, canvas.height);
  }

  private drawPlayer(player: PlayerState, animFrame: number, isLocal: boolean) {
    const ctx = this.ctx;
    const sheet = this.sprites.getCharacterSpritesheet(player.appearance);

    const dirRow = getDirectionRow(player.direction);
    const frame = player.isMoving ? animFrame : 0;

    const sx = frame * CHAR_W;
    const sy = dirRow * CHAR_H;

    const drawX = player.position.x - CHAR_W / 2;
    const drawY = player.position.y - CHAR_H + 8;

    // Draw character sprite
    ctx.drawImage(sheet, sx, sy, CHAR_W, CHAR_H, drawX, drawY, CHAR_W, CHAR_H);

    // Draw name tag
    this.drawNameTag(player.name, player.position.x, drawY - 4, isLocal);

    // Draw proximity glow for local player
    if (isLocal) {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#FFE066';
      ctx.beginPath();
      ctx.ellipse(player.position.x, player.position.y - 12, 48, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawNameTag(name: string, x: number, y: number, isLocal: boolean) {
    const ctx = this.ctx;
    ctx.save();

    ctx.font = 'bold 11px Inter, sans-serif';
    const metrics = ctx.measureText(name);
    const padding = 4;
    const tagW = metrics.width + padding * 2;
    const tagH = 16;
    const tagX = x - tagW / 2;
    const tagY = y - tagH;

    // Background
    ctx.fillStyle = isLocal ? 'rgba(232, 71, 76, 0.85)' : 'rgba(20, 20, 40, 0.75)';
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagW, tagH, 4);
    ctx.fill();

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x, tagY + tagH / 2);

    ctx.restore();
  }

  private updateAndDrawPetals(
    ctx: CanvasRenderingContext2D,
    map: GameMap,
    dt: number
  ) {
    const worldW = map.width * TILE;
    const worldH = map.height * TILE;

    for (const petal of this.petals) {
      // Update
      petal.x += petal.vx * (dt / 16);
      petal.y += petal.vy * (dt / 16);
      petal.rotation += petal.rotSpeed;

      // Wrap around
      if (petal.x > worldW) petal.x = -10;
      if (petal.y > worldH) petal.y = -10;

      // Draw
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);
      ctx.globalAlpha = petal.alpha;
      ctx.fillStyle = petal.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawVignette(w: number, h: number) {
    const ctx = this.ctx;
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }
}
