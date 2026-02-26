# CLAUDE.md — Project Memory for ListenUp

## What This Is

ListenUp is a **Gather.town clone** built for **digital learning in Hong Kong**.
A 2D pixel-art multiplayer virtual campus where learners walk around, enter
classrooms, and video chat with whoever is nearby — like a spatial learning
environment.

Owner: Duhao Chen (GitHub: Duhao-Chen)
Branch: `claude/gather-town-learning-clone-WbHqg`

## Tech Stack

| Layer        | Choice                          | Why                                     |
|--------------|--------------------------------|-----------------------------------------|
| Frontend     | React 18 + TypeScript          | Standard, fast iteration                |
| Build        | Vite 5                         | Fast HMR, clean config                  |
| Rendering    | HTML5 Canvas (custom engine)   | Full control, pixel-art friendly        |
| Sprites      | Programmatic (canvas drawing)  | No external assets, infinite variation   |
| Server       | Express + Socket.IO            | Simple real-time multiplayer             |
| Video/Audio  | WebRTC via simple-peer         | Peer-to-peer, proximity-based           |
| Styling      | CSS (glassmorphism)            | Beautiful without a framework            |
| Fonts        | Inter + Noto Sans HK           | Bilingual English/Chinese support        |

## Project Structure

```
ListenUp/
├── CLAUDE.md                    ← You are here
├── shared/types.ts              ← All shared TypeScript interfaces & enums
├── server/
│   └── src/index.ts             ← Express + Socket.IO server (135 lines)
├── client/
│   ├── src/
│   │   ├── App.tsx              ← Root: login → connect → play state machine
│   │   ├── App.css              ← All styles (802 lines, glassmorphism)
│   │   ├── sprites/
│   │   │   ├── characters.ts    ← Chibi character spritesheet generator (446 lines)
│   │   │   ├── tiles.ts         ← 17 tile types with noise texturing (324 lines)
│   │   │   └── objects.ts       ← 28 object types: trees, desks, lanterns... (502 lines)
│   │   ├── engine/
│   │   │   ├── GameEngine.ts    ← 60fps loop, movement, collision (294 lines)
│   │   │   ├── Renderer.ts      ← Depth-sorted drawing, particles (291 lines)
│   │   │   ├── Camera.ts        ← Smooth lerp follow camera (68 lines)
│   │   │   ├── SpriteManager.ts ← Sprite cache layer (55 lines)
│   │   │   └── InputManager.ts  ← WASD + Arrows, chat focus toggle (73 lines)
│   │   ├── maps/campus.ts       ← 50×40 tile campus layout (432 lines)
│   │   ├── network/
│   │   │   ├── socket.ts        ← Socket.IO client wrapper (103 lines)
│   │   │   └── webrtc.ts        ← Proximity WebRTC manager (214 lines)
│   │   └── components/
│   │       ├── LoginScreen.tsx   ← Character customization + name entry
│   │       ├── GameView.tsx      ← Main game UI layout
│   │       ├── GameCanvas.tsx    ← Canvas lifecycle management
│   │       ├── ChatPanel.tsx     ← Collapsible text chat
│   │       ├── PlayerList.tsx    ← Who's on campus
│   │       └── VideoOverlay.tsx  ← Floating video panels
│   └── vite.config.ts           ← Vite config (host: true for iPad access)
├── docs/
│   ├── SESSION_LOG.md           ← Development history
│   └── ARCHITECTURE.md          ← Deep system design notes
└── *.mp3                        ← Audio assets (pre-existing, unused so far)
```

## Key Constants & Design Decisions

- **Tile size**: 32×32 pixels
- **Character sprite**: 32×48 pixels (16×24 pixel-art at 2× scale)
- **Spritesheet layout**: 4 columns (walk frames) × 4 rows (down/left/right/up)
- **Move speed**: 2.5 px/frame at 60fps
- **Animation speed**: 150ms per walk frame
- **Position send rate**: ~30 updates/sec (33ms throttle)
- **Proximity video connect**: 128px (4 tiles)
- **Proximity video disconnect**: 192px (6 tiles) — hysteresis prevents flicker
- **Map size**: 50×40 tiles = 1600×1280 world pixels
- **Spawn point**: tile (25, 30), pixel center of the main path
- **Server port**: 3001
- **Client dev port**: 5173

## Socket Events

| Event           | Direction        | Payload                                 |
|-----------------|------------------|-----------------------------------------|
| `join-room`     | Client → Server  | { name, appearance, room }              |
| `move`          | Client → Server  | { position, direction, isMoving }       |
| `chat`          | Client → Server  | text string                             |
| `signal`        | Bidirectional    | { to/from, signal } (WebRTC signaling)  |
| `room-state`    | Server → Client  | { id, name, players }                   |
| `player-joined` | Server → Client  | PlayerState                             |
| `player-left`   | Server → Client  | playerId string                         |
| `player-moved`  | Server → Client  | { id, position, direction, isMoving }   |
| `chat-message`  | Server → Client  | ChatMessage                             |

## Campus Map Zones

| Zone          | Chinese  | Tile Area          | Features                            |
|---------------|----------|--------------------|-------------------------------------|
| Garden        | 花園     | (0,0)→(50,13)      | Cherry blossoms, pond, bridge, benches |
| Classroom A   | 課室 A   | (2,14)→(20,26)     | Desks, whiteboard, podium, plants   |
| Classroom B   | 課室 B   | (30,14)→(48,26)    | Computer lab, monitors, chairs      |
| Library       | 圖書館   | (18,22)→(32,32)    | Bookshelves, reading tables, lamps  |
| Café          | 咖啡廳   | (33,33)→(45,39)    | Round tables, plants                |
| Courtyard     | 中庭     | (8,33)→(22,39)     | Fountain, lanterns, Bauhinia flowers|
| Main Path     | 主通道   | (20,13)→(30,21)    | Connecting corridor                 |

## Conventions

- All sprites are generated programmatically — no image files
- Pixel art uses a 2× scale (`S = 2`): each art-pixel = 2×2 screen pixels
- Colors use hex strings, with `lighten()`/`darken()` helpers
- Bilingual: every user-facing label has English + Traditional Chinese
- CSS uses custom properties (`--primary`, `--glass-bg`, etc.)
- Components are functional React with hooks
- No state management library — React state + refs for engine
- Game engine is imperative (class-based), UI is declarative (React)

## Running

```bash
npm run install:all    # Install root + server + client deps
npm run dev            # Start both server and client
```

Client: http://localhost:5173 (or Network IP for iPad)
Server: http://localhost:3001

## Known Gaps / Future Work

- [ ] Touch controls (virtual joystick for phones without keyboards)
- [ ] Map editor for custom rooms
- [ ] Persistent rooms / user accounts
- [ ] Embedded content zones (YouTube, slides, shared whiteboard)
- [ ] Teacher/student role permissions
- [ ] Screen sharing in classrooms
- [ ] Ambient sound effects (the .mp3 files exist but aren't wired up)
- [ ] Mobile-responsive layout improvements
- [ ] Production deployment guide (Dockerfile, fly.io, etc.)
- [ ] Scalability: media server (mediasoup) for >15 users in proximity
- [ ] Day/night ambient lighting cycle
- [ ] Interaction system (press Space near objects)
