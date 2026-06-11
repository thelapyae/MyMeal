import { motion, AnimatePresence } from 'framer-motion';
import type { Meal } from '../types';

const COLORS: Record<string, string> = {
  Breakfast: '#f59e0b',
  Lunch: '#10b981',
  Dinner: '#6366f1',
};

export default function MealDetail({
  date,
  meals,
  onClose,
  onLogMeal,
}: {
  date: string;
  meals: Meal[];
  onClose: () => void;
  onLogMeal: () => void;
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
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.handle} />
          <div style={styles.headerRow}>
            <h2 style={styles.title}>{date}</h2>
            <span style={styles.count}>{meals.length} meal{meals.length !== 1 ? 's' : ''}</span>
          </div>

          {meals.length === 0 ? (
            <p style={styles.empty}>No meals logged for this day</p>
          ) : (
            <div style={styles.list}>
              {meals.map((meal) => (
                <div key={meal.id} style={styles.mealCard}>
                  <span style={styles.mealEmoji}>{meal.emoji}</span>
                  <div style={styles.mealInfo}>
                    <span style={styles.mealName}>{meal.name}</span>
                    <span
                      style={{
                        ...styles.mealTypeBadge,
                        background: COLORS[meal.mealType] || '#666',
                      }}
                    >
                      {meal.mealType}
                    </span>
                  </div>
                  {meal.notes && <p style={styles.mealNotes}>{meal.notes}</p>}
                </div>
              ))}
            </div>
          )}

          <button style={styles.logBtn} onClick={onLogMeal}>
            + Log Meal
          </button>
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
    background: '#1e1e2e',
    borderRadius: '20px 20px 0 0',
    padding: '12px 20px 32px',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.15)',
    margin: '0 auto 16px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  count: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
  },
  empty: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.9rem',
    padding: '24px 0',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  mealCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    flexWrap: 'wrap',
  },
  mealEmoji: {
    fontSize: '1.5rem',
  },
  mealInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  mealName: {
    fontSize: '0.95rem',
    color: '#fff',
    fontWeight: 500,
  },
  mealTypeBadge: {
    fontSize: '0.7rem',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: 6,
    alignSelf: 'flex-start',
    fontWeight: 600,
  },
  mealNotes: {
    width: '100%',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
  },
  logBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 16,
    WebkitTapHighlightColor: 'transparent',
  },
};
