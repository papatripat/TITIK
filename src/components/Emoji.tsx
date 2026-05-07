/**
 * Emoji component that renders emoji using Twemoji CDN images
 * instead of native Unicode emojis for consistent cross-platform rendering.
 */

type EmojiProps = {
  code: string;
  alt?: string;
  size?: number;
  className?: string;
};

// Map of emoji shortcodes to their Unicode codepoints for Twemoji CDN
const EMOJI_MAP: Record<string, { codepoint: string; alt: string }> = {
  // Navigation & UI
  'home': { codepoint: '1f3e0', alt: 'Home' },
  'camera': { codepoint: '1f4f8', alt: 'Camera' },
  'camera-simple': { codepoint: '1f4f7', alt: 'Camera' },
  'map': { codepoint: '1f5fa', alt: 'Map' },
  'pin': { codepoint: '1f4cd', alt: 'Pin' },
  'pushpin': { codepoint: '1f4cc', alt: 'Pushpin' },
  'hourglass': { codepoint: '23f3', alt: 'Hourglass' },
  'warning': { codepoint: '26a0', alt: 'Warning' },
  'check': { codepoint: '2705', alt: 'Check' },
  'refresh': { codepoint: '1f504', alt: 'Refresh' },
  'bulb': { codepoint: '1f4a1', alt: 'Lightbulb' },

  // Environmental & Waste
  'globe': { codepoint: '1f30d', alt: 'Globe' },
  'recycle': { codepoint: '267b', alt: 'Recycle' },
  'leaf': { codepoint: '1f343', alt: 'Leaf' },
  'trash': { codepoint: '1f5d1', alt: 'Trash' },

  // Actions & Data
  'send': { codepoint: '1f4e4', alt: 'Send' },
  'chart': { codepoint: '1f4ca', alt: 'Chart' },
  'target': { codepoint: '1f3af', alt: 'Target' },
  'calendar': { codepoint: '1f4c5', alt: 'Calendar' },
  'brain': { codepoint: '1f9e0', alt: 'Brain' },

  // Admin
  'shield': { codepoint: '1f6e1', alt: 'Shield' },
  'lock': { codepoint: '1f512', alt: 'Lock' },
  'key': { codepoint: '1f511', alt: 'Key' },
  'cross': { codepoint: '274c', alt: 'Cross' },
};

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72';

export default function Emoji({ code, alt, size = 20, className = '' }: EmojiProps) {
  const emoji = EMOJI_MAP[code];
  if (!emoji) {
    // Fallback: render the code as text
    return <span className={className}>{code}</span>;
  }

  return (
    <img
      src={`${TWEMOJI_BASE}/${emoji.codepoint}.png`}
      alt={alt || emoji.alt}
      width={size}
      height={size}
      className={`inline-block align-text-bottom ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      draggable={false}
    />
  );
}
