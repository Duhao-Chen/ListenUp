import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { v4 as uuid } from 'uuid';
import type {
  PlayerState,
  ChatMessage,
  ServerToClientEvents,
  ClientToServerEvents,
  CharacterAppearance,
} from '../../shared/types';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: '*' },
});

// ---- Room State ----
const rooms = new Map<string, Map<string, PlayerState>>();

function getRoom(roomId: string): Map<string, PlayerState> {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }
  return rooms.get(roomId)!;
}

// ---- Socket Handling ----
io.on('connection', (socket) => {
  let currentPlayer: PlayerState | null = null;

  socket.on('join-room', (data) => {
    const { name, appearance, room } = data;

    currentPlayer = {
      id: socket.id,
      name,
      appearance,
      position: { x: 25 * 32 + 16, y: 30 * 32 + 16 }, // Campus spawn point
      direction: 'down',
      isMoving: false,
      room,
    };

    const roomPlayers = getRoom(room);
    roomPlayers.set(socket.id, currentPlayer);
    socket.join(room);

    // Send full room state to the joining player
    const players: Record<string, PlayerState> = {};
    roomPlayers.forEach((p, id) => {
      players[id] = p;
    });

    socket.emit('room-state', { id: room, name: room, players });

    // Notify everyone else
    socket.to(room).emit('player-joined', currentPlayer);

    console.log(
      `✦ ${name} joined "${room}" (${roomPlayers.size} ${roomPlayers.size === 1 ? 'learner' : 'learners'})`
    );
  });

  socket.on('move', (data) => {
    if (!currentPlayer) return;
    currentPlayer.position = data.position;
    currentPlayer.direction = data.direction;
    currentPlayer.isMoving = data.isMoving;

    socket.to(currentPlayer.room).emit('player-moved', {
      id: socket.id,
      position: data.position,
      direction: data.direction,
      isMoving: data.isMoving,
    });
  });

  socket.on('chat', (text) => {
    if (!currentPlayer) return;
    const message: ChatMessage = {
      id: uuid(),
      playerId: socket.id,
      playerName: currentPlayer.name,
      text,
      timestamp: Date.now(),
    };
    io.to(currentPlayer.room).emit('chat-message', message);
  });

  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  socket.on('disconnect', () => {
    if (currentPlayer) {
      const roomPlayers = getRoom(currentPlayer.room);
      roomPlayers.delete(socket.id);
      socket.to(currentPlayer.room).emit('player-left', socket.id);
      console.log(
        `✧ ${currentPlayer.name} left "${currentPlayer.room}" (${roomPlayers.size} remaining)`
      );

      if (roomPlayers.size === 0) {
        rooms.delete(currentPlayer.room);
      }
    }
  });
});

// ---- Serve Client in Production ----
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ---- Start ----
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║                                          ║');
  console.log('  ║   🏫 ListenUp Learning Campus            ║');
  console.log(`  ║   Running on port ${PORT}                   ║`);
  console.log('  ║   Built with love for HK learners        ║');
  console.log('  ║                                          ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
