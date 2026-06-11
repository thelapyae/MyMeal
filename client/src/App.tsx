import { useState, useEffect, useCallback } from 'react';
import FoodGrid from './components/FoodGrid';
import CalendarView from './components/CalendarView';
import MealDetail from './components/MealDetail';
import MacroBar from './components/MacroBar';
import { fetchMeals, createMeal } from './services/notionAPI';
import { sumMacros } from './macros';
import type { Meal } from './types';

function getMealType(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Breakfast';
  if (h < 16) return 'Lunch';
  return 'Dinner';
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'ready for breakfast?';
  if (h < 16) return 'ready for lunch?';
  return 'ready for dinner?';
}

function nowISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

function getWeekDates(): string[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function App() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const today = nowISO().slice(0, 10);

  const loadMeals = useCallback(async () => {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const data = await fetchMeals({ month });
      setMeals(data);
    } catch (err) {
      console.error('Failed to load meals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMeals(); }, [loadMeals]);

  const handleAdd = (emoji: string) => {
    if (saving) return;
    // Always append so the same food can be selected multiple times
    // (e.g. two plates of rice -> 🍚🍚).
    setSelected((prev) => [...prev, emoji]);
  };

  const handleRemoveAt = (index: number) => {
    if (saving) return;
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (selected.length === 0 || saving) return;
    setSaving(true);
    const mealType = getMealType();
    const emojiStr = selected.join('');
    try {
      await createMeal({
        name: `${mealType} ${emojiStr}`,
        date: nowISO(),
        mealType,
        emoji: emojiStr,
      });
      setSelected([]);
      await loadMeals();
    } catch (err) {
      console.error('Failed to save meal:', err);
    } finally {
      setSaving(false);
    }
  };

  const mealsByDate: Record<string, Meal[]> = {};
  for (const m of meals) {
    const d = dateOnly(m.date);
    if (!mealsByDate[d]) mealsByDate[d] = [];
    mealsByDate[d].push(m);
  }

  const weekDates = getWeekDates();
  const dayMeals = selectedDate ? mealsByDate[selectedDate] || [] : [];

  // Today's logged macros (estimated from each meal's emoji) plus whatever the
  // user has currently selected but not yet saved.
  const todayMeals = mealsByDate[today] || [];
  const todayMacros = sumMacros([
    ...todayMeals.map((m) => m.emoji),
    selected.join(''),
  ]);

  return (
    <div style={{ ...styles.app, background: 'var(--bg)', color: 'var(--text)', paddingTop: 'var(--safe-top)' }}>
      <header style={styles.header}>
        <h1 style={{ ...styles.greeting, color: 'var(--text-muted)' }}>
          {loading ? '...' : getGreeting()}
        </h1>
        <button style={styles.calBtn} onClick={() => setShowCalendar(true)}>
          🗓️
        </button>
      </header>

      <main style={{ ...styles.main, paddingBottom: 24 }}>
        {loading ? (
          <div style={styles.loading}>
            <p style={{ ...styles.loadingText, color: 'var(--text-faint)' }}>loading...</p>
          </div>
        ) : (
          <>
            <FoodGrid
              selected={selected}
              onAdd={handleAdd}
              saving={saving}
            />

            {selected.length > 0 && (
              <div style={styles.selectedRow}>
                {selected.map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    style={{ ...styles.selectedChip, background: 'var(--elevated)', borderColor: 'var(--border)' }}
                    onClick={() => handleRemoveAt(i)}
                    aria-label={`remove ${emoji}`}
                    disabled={saving}
                  >
                    <span>{emoji}</span>
                    <span style={{ ...styles.chipX, color: 'var(--text-faint)' }}>×</span>
                  </button>
                ))}
              </div>
            )}

            <div style={styles.saveRow}>
              <span style={{ ...styles.saveInfo, color: 'var(--text-faint)' }}>
                {selected.length > 0 ? `${selected.length} item${selected.length > 1 ? 's' : ''}` : 'tap items to log'}
              </span>
              <button
                style={{
                  ...styles.saveBtn,
                  background: selected.length > 0 ? 'var(--text)' : 'var(--border)',
                  color: selected.length > 0 ? 'var(--bg)' : 'var(--text-faint)',
                  cursor: selected.length > 0 && !saving ? 'pointer' : 'default',
                }}
                disabled={selected.length === 0 || saving}
                onClick={handleSave}
              >
                {saving ? 'saving...' : `save ${getMealType().toLowerCase()}`}
              </button>
            </div>

            <div style={{ ...styles.weekSection, borderTopColor: 'var(--border)' }}>
              <h2 style={{ ...styles.weekTitle, color: 'var(--text-faint)' }}>this week</h2>
              <div style={styles.weekGrid}>
                {weekDates.map((date, i) => {
                  const dMeals = mealsByDate[date] || [];
                  const isToday = date === today;
                  return (
                    <button
                      key={date}
                      style={styles.weekDay}
                      onClick={() => setSelectedDate(date)}
                    >
                      <span style={{ ...styles.weekDayName, color: 'var(--text-faint)' }}>
                        {DAY_ABBR[i]}
                      </span>
                      <span
                        style={{
                          ...styles.weekDayNum,
                          color: isToday ? 'var(--text)' : 'var(--text-muted)',
                          ...(isToday ? {
                            border: '1px solid var(--text-muted)',
                            borderRadius: '50%',
                            width: 28, height: 28,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem',
                          } : {}),
                        }}
                      >
                        {new Date(date).getDate()}
                      </span>
                      <div style={styles.weekEmojis}>
                        {dMeals.map((m) => (
                          <span key={m.id} style={styles.weekEmoji}>{m.emoji}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {!loading && <MacroBar macros={todayMacros} />}

      {showCalendar && (
        <div style={styles.calOverlay} onClick={() => setShowCalendar(false)}>
          <div style={{ ...styles.calSheet, background: 'var(--surface)', paddingBottom: 'calc(32px + var(--safe-bottom))' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.calHandle, background: 'var(--border-strong)' }} />
            <CalendarView
              meals={meals}
              onDayClick={(date) => {
                setSelectedDate(date);
                setShowCalendar(false);
              }}
            />
            <button
              style={{ ...styles.closeBtn, borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              onClick={() => setShowCalendar(false)}
            >
              close
            </button>
          </div>
        </div>
      )}

      {selectedDate && !showCalendar && (
        <MealDetail
          date={selectedDate}
          meals={dayMeals}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 16px 8px',
  },
  greeting: {
    fontSize: '1.15rem',
    fontWeight: 500,
    margin: 0,
    letterSpacing: '0.01em',
  },
  calBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.4rem',
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
    WebkitTapHighlightColor: 'transparent',
    filter: 'grayscale(1) brightness(1.5)',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    padding: '16px 16px 24px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: '60px 0',
  },
  loadingText: {
    fontSize: '0.9rem',
  },
  saveRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  selectedRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  selectedChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 10px',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    fontSize: '1.25rem',
    lineHeight: 1,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  chipX: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  saveInfo: {
    fontSize: '0.8rem',
    flex: 1,
  },
  saveBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    WebkitTapHighlightColor: 'transparent',
  },
  weekSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 16,
  },
  weekTitle: {
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    margin: '0 0 12px',
  },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 4,
  },
  weekDay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '8px 2px',
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  weekDayName: {
    fontSize: '0.6rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
  },
  weekDayNum: {
    fontSize: '1rem',
    fontWeight: 500,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekEmojis: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: 22,
  },
  weekEmoji: {
    fontSize: '0.65rem',
    lineHeight: 1,
  },
  calOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
  },
  calSheet: {
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
    borderRadius: '20px 20px 0 0',
    padding: '12px 0 32px',
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  calHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    margin: '0 auto 12px',
  },
  closeBtn: {
    width: 'calc(100% - 32px)',
    margin: '16px 16px 0',
    padding: '12px',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    background: 'transparent',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
};
