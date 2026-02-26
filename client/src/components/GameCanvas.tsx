// ============================================================
// Game Canvas
// The window into our world. Manages the HTML5 canvas
// and the game engine lifecycle.
// ============================================================

import { useRef, useEffect, useCallback } from 'react';
import type { PlayerState, Position, Direction, GameMap } from '@shared/types';
import { GameEngine } from '../engine/GameEngine';

interface GameCanvasProps {
  map: GameMap;
  localPlayerId: string;
  players: Record<string, PlayerState>;
  onMove: (pos: Position, dir: Direction, isMoving: boolean) => void;
  onZoneChange: (name: string, chinese: string) => void;
  chatFocused: boolean;
  engineRef: React.MutableRefObject<GameEngine | null>;
}

export function GameCanvas({
  map,
  localPlayerId,
  players,
  onMove,
  onZoneChange,
  chatFocused,
  engineRef,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.getContext('2d')!.scale(dpr, dpr);
    engineRef.current.resize(rect.width, rect.height);
  }, [engineRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Create engine
    const engine = new GameEngine(canvas, map);
    engineRef.current = engine;

    engine.setOnMove(onMove);
    engine.setOnZoneChange(onZoneChange);
    engine.start(localPlayerId, players);

    // Handle resize
    window.addEventListener('resize', handleResize);

    return () => {
      engine.stop();
      engineRef.current = null;
      window.removeEventListener('resize', handleResize);
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update chat focus
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setChatFocused(chatFocused);
    }
  }, [chatFocused, engineRef]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      tabIndex={0}
    />
  );
}
