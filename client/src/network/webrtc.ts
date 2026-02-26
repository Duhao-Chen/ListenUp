// ============================================================
// WebRTC Manager
// Proximity-based video/audio connections.
// Walk near someone → see and hear them. Walk away → disconnect.
// It's like real life, but virtual.
// ============================================================

import SimplePeer from 'simple-peer';
import type { PlayerState, Position } from '@shared/types';

const PROXIMITY_CONNECT = 128;    // 4 tiles — start connecting
const PROXIMITY_DISCONNECT = 192; // 6 tiles — disconnect (hysteresis)

export interface PeerStream {
  peerId: string;
  peerName: string;
  stream: MediaStream;
}

interface PeerConnection {
  peer: SimplePeer.Instance;
  peerId: string;
  peerName: string;
  stream: MediaStream | null;
  connected: boolean;
}

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peers = new Map<string, PeerConnection>();
  private signalCallback: ((to: string, signal: unknown) => void) | null = null;
  private mediaRequested = false;

  setSignalCallback(cb: (to: string, signal: unknown) => void) {
    this.signalCallback = cb;
  }

  async requestMedia(): Promise<MediaStream | null> {
    if (this.localStream) return this.localStream;
    if (this.mediaRequested) return null;

    this.mediaRequested = true;
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 160, height: 120, frameRate: 15 },
        audio: true,
      });
      return this.localStream;
    } catch (err) {
      console.warn('Could not access camera/mic:', err);
      // Try audio only
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        return this.localStream;
      } catch {
        console.warn('Could not access microphone either');
        this.mediaRequested = false;
        return null;
      }
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getPeerStreams(): PeerStream[] {
    const streams: PeerStream[] = [];
    this.peers.forEach((conn) => {
      if (conn.stream && conn.connected) {
        streams.push({
          peerId: conn.peerId,
          peerName: conn.peerName,
          stream: conn.stream,
        });
      }
    });
    return streams;
  }

  // Called each frame to update proximity connections
  async updateProximity(
    localPlayer: PlayerState,
    remotePlayers: Map<string, PlayerState>
  ) {
    const localPos = localPlayer.position;

    for (const [id, remote] of remotePlayers) {
      if (id === localPlayer.id) continue;

      const dist = distance(localPos, remote.position);
      const existingPeer = this.peers.get(id);

      if (dist <= PROXIMITY_CONNECT && !existingPeer) {
        // Close enough — initiate connection
        await this.connectToPeer(id, remote.name, true);
      } else if (dist > PROXIMITY_DISCONNECT && existingPeer) {
        // Too far — disconnect
        this.disconnectPeer(id);
      }
    }

    // Clean up peers who left
    for (const [id] of this.peers) {
      if (!remotePlayers.has(id)) {
        this.disconnectPeer(id);
      }
    }
  }

  private async connectToPeer(peerId: string, peerName: string, initiator: boolean) {
    if (this.peers.has(peerId)) return;

    const stream = await this.requestMedia();

    const peer = new SimplePeer({
      initiator,
      stream: stream || undefined,
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    const conn: PeerConnection = {
      peer,
      peerId,
      peerName,
      stream: null,
      connected: false,
    };

    peer.on('signal', (signal) => {
      if (this.signalCallback) {
        this.signalCallback(peerId, signal);
      }
    });

    peer.on('stream', (remoteStream) => {
      conn.stream = remoteStream;
      conn.connected = true;
    });

    peer.on('connect', () => {
      conn.connected = true;
    });

    peer.on('close', () => {
      this.peers.delete(peerId);
    });

    peer.on('error', (err) => {
      console.warn(`WebRTC error with ${peerName}:`, err.message);
      this.peers.delete(peerId);
    });

    this.peers.set(peerId, conn);
  }

  // Handle incoming signal from another peer
  async handleSignal(from: string, signal: unknown, fromName: string) {
    let conn = this.peers.get(from);

    if (!conn) {
      // They initiated — we respond
      await this.connectToPeer(from, fromName, false);
      conn = this.peers.get(from);
    }

    if (conn) {
      try {
        conn.peer.signal(signal as SimplePeer.SignalData);
      } catch (err) {
        console.warn('Signal error:', err);
      }
    }
  }

  private disconnectPeer(peerId: string) {
    const conn = this.peers.get(peerId);
    if (conn) {
      try {
        conn.peer.destroy();
      } catch {}
      this.peers.delete(peerId);
    }
  }

  destroy() {
    this.peers.forEach((conn) => {
      try {
        conn.peer.destroy();
      } catch {}
    });
    this.peers.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
  }
}

function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
