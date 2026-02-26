# ListenUp

A beautiful Gather.town-inspired virtual learning campus built for Hong Kong.

Walk around a 2D pixel-art campus, video chat with nearby learners, and collaborate in classrooms, the library, or the courtyard cafe.

## Features

- **2D Pixel Art World** — Handcrafted chibi characters, lush trees, cherry blossoms, and Hong Kong-inspired decorations (lanterns, Bauhinia flowers), all generated programmatically
- **Real-time Multiplayer** — See other learners move through the campus in real time via Socket.IO
- **Proximity Video Chat** — Walk near someone and WebRTC video/audio activates automatically
- **Text Chat** — Campus-wide messaging
- **Bilingual UI** — English and Traditional Chinese throughout
- **Named Zones** — HUD shows your location (Classroom A / 課室 A, Library / 圖書館, Cafe / 咖啡廳, Garden / 花園)
- **Character Customization** — Choose your skin tone, hair style, clothing colors, and eye color
- **Smooth Camera** — Lerp-following camera with ambient vignette and floating cherry blossom petals

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Run both server and client in development mode
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

## Production Build

```bash
cd client && npm run build
cd ../server && npm start
```

The server serves the built client at port 3001.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Rendering | HTML5 Canvas (custom 2D engine) |
| Sprites | Programmatic pixel art generation |
| Server | Express + Socket.IO |
| Video | WebRTC via simple-peer |
| Styling | CSS glassmorphism + Noto Sans HK |

## Campus Map

The virtual campus (50x40 tiles) includes:
- **Garden** (花園) — Cherry blossom trees, pond with bridge, benches
- **Classroom A** (課室 A) — Desks, whiteboard, podium
- **Classroom B** (課室 B) — Computer lab with monitors
- **Library** (圖書館) — Bookshelves, reading tables, warm lamps
- **Cafe** (咖啡廳) — Round tables, plants
- **Courtyard** (中庭) — Fountain, lanterns, Bauhinia flowers

## Controls

- **WASD / Arrow Keys** — Move your character
- **Enter** — Focus chat input
- **Escape** — Unfocus chat

## License

MIT
