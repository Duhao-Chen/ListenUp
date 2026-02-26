// ============================================================
// ListenUp — Shared Types
// A virtual learning campus inspired by Gather.town
// Built with love for learners in Hong Kong 🇭🇰
// ============================================================

export interface Position {
  x: number;
  y: number;
}

export interface CharacterAppearance {
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'medium' | 'long' | 'ponytail' | 'spiky' | 'bob';
  shirtColor: string;
  pantsColor: string;
  eyeColor: string;
}

export type Direction = 'down' | 'up' | 'left' | 'right';

export interface PlayerState {
  id: string;
  name: string;
  appearance: CharacterAppearance;
  position: Position;
  direction: Direction;
  isMoving: boolean;
  room: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

export interface RoomState {
  id: string;
  name: string;
  players: Record<string, PlayerState>;
}

// ---- Tile & Object Enums ----

export enum TileType {
  Empty = 0,
  Grass = 1,
  GrassLight = 2,
  GrassDark = 3,
  GrassFlower = 4,
  StonePath = 5,
  StonePathLight = 6,
  WoodFloor = 7,
  WoodFloorDark = 8,
  TileFloor = 9,
  Water = 10,
  WaterEdge = 11,
  WallTop = 12,
  WallFront = 13,
  Carpet = 14,
  CarpetRed = 15,
  Sand = 16,
  Bridge = 17,
}

export enum ObjectType {
  None = 0,
  Tree = 1,
  TreePink = 2,
  TreeSmall = 3,
  Bush = 4,
  FlowerRed = 5,
  FlowerYellow = 6,
  Desk = 7,
  Chair = 8,
  ChairLeft = 9,
  ChairRight = 10,
  Whiteboard = 11,
  Bookshelf = 12,
  Lantern = 13,
  Bench = 14,
  Fountain = 15,
  TableRound = 16,
  Computer = 17,
  Plant = 18,
  Podium = 19,
  Sign = 20,
  Lamp = 21,
  Rug = 22,
  StoneWall = 23,
  Roof = 24,
  DoorFrame = 25,
  Window = 26,
  Bauhinia = 27, // Hong Kong's flower
  FlagHK = 28,
}

export interface GameMap {
  width: number;
  height: number;
  tileSize: number;
  ground: TileType[][];
  objects: ObjectType[][];
  collision: boolean[][];
  overhead: ObjectType[][];
  spawnPoint: Position;
  zones: MapZone[];
}

export interface MapZone {
  name: string;
  nameChinese: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'classroom' | 'library' | 'outdoor' | 'cafe' | 'lobby';
}

// ---- Socket Events ----

export interface ServerToClientEvents {
  'room-state': (state: RoomState) => void;
  'player-joined': (player: PlayerState) => void;
  'player-left': (playerId: string) => void;
  'player-moved': (data: {
    id: string;
    position: Position;
    direction: Direction;
    isMoving: boolean;
  }) => void;
  'chat-message': (message: ChatMessage) => void;
  'signal': (data: { from: string; signal: unknown }) => void;
}

export interface ClientToServerEvents {
  'join-room': (data: {
    name: string;
    appearance: CharacterAppearance;
    room: string;
  }) => void;
  'move': (data: {
    position: Position;
    direction: Direction;
    isMoving: boolean;
  }) => void;
  'chat': (text: string) => void;
  'signal': (data: { to: string; signal: unknown }) => void;
}
