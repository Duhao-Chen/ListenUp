// ============================================================
// Game View
// The main game interface — canvas, HUD, chat, video, players.
// Everything comes together here.
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import type { PlayerState, ChatMessage, GameMap, Position, Direction } from '@shared/types';
import { GameCanvas } from './GameCanvas';
import { ChatPanel } from './ChatPanel';
import { PlayerList } from './PlayerList';
import { VideoOverlay } from './VideoOverlay';
import type { GameEngine } from '../engine/GameEngine';
import type { WebRTCManager, PeerStream } from '../network/webrtc';

interface GameViewProps {
  map: GameMap;
  localPlayerId: string;
  initialPlayers: Record<string, PlayerState>;
  messages: ChatMessage[];
  onSendChat: (text: string) => void;
  onMove: (pos: Position, dir: Direction, isMoving: boolean) => void;
  engineRef: React.MutableRefObject<GameEngine | null>;
  webrtcManager: WebRTCManager | null;
}

export function GameView({
  map,
  localPlayerId,
  initialPlayers,
  messages,
  onSendChat,
  onMove,
  engineRef,
  webrtcManager,
}: GameViewProps) {
  const [chatFocused, setChatFocused] = useState(false);
  const [zoneName, setZoneName] = useState('Campus');
  const [zoneChinese, setZoneChinese] = useState('校園');
  const [playerMap, setPlayerMap] = useState<Map<string, PlayerState>>(new Map());
  const [peerStreams, setPeerStreams] = useState<PeerStream[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Track players in component state for PlayerList
  useEffect(() => {
    const map = new Map<string, PlayerState>();
    for (const [id, p] of Object.entries(initialPlayers)) {
      map.set(id, p);
    }
    setPlayerMap(map);
  }, [initialPlayers]);

  // Update player map from engine periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (engineRef.current) {
        const players = engineRef.current.getPlayers();
        setPlayerMap(new Map(players));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [engineRef]);

  // Update WebRTC streams
  useEffect(() => {
    if (!webrtcManager) return;
    const interval = setInterval(() => {
      setPeerStreams([...webrtcManager.getPeerStreams()]);
      setLocalStream(webrtcManager.getLocalStream());
    }, 500);
    return () => clearInterval(interval);
  }, [webrtcManager]);

  const handleZoneChange = useCallback((name: string, chinese: string) => {
    setZoneName(name);
    setZoneChinese(chinese);
  }, []);

  return (
    <div className="game-view">
      {/* The World */}
      <GameCanvas
        map={map}
        localPlayerId={localPlayerId}
        players={initialPlayers}
        onMove={onMove}
        onZoneChange={handleZoneChange}
        chatFocused={chatFocused}
        engineRef={engineRef}
      />

      {/* HUD — Zone Name */}
      <div className="hud-zone glass-panel">
        <span className="zone-name">{zoneName}</span>
        <span className="zone-chinese">{zoneChinese}</span>
      </div>

      {/* HUD — Controls hint */}
      <div className="hud-controls glass-panel">
        WASD to move &middot; Enter to chat
      </div>

      {/* Player List */}
      <PlayerList players={playerMap} localPlayerId={localPlayerId} />

      {/* Chat */}
      <ChatPanel
        messages={messages}
        onSend={onSendChat}
        onFocusChange={setChatFocused}
        localPlayerId={localPlayerId}
      />

      {/* Video Chat */}
      <VideoOverlay
        streams={peerStreams.map((ps) => ({
          peerId: ps.peerId,
          peerName: ps.peerName,
          stream: ps.stream,
        }))}
        localStream={localStream}
      />
    </div>
  );
}
