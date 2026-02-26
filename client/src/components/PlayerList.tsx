// ============================================================
// Player List
// Shows who's on campus — a gentle reminder
// that you're never alone here.
// ============================================================

import type { PlayerState } from '@shared/types';

interface PlayerListProps {
  players: Map<string, PlayerState>;
  localPlayerId: string;
}

export function PlayerList({ players, localPlayerId }: PlayerListProps) {
  const playerArray = Array.from(players.values());

  return (
    <div className="player-list glass-panel">
      <div className="player-list-header">
        <span className="player-list-title">On Campus</span>
        <span className="player-count">{playerArray.length}</span>
      </div>
      <div className="player-list-items">
        {playerArray.map((player) => (
          <div
            key={player.id}
            className={`player-item ${player.id === localPlayerId ? 'local' : ''}`}
          >
            <div
              className="player-avatar-dot"
              style={{ backgroundColor: player.appearance.shirtColor }}
            />
            <span className="player-name">
              {player.name}
              {player.id === localPlayerId && ' (you)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
