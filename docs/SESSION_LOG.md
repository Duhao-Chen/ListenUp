# Session Log — ListenUp Development

## Session 1 — 2026-02-26 — "Build it all with love"

### Context
- User: Duhao Chen
- Starting state: Empty repo with just `README.md` and some audio files (.mp3 silence/beep sounds, some with Korean-encoded filenames)
- Request: Build a Gather.town clone for digital learning in Hong Kong. Make it genuinely beautiful with artistic sprites. "Do it all with love."

### What Was Built
Built the entire application from scratch in a single session — ~4,700 lines of TypeScript/CSS across 35 files.

**Phase 1: Assessment & Planning**
- Evaluated feasibility of a Gather.town clone
- Proposed 3-tier scope (Prototype → Learning Features → Production)
- User chose "do as much as you can" with emphasis on beauty

**Phase 2: Project Scaffolding**
- Monorepo structure: root + `server/` + `client/` + `shared/`
- Vite + React + TypeScript for client
- Express + Socket.IO + tsx for server
- simple-peer for WebRTC

**Phase 3: Sprite Generation System (the artistic core)**
- `characters.ts` (446 lines): Chibi-style character generator
  - 8 preset appearances, 6 hair styles, customizable colors
  - 4-direction walking animation (4 frames each)
  - Rosy cheek blush, eye sparkle highlights
  - Each character is drawn pixel-by-pixel using canvas primitives at 2× scale
- `tiles.ts` (324 lines): 17 tile types
  - Seeded random noise for natural texture variation
  - Animated water tiles (4 frames)
  - Stone paths with individual stone outlines
  - Wood floors with grain lines
- `objects.ts` (502 lines): 28 object types
  - Trees with layered canopy (green and cherry blossom pink)
  - Red lanterns with gold characters (學)
  - Bookshelves with individually colored book spines
  - Fountains with water spray sparkles
  - Bauhinia blakeana (Hong Kong's flower) with 5-petal star arrangement

**Phase 4: Game Engine**
- Custom 2D engine (no external game library)
- 60fps game loop with delta-time
- Collision detection (4-point hitbox at feet)
- Smooth camera lerp following
- Depth-sorted rendering (Y-sort for objects and players)
- Cherry blossom petal particle system
- Ambient vignette overlay

**Phase 5: Campus Map**
- 50×40 tile hand-designed layout
- Procedurally stamped buildings and furniture
- 7 named zones with bilingual labels
- Garden with pond and bridge, 2 classrooms, library, café, courtyard

**Phase 6: Multiplayer Networking**
- Socket.IO for real-time position sync (~30 updates/sec)
- Remote player interpolation (lerp at 0.15 speed)
- WebRTC proximity video/audio (connect at 4 tiles, disconnect at 6)
- STUN servers: Google's public STUN

**Phase 7: UI**
- Glassmorphism design system with Hong Kong color palette
- Login screen with character preview and customization
- Collapsible chat panel
- Player list with colored dots
- Floating video panels
- Zone name HUD (bilingual)
- Responsive CSS for tablet/mobile

**Phase 8: iPad Support**
- User asked about iPad testing
- Added `host: true` to Vite config for network access
- Walked through same-WiFi and ngrok testing flows
- Keyboard support confirmed (user has iPad keyboard)

### Design Decisions Made
1. **Programmatic sprites over image files** — Infinite variation, no asset pipeline, everything self-contained
2. **Custom engine over Phaser/PixiJS** — Lighter weight, full control, no external game framework dependency
3. **2× pixel scale** — Each art-pixel is 2×2 screen pixels for that chunky pixel-art aesthetic
4. **Hysteresis on video proximity** — Connect at 4 tiles, disconnect at 6 tiles to prevent flicker
5. **Class-based engine, functional React UI** — Imperative game loop needs classes; UI is declarative
6. **Bilingual everything** — English + Traditional Chinese for Hong Kong context
7. **Glassmorphism UI** — Frosted glass panels feel modern and don't compete with the pixel art world
8. **Hong Kong cultural palette** — Bauhinia red (#E8474C), jade green (#2D8E6F), lantern gold (#F5C242)

### Audio Files (pre-existing, unused)
The repo came with .mp3 files that haven't been integrated yet:
- `silence-1sec.mp3`, `silence-10sec.mp3` — Silent audio clips
- `beep-08b.mp3` — Short beep sound
- `Silence (1 second)-효과음.mp3`, `Silence (10 seconds)-효과음.mp3` — Korean-named variants
These could be used for ambient/notification sounds in a future session.

### Files Created
```
.gitignore, README.md (rewritten)
package.json, package-lock.json
shared/types.ts
server/package.json, server/package-lock.json, server/tsconfig.json
server/src/index.ts
client/package.json, client/package-lock.json, client/tsconfig.json
client/vite.config.ts, client/index.html
client/src/vite-env.d.ts, client/src/main.tsx
client/src/App.tsx, client/src/App.css
client/src/sprites/characters.ts, tiles.ts, objects.ts
client/src/engine/GameEngine.ts, Renderer.ts, Camera.ts, SpriteManager.ts, InputManager.ts
client/src/maps/campus.ts
client/src/network/socket.ts, webrtc.ts
client/src/components/LoginScreen.tsx, GameView.tsx, GameCanvas.tsx
client/src/components/ChatPanel.tsx, PlayerList.tsx, VideoOverlay.tsx
```

### Commits
1. `3580a13` — Build Gather.town-inspired virtual learning campus for Hong Kong (35 files, 9064 insertions)
2. `324480a` — Enable network access for iPad/mobile testing

### What's Next
See ARCHITECTURE.md for the roadmap. The immediate next priorities are:
1. Touch controls (virtual joystick) for phone/tablet without keyboard
2. Interaction system (press Space/tap near objects to activate them)
3. Embedded content zones (YouTube, shared whiteboard in classrooms)
4. Sound effects and ambient audio
5. Production deployment
