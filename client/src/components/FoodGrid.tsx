import { FOOD_EMOJIS } from '../types';

export default function FoodGrid({
  selected,
  onAdd,
  saving,
}: {
  selected: string[];
  onAdd: (emoji: string) => void;
  saving: boolean;
}) {
  return (
    <div style={styles.grid}>
      {FOOD_EMOJIS.map((emoji) => {
        const count = selected.filter((e) => e === emoji).length;
        const isSelected = count > 0;
        return (
          <button
            key={emoji}
            style={{
              ...styles.btn,
              ...(isSelected ? styles.selected : {}),
              ...(saving ? styles.disabled : {}),
            }}
            onClick={() => onAdd(emoji)}
            disabled={saving}
            aria-label={count > 0 ? `${emoji} selected ${count}` : emoji}
          >
            {emoji}
            {count > 1 && (
              <span style={{ ...styles.badge, background: 'var(--text)', color: 'var(--bg)' }}>
                {count}
              </span>
            )}
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
    position: 'relative',
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
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    padding: '0 4px',
    borderRadius: 9,
    fontSize: '0.7rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
};
