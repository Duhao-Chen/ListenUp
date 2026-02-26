// ============================================================
// Game Engine
// The heart that beats 60 times a second.
// Coordinates input, physics, networking, and rendering.
// ============================================================

import type { PlayerState, GameMap, Position, Direction } from '@shared/types';
import { Camera } from './Camera';
import { Renderer } from './Renderer';
import { SpriteManager } from './SpriteManager';
import { InputManager } from './InputManager';

const TILE = 32;
const MOVE_SPEED = 2.5; // pixels per frame
const ANIM_SPEED = 150; // ms per animation frame

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private renderer: Renderer;
  private sprites: SpriteManager;
  private input: InputManager;

  private map: GameMap;
  private localPlayerId: string = '';
  private players = new Map<string, PlayerState>();
  private playerAnimFrames = new Map<string, number>();
  private playerAnimTimers = new Map<string, number>();

  // Smooth interpolation for remote players
  private playerTargets = new Map<string, Position>();

  private running = false;
  private lastTime = 0;
  private onMove: ((pos: Position, dir: Direction, isMoving: boolean) => void) | null = null;
  private onZoneChange: ((zoneName: string, zoneChinese: string) => void) | null = null;
  private currentZone = '';

  private lastSentPos: Position = { x: 0, y: 0 };
  private sendThrottle = 0;

  constructor(canvas: HTMLCanvasElement, map: GameMap) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.map = map;

    this.sprites = new SpriteManager();
    this.sprites.initialize();

    this.camera = new Camera(canvas.width, canvas.height);
    this.renderer = new Renderer(this.ctx, this.sprites);
    this.input = new InputManager();
  }

  // ---- Lifecycle ----

  start(localPlayerId: string, players: Record<string, PlayerState>) {
    this.localPlayerId = localPlayerId;
    this.players.clear();

    for (const [id, player] of Object.entries(players)) {
      this.players.set(id, { ...player });
      this.playerAnimFrames.set(id, 0);
      this.playerAnimTimers.set(id, 0);
    }

    // Pre-generate local player sprite
    const local = this.players.get(localPlayerId);
    if (local) {
      this.sprites.preloadCharacter(local.appearance);
      const worldW = this.map.width * TILE;
      const worldH = this.map.height * TILE;
      this.camera.snapTo(local.position.x, local.position.y, worldW, worldH);
    }

    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  stop() {
    this.running = false;
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.camera.resize(width, height);
  }

  // ---- External event handlers ----

  setOnMove(cb: (pos: Position, dir: Direction, isMoving: boolean) => void) {
    this.onMove = cb;
  }

  setOnZoneChange(cb: (name: string, chinese: string) => void) {
    this.onZoneChange = cb;
  }

  setChatFocused(focused: boolean) {
    this.input.chatFocused = focused;
  }

  // ---- Player management ----

  addPlayer(player: PlayerState) {
    this.players.set(player.id, { ...player });
    this.playerAnimFrames.set(player.id, 0);
    this.playerAnimTimers.set(player.id, 0);
    this.sprites.preloadCharacter(player.appearance);
  }

  removePlayer(id: string) {
    this.players.delete(id);
    this.playerAnimFrames.delete(id);
    this.playerAnimTimers.delete(id);
    this.playerTargets.delete(id);
  }

  updateRemotePlayer(id: string, pos: Position, dir: Direction, isMoving: boolean) {
    const player = this.players.get(id);
    if (!player) return;

    // Set target for smooth interpolation
    this.playerTargets.set(id, { ...pos });
    player.direction = dir;
    player.isMoving = isMoving;
  }

  getPlayers(): Map<string, PlayerState> {
    return this.players;
  }

  getLocalPlayer(): PlayerState | undefined {
    return this.players.get(this.localPlayerId);
  }

  // ---- Game Loop ----

  private gameLoop = (time: number) => {
    if (!this.running) return;

    const dt = Math.min(time - this.lastTime, 50); // Cap delta to prevent spiraling
    this.lastTime = time;

    this.update(dt);
    this.renderer.render(
      this.map,
      this.players,
      this.localPlayerId,
      this.camera,
      this.playerAnimFrames,
      dt
    );

    requestAnimationFrame(this.gameLoop);
  };

  private update(dt: number) {
    const local = this.players.get(this.localPlayerId);
    if (!local) return;

    // ---- Local player movement ----
    const { dx, dy, direction } = this.input.getMovement();
    const isMoving = dx !== 0 || dy !== 0;

    if (isMoving && direction) {
      const newX = local.position.x + dx * MOVE_SPEED;
      const newY = local.position.y + dy * MOVE_SPEED;

      // Collision detection
      if (this.canMoveTo(newX, local.position.y)) {
        local.position.x = newX;
      }
      if (this.canMoveTo(local.position.x, newY)) {
        local.position.y = newY;
      }

      local.direction = direction;
      local.isMoving = true;
    } else {
      local.isMoving = false;
    }

    // Send position to server (throttled)
    this.sendThrottle += dt;
    if (this.sendThrottle >= 33) { // ~30 updates per second
      this.sendThrottle = 0;
      const posChanged =
        Math.abs(local.position.x - this.lastSentPos.x) > 0.5 ||
        Math.abs(local.position.y - this.lastSentPos.y) > 0.5 ||
        local.isMoving;

      if (posChanged && this.onMove) {
        this.onMove(
          { x: Math.round(local.position.x), y: Math.round(local.position.y) },
          local.direction,
          local.isMoving
        );
        this.lastSentPos = { ...local.position };
      }
    }

    // ---- Interpolate remote players ----
    this.players.forEach((player, id) => {
      if (id === this.localPlayerId) return;

      const target = this.playerTargets.get(id);
      if (target) {
        const lerpSpeed = 0.15;
        player.position.x += (target.x - player.position.x) * lerpSpeed;
        player.position.y += (target.y - player.position.y) * lerpSpeed;
      }
    });

    // ---- Animation frames ----
    this.players.forEach((player, id) => {
      if (player.isMoving) {
        const timer = (this.playerAnimTimers.get(id) || 0) + dt;
        if (timer >= ANIM_SPEED) {
          const frame = ((this.playerAnimFrames.get(id) || 0) + 1) % 4;
          this.playerAnimFrames.set(id, frame);
          this.playerAnimTimers.set(id, 0);
        } else {
          this.playerAnimTimers.set(id, timer);
        }
      } else {
        this.playerAnimFrames.set(id, 0);
        this.playerAnimTimers.set(id, 0);
      }
    });

    // ---- Camera ----
    const worldW = this.map.width * TILE;
    const worldH = this.map.height * TILE;
    this.camera.follow(local.position.x, local.position.y, worldW, worldH);

    // ---- Zone detection ----
    const tileX = Math.floor(local.position.x / TILE);
    const tileY = Math.floor(local.position.y / TILE);

    let newZone = 'Campus';
    let newZoneChinese = '校園';
    for (const zone of this.map.zones) {
      if (
        tileX >= zone.x &&
        tileX < zone.x + zone.width &&
        tileY >= zone.y &&
        tileY < zone.y + zone.height
      ) {
        newZone = zone.name;
        newZoneChinese = zone.nameChinese;
        break;
      }
    }

    if (newZone !== this.currentZone) {
      this.currentZone = newZone;
      if (this.onZoneChange) {
        this.onZoneChange(newZone, newZoneChinese);
      }
    }
  }

  // ---- Collision Detection ----

  private canMoveTo(x: number, y: number): boolean {
    // Check a small hitbox at the player's feet
    const hitboxPadding = 6;
    const checkPoints = [
      { x: x - hitboxPadding, y: y - 2 },
      { x: x + hitboxPadding, y: y - 2 },
      { x: x - hitboxPadding, y: y + 4 },
      { x: x + hitboxPadding, y: y + 4 },
    ];

    for (const pt of checkPoints) {
      const tileX = Math.floor(pt.x / TILE);
      const tileY = Math.floor(pt.y / TILE);

      if (tileX < 0 || tileX >= this.map.width || tileY < 0 || tileY >= this.map.height) {
        return false;
      }

      if (this.map.collision[tileY][tileX]) {
        return false;
      }
    }

    return true;
  }
}
