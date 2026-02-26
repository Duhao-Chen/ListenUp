# Architecture — ListenUp

Deep technical notes on how the system works and where it's headed.

## System Overview

```
┌──────────────────────────────────────────────────────┐
│                        CLIENT                         │
│                                                      │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ React UI   │  │ Game Engine  │  │   Network    │ │
│  │            │  │              │  │              │ │
│  │ LoginScreen│  │ GameEngine   │  │ SocketManager│ │
│  │ GameView   │←→│ Renderer     │  │ WebRTCManager│ │
│  │ ChatPanel  │  │ Camera       │  │              │ │
│  │ PlayerList │  │ InputManager │  │              │ │
│  │ VideoOverl.│  │ SpriteManager│  │              │ │
│  └────────────┘  └──────────────┘  └──────────────┘ │
│         ↑              ↑ ↓                ↑ ↓        │
│         └──── App.tsx orchestrates ───────┘          │
└──────────────────────────────────────────────────────┘
                         ↕ Socket.IO + WebRTC
┌──────────────────────────────────────────────────────┐
│                       SERVER                          │
│                                                      │
│  Express (static files) + Socket.IO (real-time)      │
│  ┌─────────┐  ┌──────────┐  ┌──────────────┐       │
│  │ Rooms   │  │ Players  │  │ Signal Relay │       │
│  │ Map<id, │  │ Per-room │  │ WebRTC pass- │       │
│  │  players>│  │ state    │  │ through      │       │
│  └─────────┘  └──────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────┘
```

## Data Flow

### Player Movement
```
Keyboard → InputManager.getMovement()
  → GameEngine.update() applies dx/dy with collision check
  → GameEngine calls onMove callback (throttled 30/sec)
  → App.tsx sends via SocketManager.sendMove()
  → Server broadcasts 'player-moved' to room
  → Other clients receive → GameEngine.updateRemotePlayer()
  → Remote positions lerp smoothly toward target
```

### Chat
```
User types → ChatPanel form submit
  → App.tsx calls SocketManager.sendChat()
  → Server creates ChatMessage with UUID + timestamp
  → Server broadcasts 'chat-message' to entire room
  → All clients append to messages state
```

### Video Chat (Proximity)
```
Every 1 second:
  WebRTCManager.updateProximity() checks all player distances

  If distance < 128px (4 tiles) and no existing peer:
    → Request local media (camera + mic)
    → Create SimplePeer(initiator: true)
    → Peer emits 'signal' → sent via Socket.IO to target
    → Target creates SimplePeer(initiator: false) and signals back
    → Both peers connect → stream events fire
    → VideoOverlay renders the video panel

  If distance > 192px (6 tiles) and peer exists:
    → peer.destroy()
    → Remove from peers map
    → Video panel disappears
```

## Rendering Pipeline

Each frame at 60fps:

```
1. Clear canvas (dark background)
2. Translate canvas by camera offset
3. Draw ground tiles (only visible ones, using tile range culling)
   - Water tiles use animated variants (4 frames, 400ms cycle)
   - Grass tiles use position-based variant for visual variety
4. Build sorted renderables array:
   - Collect visible objects from objects[][] layer
   - Collect all players
   - Sort by Y coordinate (depth sorting)
5. Draw sorted renderables back-to-front:
   - Objects: draw sprite at position
   - Players: draw spritesheet frame + name tag + glow (if local)
6. Draw cherry blossom petals (world-space particles)
7. Restore canvas transform
8. Draw vignette overlay (screen-space radial gradient)
```

### Sprite Generation

All sprites are generated at initialization, cached in SpriteManager.

**Characters** (32×48px spritesheet, 128×192 total):
- Each "pixel" is 2×2 screen pixels (S=2, 16×24 art grid)
- Drawn with `px()` and `rect()` helpers on CanvasRenderingContext2D
- Body parts drawn back-to-front: shadow → feet → legs → body → arms → head → hair → face
- Walking animation: legs alternate offset, body bobs 1px, arms swing
- Color derived from CharacterAppearance with lighten/darken helpers

**Tiles** (32×32px, some have multiple variants):
- Base: seeded random noise for natural texture (`seededRandom()`)
- Details layered on top (stone outlines, wood grain, flower crosses)
- Water: 4 animation frames with sin-wave highlights

**Objects** (32×32 or 32×64px):
- Drawn with same pixel helpers
- Trees are 1×2 tiles (trunk + layered canopy circles)
- Lanterns have warm radial glow overlay
- Bookshelves have individually colored book spines

## Collision System

Simple tile-based collision:
- `collision[][]` boolean grid, set during map generation
- Walls, furniture, trees, water, and borders are marked `true`
- Door openings are explicitly cleared back to `false`
- Player hitbox: 4 check points around feet (±6px X, -2px to +4px Y)
- X and Y checked independently (allows wall sliding)

