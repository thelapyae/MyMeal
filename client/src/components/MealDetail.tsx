import { motion, AnimatePresence } from 'framer-motion';
import type { Meal } from '../types';

export default function MealDetail({
  date,
  meals,
  onClose,
}: {
  date: string;
  meals: Meal[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        style={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          style={{ ...styles.sheet, background: 'var(--surface)' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ ...styles.handle, background: 'var(--border-strong)' }} />
          <div style={styles.headerRow}>
            <h2 style={{ ...styles.title, color: 'var(--text)' }}>{date}</h2>
            <span style={{ ...styles.count, color: 'var(--text-faint)' }}>{meals.length}</span>
          </div>

          {meals.length === 0 ? (
            <p style={{ ...styles.empty, color: 'var(--text-faint)' }}>no meals</p>
          ) : (
            <div style={styles.list}>
              {meals.map((meal) => (
                <div key={meal.id} style={{ ...styles.card, borderColor: 'var(--border)', background: 'var(--elevated)' }}>
                  <span style={styles.emoji}>{meal.emoji}</span>
                  <div style={styles.info}>
                    <span style={{ ...styles.name, color: 'var(--text)' }}>{meal.name}</span>
                    <span style={{ ...styles.badge, color: 'var(--text-muted)' }}>{meal.mealType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
    borderRadius: '20px 20px 0 0',
    padding: '12px 20px 32px',
    maxHeight: '60vh',
    overflowY: 'auto',
    borderTop: '1px solid var(--border)',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    margin: '0 auto 16px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
  },
  count: {
    fontSize: '0.8rem',
  },
  empty: {
    textAlign: 'center',
    fontSize: '0.85rem',
    padding: '20px 0',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  emoji: {
    fontSize: '1.3rem',
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  name: {
    fontSize: '0.85rem',
    fontWeight: 450,
  },
  badge: {
    fontSize: '0.6rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
  },
};
