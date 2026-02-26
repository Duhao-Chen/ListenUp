// ============================================================
// Socket Manager
// Connects to the server via Socket.IO.
// Handles all real-time communication.
// ============================================================

import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  CharacterAppearance,
  Position,
  Direction,
} from '@shared/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class SocketManager {
  private socket: TypedSocket;

  constructor() {
    // In development, Vite proxies /socket.io to the server
    // In production, the server serves the client
    const url = import.meta.env.DEV ? 'http://localhost:3001' : '/';
    this.socket = io(url, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }

  connect() {
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  get id(): string {
    return this.socket.id || '';
  }

  get connected(): boolean {
    return this.socket.connected;
  }

  // ---- Emit Events ----

  joinRoom(name: string, appearance: CharacterAppearance, room: string = 'campus') {
    this.socket.emit('join-room', { name, appearance, room });
  }

  sendMove(position: Position, direction: Direction, isMoving: boolean) {
    this.socket.emit('move', { position, direction, isMoving });
  }

  sendChat(text: string) {
    this.socket.emit('chat', text);
  }

  sendSignal(to: string, signal: unknown) {
    this.socket.emit('signal', { to, signal });
  }

  // ---- Event Listeners ----

  onConnect(cb: () => void) {
    this.socket.on('connect', cb);
  }

  onDisconnect(cb: () => void) {
    this.socket.on('disconnect', cb);
  }

  onRoomState(cb: Parameters<ServerToClientEvents['room-state']>[0] extends infer P ? (state: P) => void : never) {
    this.socket.on('room-state', cb as any);
  }

  onPlayerJoined(cb: Parameters<ServerToClientEvents['player-joined']>[0] extends infer P ? (player: P) => void : never) {
    this.socket.on('player-joined', cb as any);
  }

  onPlayerLeft(cb: (playerId: string) => void) {
    this.socket.on('player-left', cb);
  }

  onPlayerMoved(cb: (data: { id: string; position: Position; direction: Direction; isMoving: boolean }) => void) {
    this.socket.on('player-moved', cb);
  }

  onChatMessage(cb: Parameters<ServerToClientEvents['chat-message']>[0] extends infer P ? (message: P) => void : never) {
    this.socket.on('chat-message', cb as any);
  }

  onSignal(cb: (data: { from: string; signal: unknown }) => void) {
    this.socket.on('signal', cb);
  }

  // Cleanup
  removeAllListeners() {
    this.socket.removeAllListeners();
  }
}
