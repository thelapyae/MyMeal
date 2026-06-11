import type { ViewMode } from '../types';

const views: { key: ViewMode; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'week', label: 'Week' },
  { key: 'year', label: 'Year' },
];

export default function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div style={styles.container}>
      {views.map((v) => (
        <button
          key={v.key}
          onClick={() => onChange(v.key)}
          style={{
            ...styles.button,
            ...(value === v.key ? styles.active : {}),
          }}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  button: {
    flex: 1,
    padding: '8px 16px',
    border: 'none',
    borderRadius: 10,
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    WebkitTapHighlightColor: 'transparent',
  },
  active: {
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
  },
};
