// ============================================================
// App — The Root
// Orchestrates the full lifecycle: login → connect → play.
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CharacterAppearance, PlayerState, ChatMessage, Position, Direction } from '@shared/types';
import { LoginScreen } from './components/LoginScreen';
import { GameView } from './components/GameView';
import { SocketManager } from './network/socket';
import { WebRTCManager } from './network/webrtc';
import { generateCampusMap } from './maps/campus';
import type { GameEngine } from './engine/GameEngine';

type AppState = 'login' | 'connecting' | 'playing';

const campusMap = generateCampusMap();

export function App() {
  const [state, setState] = useState<AppState>('login');
  const [localPlayerId, setLocalPlayerId] = useState('');
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const socketRef = useRef<SocketManager | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const proximityInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      webrtcRef.current?.destroy();
      if (proximityInterval.current) clearInterval(proximityInterval.current);
    };
  }, []);

  const handleJoin = useCallback((name: string, appearance: CharacterAppearance) => {
    setState('connecting');

    const socket = new SocketManager();
    socketRef.current = socket;

    const webrtc = new WebRTCManager();
    webrtcRef.current = webrtc;

    // Wire WebRTC signaling through Socket.IO
    webrtc.setSignalCallback((to, signal) => {
      socket.sendSignal(to, signal);
    });

    socket.onConnect(() => {
      socket.joinRoom(name, appearance);
    });

    socket.onRoomState((roomState) => {
      setLocalPlayerId(socket.id);
      setPlayers(roomState.players);
      setState('playing');

      // Start proximity-based WebRTC updates
      proximityInterval.current = setInterval(() => {
        if (engineRef.current && webrtcRef.current) {
          const local = engineRef.current.getLocalPlayer();
          const allPlayers = engineRef.current.getPlayers();
          if (local) {
            webrtcRef.current.updateProximity(local, allPlayers);
          }
        }
      }, 1000);
    });

    socket.onPlayerJoined((player) => {
      if (engineRef.current) {
        engineRef.current.addPlayer(player);
      }
      setPlayers((prev) => ({ ...prev, [player.id]: player }));
    });

    socket.onPlayerLeft((playerId) => {
      if (engineRef.current) {
        engineRef.current.removePlayer(playerId);
      }
      setPlayers((prev) => {
        const next = { ...prev };
        delete next[playerId];
        return next;
      });
    });

    socket.onPlayerMoved((data) => {
      if (engineRef.current) {
        engineRef.current.updateRemotePlayer(data.id, data.position, data.direction, data.isMoving);
      }
    });

    socket.onChatMessage((message) => {
      setMessages((prev) => [...prev.slice(-100), message]); // Keep last 100 messages
    });

    socket.onSignal((data) => {
      const allPlayers = engineRef.current?.getPlayers();
      const senderName = allPlayers?.get(data.from)?.name || 'Unknown';
      webrtcRef.current?.handleSignal(data.from, data.signal, senderName);
    });

    socket.connect();
  }, []);

  const handleMove = useCallback((pos: Position, dir: Direction, isMoving: boolean) => {
    socketRef.current?.sendMove(pos, dir, isMoving);
  }, []);

  const handleSendChat = useCallback((text: string) => {
    socketRef.current?.sendChat(text);
  }, []);

  return (
    <div className="app">
      {state === 'login' && (
        <LoginScreen onJoin={handleJoin} />
      )}

      {state === 'connecting' && (
        <div className="connecting-screen">
          <div className="connecting-content">
            <div className="connecting-spinner" />
            <p>Entering campus...</p>
            <p className="connecting-chinese">正在進入校園...</p>
          </div>
        </div>
      )}

      {state === 'playing' && (
        <GameView
          map={campusMap}
          localPlayerId={localPlayerId}
          initialPlayers={players}
          messages={messages}
          onSendChat={handleSendChat}
          onMove={handleMove}
          engineRef={engineRef}
          webrtcManager={webrtcRef.current}
        />
      )}
    </div>
  );
}
