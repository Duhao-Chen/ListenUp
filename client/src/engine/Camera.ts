// ============================================================
// Camera
// Smooth-following camera with viewport management.
// Adds that gentle, alive feeling to the world.
// ============================================================

export class Camera {
  x = 0;
  y = 0;
  width: number;
  height: number;

  private targetX = 0;
  private targetY = 0;
  private smoothing = 0.08; // Lower = smoother follow

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  follow(targetX: number, targetY: number, worldWidth: number, worldHeight: number) {
    // Center camera on target
    this.targetX = targetX - this.width / 2;
    this.targetY = targetY - this.height / 2;

    // Clamp to world bounds
    this.targetX = Math.max(0, Math.min(this.targetX, worldWidth - this.width));
    this.targetY = Math.max(0, Math.min(this.targetY, worldHeight - this.height));

    // Smooth interpolation (lerp)
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
  }

  // Snap immediately (no lerp) — used on first load
  snapTo(targetX: number, targetY: number, worldWidth: number, worldHeight: number) {
    this.x = targetX - this.width / 2;
    this.y = targetY - this.height / 2;
    this.x = Math.max(0, Math.min(this.x, worldWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, worldHeight - this.height));
    this.targetX = this.x;
    this.targetY = this.y;
  }

  // Convert world coords to screen coords
  worldToScreen(wx: number, wy: number): { sx: number; sy: number } {
    return {
      sx: wx - this.x,
      sy: wy - this.y,
    };
  }

  // Check if a world rect is visible on screen
  isVisible(wx: number, wy: number, w: number, h: number): boolean {
    return (
      wx + w > this.x &&
      wx < this.x + this.width &&
      wy + h > this.y &&
      wy < this.y + this.height
    );
  }
}
