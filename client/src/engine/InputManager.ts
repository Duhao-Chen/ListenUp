// ============================================================
// Input Manager
// Handles keyboard input for player movement.
// Supports WASD and Arrow keys for inclusive accessibility.
// ============================================================

import type { Direction } from '@shared/types';

export class InputManager {
  private keys = new Set<string>();
  private _chatFocused = false;

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (this._chatFocused) return;
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    // Clear keys when window loses focus (prevents stuck keys)
    window.addEventListener('blur', () => {
      this.keys.clear();
    });
  }

  set chatFocused(val: boolean) {
    this._chatFocused = val;
    if (val) this.keys.clear();
  }

  get chatFocused(): boolean {
    return this._chatFocused;
  }

  isDown(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  getMovement(): { dx: number; dy: number; direction: Direction | null } {
    let dx = 0;
    let dy = 0;
    let direction: Direction | null = null;

    if (this.isDown('w') || this.isDown('arrowup')) {
      dy = -1;
      direction = 'up';
    }
    if (this.isDown('s') || this.isDown('arrowdown')) {
      dy = 1;
      direction = 'down';
    }
    if (this.isDown('a') || this.isDown('arrowleft')) {
      dx = -1;
      direction = 'left';
    }
    if (this.isDown('d') || this.isDown('arrowright')) {
      dx = 1;
      direction = 'right';
    }

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    return { dx, dy, direction };
  }
}
