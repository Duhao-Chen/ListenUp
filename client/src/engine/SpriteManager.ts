// ============================================================
// Sprite Manager
// Caches generated sprites and provides easy access.
// Generates all tile, object, and character sprites on demand.
// ============================================================

import type { CharacterAppearance, TileType } from '@shared/types';
import { ObjectType } from '@shared/types';
import { generateCharacterSpritesheet } from '../sprites/characters';
import { generateTileSpritesheet } from '../sprites/tiles';
import { generateObjectSprites, ObjectSprite } from '../sprites/objects';

export class SpriteManager {
  private tileSprites: Map<TileType, HTMLCanvasElement[]> | null = null;
  private objectSprites: Map<ObjectType, ObjectSprite> | null = null;
  private characterCache = new Map<string, HTMLCanvasElement>();

  private initialized = false;

  initialize() {
    if (this.initialized) return;
    this.tileSprites = generateTileSpritesheet();
    this.objectSprites = generateObjectSprites();
    this.initialized = true;
  }

  getTileSprite(type: TileType, variant: number = 0): HTMLCanvasElement | null {
    if (!this.tileSprites) return null;
    const variants = this.tileSprites.get(type);
    if (!variants || variants.length === 0) return null;
    return variants[variant % variants.length];
  }

  getObjectSprite(type: ObjectType): ObjectSprite | null {
    if (!this.objectSprites) return null;
    return this.objectSprites.get(type) || null;
  }

  getCharacterSpritesheet(appearance: CharacterAppearance): HTMLCanvasElement {
    // Cache key based on appearance
    const key = JSON.stringify(appearance);
    if (this.characterCache.has(key)) {
      return this.characterCache.get(key)!;
    }

    const sheet = generateCharacterSpritesheet(appearance);
    this.characterCache.set(key, sheet);
    return sheet;
  }

  // Pre-generate a character spritesheet for smoother first render
  preloadCharacter(appearance: CharacterAppearance) {
    this.getCharacterSpritesheet(appearance);
  }
}
