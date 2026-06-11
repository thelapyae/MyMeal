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
          style={styles.sheet}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.handle} />
          <div style={styles.headerRow}>
            <h2 style={styles.title}>{date}</h2>
            <span style={styles.count}>{meals.length}</span>
          </div>

          {meals.length === 0 ? (
            <p style={styles.empty}>no meals</p>
          ) : (
            <div style={styles.list}>
              {meals.map((meal) => (
                <div key={meal.id} style={styles.card}>
                  <span style={styles.emoji}>{meal.emoji}</span>
                  <div style={styles.info}>
                    <span style={styles.name}>{meal.name}</span>
                    <span style={styles.badge}>{meal.mealType}</span>
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
    background: 'rgba(0,0,0,0.6)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
    background: '#0a0a0a',
    borderRadius: '20px 20px 0 0',
    padding: '12px 20px 32px',
    maxHeight: '60vh',
    overflowY: 'auto',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.12)',
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
    color: '#fff',
    margin: 0,
  },
  count: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.3)',
  },
  empty: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.2)',
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
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
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
    color: '#fff',
    fontWeight: 450,
  },
  badge: {
    fontSize: '0.6rem',
    color: 'rgba(255,255,255,0.35)',
    fontWeight: 500,
    letterSpacing: '0.05em',
  },
};
