// ============================================================
// Chat Panel
// A warm, glassmorphic chat interface.
// Because learning is better when you can talk.
// ============================================================

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@shared/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onFocusChange: (focused: boolean) => void;
  localPlayerId: string;
}

export function ChatPanel({ messages, onSend, onFocusChange, localPlayerId }: ChatPanelProps) {
  const [text, setText] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
    e.stopPropagation();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-panel glass-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="chat-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="chat-title">Chat</span>
        <span className="chat-toggle">{collapsed ? '+' : '-'}</span>
      </div>

      {!collapsed && (
        <>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <p>Say hello! Walk near others to video chat.</p>
                <p className="chat-empty-chinese">打個招呼吧！走近其他人開始視頻聊天。</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.playerId === localPlayerId ? 'own' : ''}`}
              >
                <span className="chat-sender">{msg.playerName}</span>
                <span className="chat-text">{msg.text}</span>
                <span className="chat-time">{formatTime(msg.timestamp)}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => onFocusChange(true)}
              onBlur={() => onFocusChange(false)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... / 輸入訊息..."
              className="chat-input"
              maxLength={200}
            />
            <button type="submit" className="chat-send" disabled={!text.trim()}>
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
