import type { Macros } from '../macros';

const MACRO_META: { key: keyof Macros; label: string; color: string }[] = [
  { key: 'protein', label: 'protein', color: '#e57373' },
  { key: 'carbs', label: 'carbs', color: '#64b5f6' },
  { key: 'fat', label: 'fat', color: '#ffb74d' },
];

export default function MacroBar({ macros }: { macros: Macros }) {
  const total = macros.protein + macros.carbs + macros.fat;

  return (
    <div style={{ ...styles.bar, background: 'var(--surface)', borderTopColor: 'var(--border)' }}>
      <div style={styles.track}>
        {total > 0 &&
          MACRO_META.map(({ key, color }) => (
            <div
              key={key}
              style={{
                width: `${(macros[key] / total) * 100}%`,
                background: color,
                height: '100%',
              }}
            />
          ))}
      </div>
      <div style={styles.stats}>
        {MACRO_META.map(({ key, label, color }) => (
          <div key={key} style={styles.stat}>
            <span style={{ ...styles.dot, background: color }} />
            <span style={{ ...styles.value, color: 'var(--text)' }}>
              {Math.round(macros[key])}
              <span style={{ ...styles.unit, color: 'var(--text-faint)' }}>g</span>
            </span>
            <span style={{ ...styles.label, color: 'var(--text-faint)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    padding: '12px 16px',
    paddingBottom: 'calc(12px + var(--safe-bottom))',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  track: {
    display: 'flex',
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    background: 'var(--elevated)',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  value: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1,
  },
  unit: {
    fontSize: '0.7rem',
    fontWeight: 500,
    marginLeft: 1,
  },
  label: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
};
