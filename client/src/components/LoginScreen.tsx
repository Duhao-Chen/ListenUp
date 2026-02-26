// ============================================================
// Login Screen
// The welcoming gateway. Beautiful, warm, inviting.
// Bilingual (English / Chinese) for Hong Kong learners.
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import type { CharacterAppearance } from '@shared/types';
import { generateCharacterSpritesheet, APPEARANCE_PRESETS } from '../sprites/characters';

const SKIN_TONES = ['#FDDCB5', '#F5C5A3', '#E8B88A', '#D4956B', '#C68642', '#8D5524'];
const HAIR_COLORS = ['#1A1A1A', '#2C1810', '#5A3620', '#8B4513', '#C0392B', '#D4A843', '#E8E8E8'];
const SHIRT_COLORS = ['#4A90D9', '#E74C3C', '#2ECC71', '#9B59B6', '#F39C12', '#1ABC9C', '#E67E22', '#34495E'];
const HAIR_STYLES: CharacterAppearance['hairStyle'][] = ['short', 'medium', 'long', 'ponytail', 'spiky', 'bob'];
const EYE_COLORS = ['#2C1810', '#1A1A1A', '#634E34', '#3D6B50', '#27AE60', '#2980B9'];

interface LoginScreenProps {
  onJoin: (name: string, appearance: CharacterAppearance) => void;
}

export function LoginScreen({ onJoin }: LoginScreenProps) {
  const [name, setName] = useState('');
  const [appearance, setAppearance] = useState<CharacterAppearance>(
    APPEARANCE_PRESETS[Math.floor(Math.random() * APPEARANCE_PRESETS.length)]
  );
  const previewRef = useRef<HTMLCanvasElement>(null);

  // Render character preview
  const renderPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sheet = generateCharacterSpritesheet(appearance);

    // Draw character facing down, frame 0, scaled up 3x
    const scale = 3;
    ctx.drawImage(
      sheet,
      0, 0, 32, 48,
      (canvas.width - 32 * scale) / 2,
      (canvas.height - 48 * scale) / 2,
      32 * scale,
      48 * scale
    );
  }, [appearance]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim(), appearance);
    }
  };

  const ColorPicker = ({
    label,
    colors,
    selected,
    onChange,
  }: {
    label: string;
    colors: string[];
    selected: string;
    onChange: (c: string) => void;
  }) => (
    <div className="color-picker">
      <label>{label}</label>
      <div className="color-options">
        {colors.map((c) => (
          <button
            key={c}
            className={`color-swatch ${c === selected ? 'selected' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
            type="button"
            aria-label={`Select color ${c}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="login-screen">
      {/* Floating particles background */}
      <div className="login-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">
            <span className="title-icon">&#x1F3EB;</span>
            ListenUp
          </h1>
          <p className="login-subtitle">Hong Kong Learning Campus</p>
          <p className="login-subtitle-chinese">香港學習園地</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Character Preview */}
          <div className="preview-section">
            <canvas
              ref={previewRef}
              width={128}
              height={160}
              className="character-preview"
            />
          </div>

          {/* Name Input */}
          <div className="name-input-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name / 你的名字"
              className="name-input"
              maxLength={20}
              autoFocus
            />
          </div>

          {/* Appearance Customization */}
          <div className="customization-grid">
            <ColorPicker
              label="Skin"
              colors={SKIN_TONES}
              selected={appearance.skinTone}
              onChange={(c) => setAppearance({ ...appearance, skinTone: c })}
            />
            <ColorPicker
              label="Hair"
              colors={HAIR_COLORS}
              selected={appearance.hairColor}
              onChange={(c) => setAppearance({ ...appearance, hairColor: c })}
            />
            <ColorPicker
              label="Shirt"
              colors={SHIRT_COLORS}
              selected={appearance.shirtColor}
              onChange={(c) => setAppearance({ ...appearance, shirtColor: c })}
            />
            <ColorPicker
              label="Eyes"
              colors={EYE_COLORS}
              selected={appearance.eyeColor}
              onChange={(c) => setAppearance({ ...appearance, eyeColor: c })}
            />
          </div>

          {/* Hair Style */}
          <div className="hair-style-picker">
            <label>Hair Style</label>
            <div className="style-options">
              {HAIR_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`style-btn ${appearance.hairStyle === style ? 'selected' : ''}`}
                  onClick={() => setAppearance({ ...appearance, hairStyle: style })}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Join Button */}
          <button
            type="submit"
            className="join-button"
            disabled={!name.trim()}
          >
            <span>Enter Campus</span>
            <span className="join-chinese">進入校園</span>
          </button>
        </form>

        <p className="login-footer">
          Use WASD or Arrow Keys to move. Walk near others to talk.
        </p>
      </div>
    </div>
  );
}
