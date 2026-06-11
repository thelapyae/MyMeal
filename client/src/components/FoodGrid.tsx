import { useState } from 'react';

const FOOD_EMOJIS = [
  '🍗', '🥩', '🍖', '🐟', '🐠', '🍣', '🥓', '🍔',
  '🥚', '🥛', '🧀', '🥗', '🥦', '🍅', '🥑', '🍞',
  '🥐', '🍝', '🍜', '🍲', '🥣', '☕', '🧃', '🍎',
  '🍌', '🍇', '🥝', '🥕', '🧁', '🍪', '🥜', '🌰'
];

export default function FoodGrid({
  onSelect,
  saving,
}: {
  onSelect: (emoji: string) => void;
  saving: string | null;
}) {
  return (
    <div style={styles.grid}>
      {FOOD_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          style={{
            ...styles.emojiBtn,
            ...(saving === emoji ? styles.saving : {}),
          }}
          onClick={() => onSelect(emoji)}
          disabled={saving !== null}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
    padding: '0 4px',
  },
  emojiBtn: {
    fontSize: '2rem',
    padding: '14px 0',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    lineHeight: 1,
    WebkitTapHighlightColor: 'transparent',
  },
  saving: {
    opacity: 0.3,
    transform: 'scale(0.9)',
  },
};
