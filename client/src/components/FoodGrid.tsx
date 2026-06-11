import { FOOD_EMOJIS } from '../types';

export default function FoodGrid({
  selected,
  onToggle,
  saving,
}: {
  selected: string[];
  onToggle: (emoji: string) => void;
  saving: boolean;
}) {
  return (
    <div style={styles.grid}>
      {FOOD_EMOJIS.map((emoji) => {
        const isSelected = selected.includes(emoji);
        return (
          <button
            key={emoji}
            style={{
              ...styles.btn,
              ...(isSelected ? styles.selected : {}),
              ...(saving ? styles.disabled : {}),
            }}
            onClick={() => onToggle(emoji)}
            disabled={saving}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
  },
  btn: {
    fontSize: '2rem',
    padding: '14px 0',
    borderRadius: 16,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    cursor: 'pointer',
    transition: 'all 0.12s',
    lineHeight: 1,
    WebkitTapHighlightColor: 'transparent',
    opacity: 1,
  },
  selected: {
    border: '1px solid var(--text)',
    background: 'var(--elevated)',
    transform: 'scale(1.05)',
  },
  disabled: {
    opacity: 0.3,
    pointerEvents: 'none',
  },
};