## Camera

- Lerp smoothing: `pos += (target - pos) * 0.08` each frame
- Clamped to world bounds so you never see outside the map
- `snapTo()` for instant position on first load (no initial lerp)
- Screen-to-world and visibility checks for culling

## Server Architecture

Intentionally minimal — stateless except for in-memory room data.

```typescript
rooms: Map<roomId, Map<playerId, PlayerState>>
```

- No database, no persistence (rooms vanish when empty)
- Socket.IO handles connection lifecycle
- WebRTC signaling is pure pass-through (server never sees media)
- Server assigns player position at spawn point on join
- Player state (position, direction, isMoving) updated on each 'move' event

## State Management

No Redux/Zustand/etc. The architecture is:

- **React state** (useState): UI concerns — current screen, messages, player list
- **Refs** (useRef): mutable references to engine, socket, webrtc instances
- **Engine internal state**: player positions, animation frames, camera — managed imperatively in the game loop, not React state (avoids re-render overhead at 60fps)
- **Periodic sync**: A `setInterval(1000ms)` copies engine player data to React state for the PlayerList component

This hybrid approach avoids the classic problem of trying to run a 60fps game loop inside React's declarative rendering model.

## Map Format

The campus map is defined in `client/src/maps/campus.ts` as a generator function that returns a `GameMap`:

```typescript
interface GameMap {
  width: number;           // 50 tiles
  height: number;          // 40 tiles
  tileSize: number;        // 32 pixels
  ground: TileType[][];    // Base terrain
  objects: ObjectType[][];  // Decorations and furniture
  collision: boolean[][];   // Walkability
  overhead: ObjectType[][]; // Renders above player (unused so far)
  spawnPoint: Position;     // { x: 25, y: 30 } in tiles
  zones: MapZone[];         // Named areas for HUD
}
```

Map is built procedurally with helper functions (`fillRect`, `fillBorder`) rather than stored as literal arrays. This makes it readable and easy to modify.

## Dependency Graph

```
shared/types.ts
  ↓ imported by everything

server/src/index.ts
  ↓ uses: express, socket.io, cors, uuid

client/src/sprites/*
  ↓ uses: shared/types (enums)

client/src/engine/*
  ↓ uses: shared/types, sprites/*

client/src/maps/campus.ts
  ↓ uses: shared/types (enums)

client/src/network/*
  ↓ uses: shared/types, socket.io-client, simple-peer

client/src/components/*
  ↓ uses: shared/types, engine/*, network/*, sprites/characters

client/src/App.tsx
  ↓ orchestrates: components/*, network/*, maps/*, engine types
```

## Scaling Considerations

### Current Limits
- **Server**: In-memory state, single process. Fine for ~100 concurrent users across rooms.
- **WebRTC**: Peer-to-peer mesh. Works well up to ~10-12 simultaneous video connections. Beyond that, CPU/bandwidth degrades.
- **Canvas rendering**: Efficient with tile culling. Can handle 50+ players visible at once.
- **Socket.IO**: 30 position updates/sec/player. At 50 players in a room, that's 1500 messages/sec — still fine.

### Scaling Path (if needed)
1. **Video beyond 15 users**: Replace simple-peer with a Selective Forwarding Unit (SFU) like mediasoup or Janus
2. **Multiple server instances**: Add Redis adapter for Socket.IO pub/sub
3. **Persistence**: Add PostgreSQL for user accounts, room configs, chat history
4. **Map loading**: Move map data to server, support custom user-created maps
5. **CDN**: Serve client build from CDN, API/sockets from origin

## Roadmap

### Tier 2: Learning Features
- [ ] **Interaction system**: Press Space near whiteboard → opens shared canvas
- [ ] **Embedded content zones**: YouTube player, PDF viewer in classroom areas
- [ ] **Teacher/student roles**: Teacher can lock movement, highlight area, broadcast
- [ ] **Breakout rooms**: Teacher creates temporary sub-rooms for group work
- [ ] **Screen sharing**: Share screen via WebRTC in designated zones
- [ ] **Localization**: Full i18n with zh-HK, zh-CN, en-US

### Tier 3: Production
- [ ] **Authentication**: OAuth (Google) or simple magic link
- [ ] **Persistent rooms**: Database-backed room configs
- [ ] **Map editor**: Drag-and-drop tile/object placement
- [ ] **Admin dashboard**: User management, room monitoring
- [ ] **Mobile app**: React Native or PWA
- [ ] **Analytics**: Track zone usage, engagement time, chat activity
- [ ] **Deployment**: Docker + fly.io or Railway, CI/CD via GitHub Actions
