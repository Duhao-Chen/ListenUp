// ============================================================
// Video Overlay
// Floating video panels for proximity-based conversations.
// When you walk near someone, their video appears — like magic.
// ============================================================

import { useEffect, useRef } from 'react';

interface VideoStream {
  peerId: string;
  peerName: string;
  stream: MediaStream;
}

interface VideoOverlayProps {
  streams: VideoStream[];
  localStream: MediaStream | null;
}

function VideoPanel({ stream, name, isLocal }: { stream: MediaStream; name: string; isLocal: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`video-panel glass-panel ${isLocal ? 'local-video' : ''}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="video-element"
      />
      <div className="video-name-tag">
        {name}{isLocal ? ' (you)' : ''}
      </div>
    </div>
  );
}

export function VideoOverlay({ streams, localStream }: VideoOverlayProps) {
  if (!localStream && streams.length === 0) return null;

  return (
    <div className="video-overlay">
      {localStream && (
        <VideoPanel stream={localStream} name="You" isLocal={true} />
      )}
      {streams.map((s) => (
        <VideoPanel
          key={s.peerId}
          stream={s.stream}
          name={s.peerName}
          isLocal={false}
        />
      ))}
    </div>
  );
}
