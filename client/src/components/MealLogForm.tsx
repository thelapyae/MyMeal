import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MEAL_TYPES, FOOD_EMOJIS } from '../types';

export default function MealLogForm({
  date,
  onSave,
  onClose,
}: {
  date: string;
  onSave: (meal: { name: string; date: string; mealType: string; emoji: string; notes?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<string>('Breakfast');
  const [emoji, setEmoji] = useState('🍗');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), date, mealType, emoji, notes });
      onClose();
    } catch {
      setSaving(false);
    }
  };

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
          <h2 style={styles.title}>Log Meal</h2>
          <p style={styles.date}>{date}</p>

          <div style={styles.field}>
            <label style={styles.label}>Meal Type</label>
            <div style={styles.typeRow}>
              {MEAL_TYPES.map((t) => (
                <button
                  key={t}
                  style={{
                    ...styles.typeBtn,
                    ...(mealType === t ? styles.typeBtnActive : {}),
                  }}
                  onClick={() => setMealType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>What did you eat?</label>
            <input
              style={styles.input}
              placeholder="e.g. Grilled chicken salad"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Emoji</label>
            <div style={styles.emojiGrid}>
              {FOOD_EMOJIS.map((e) => (
                <button
                  key={e}
                  style={{
                    ...styles.emojiBtn,
                    ...(emoji === e ? styles.emojiBtnActive : {}),
                  }}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Notes (optional)</label>
            <textarea
              style={styles.textarea}
              placeholder="Any details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <button
            style={{
              ...styles.saveBtn,
              opacity: saving || !name.trim() ? 0.5 : 1,
            }}
            disabled={saving || !name.trim()}
            onClick={handleSubmit}
          >
            {saving ? 'Saving...' : 'Save Meal'}
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
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.15)',
    margin: '0 auto 16px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 4px',
  },
  date: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
    margin: '0 0 20px',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 6,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  typeRow: {
    display: 'flex',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    padding: '10px 0',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    WebkitTapHighlightColor: 'transparent',
  },
  typeBtnActive: {
    background: '#6366f1',
    borderColor: '#6366f1',
    color: '#fff',
  },
  emojiGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  emojiBtn: {
    fontSize: '1.5rem',
    padding: 6,
    borderRadius: 10,
    border: '1px solid transparent',
    background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    lineHeight: 1,
    WebkitTapHighlightColor: 'transparent',
  },
  emojiBtnActive: {
    borderColor: '#6366f1',
    background: 'rgba(99,102,241,0.15)',
    transform: 'scale(1.15)',
  },
  saveBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
    transition: 'opacity 0.2s',
    WebkitTapHighlightColor: 'transparent',
  },
};
