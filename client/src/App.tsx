import { useState, useEffect, useCallback } from 'react';
import FoodGrid from './components/FoodGrid';
import CalendarView from './components/CalendarView';
import MealDetail from './components/MealDetail';
import { fetchMeals, createMeal } from './services/notionAPI';
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

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekDates(): string[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return formatDate(d);
  });
}

const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function App() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const today = formatDate(new Date());

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

  const handleEmojiSelect = async (emoji: string) => {
    if (saving) return;
    setSaving(emoji);
    const mealType = getMealType();
    try {
      await createMeal({
        name: `${mealType} ${emoji}`,
        date: today,
        mealType,
        emoji,
      });
      setFeedback(emoji);
      setTimeout(() => setFeedback(null), 1200);
      await loadMeals();
    } catch (err) {
      console.error('Failed to save meal:', err);
    } finally {
      setSaving(null);
    }
  };

  const mealsByDate: Record<string, Meal[]> = {};
  for (const m of meals) {
    if (!mealsByDate[m.date]) mealsByDate[m.date] = [];
    mealsByDate[m.date].push(m);
  }

  const weekDates = getWeekDates();
  const dayMeals = selectedDate ? mealsByDate[selectedDate] || [] : [];

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.greeting}>
          {loading ? '...' : getGreeting()}
        </h1>
        <button style={styles.calBtn} onClick={() => setShowCalendar(true)}>
          🗓️
        </button>
      </header>

      <main style={styles.main}>
        {loading ? (
          <div style={styles.loading}>
            <p style={styles.loadingText}>loading...</p>
          </div>
        ) : (
          <>
            <FoodGrid onSelect={handleEmojiSelect} saving={saving} />

            {feedback && (
              <div style={styles.feedback}>
                <span style={styles.feedbackText}>{feedback} saved</span>
              </div>
            )}

            <div style={styles.weekSection}>
              <h2 style={styles.weekTitle}>this week</h2>
              <div style={styles.weekGrid}>
                {weekDates.map((date, i) => {
                  const dayMeals = mealsByDate[date] || [];
                  const isToday = date === today;
                  return (
                    <button
                      key={date}
                      style={styles.weekDay}
                      onClick={() => setSelectedDate(date)}
                    >
                      <span style={styles.weekDayName}>
                        {DAY_ABBR[i]}
                      </span>
                      <span
                        style={{
                          ...styles.weekDayNum,
                          ...(isToday ? styles.weekDayToday : {}),
                        }}
                      >
                        {new Date(date).getDate()}
                      </span>
                      <div style={styles.weekEmojis}>
                        {dayMeals.map((m) => (
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

      {showCalendar && (
        <div style={styles.calOverlay} onClick={() => setShowCalendar(false)}>
          <div style={styles.calSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.calHandle} />
            <CalendarView
              meals={meals}
              onDayClick={(date) => {
                setSelectedDate(date);
                setShowCalendar(false);
              }}
            />
            <button
              style={styles.closeBtn}
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
    background: '#000',
    color: '#fff',
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
    color: 'rgba(255,255,255,0.8)',
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
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.9rem',
  },
  feedback: {
    textAlign: 'center',
    padding: '8px 0',
  },
  feedbackText: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  weekSection: {
    marginTop: 24,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: 16,
  },
  weekTitle: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.3)',
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
    color: 'rgba(255,255,255,0.25)',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
  },
  weekDayNum: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 500,
  },
  weekDayToday: {
    color: '#fff',
    fontWeight: 700,
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
  },
  weekEmojis: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    minHeight: 24,
  },
  weekEmoji: {
    fontSize: '0.7rem',
    lineHeight: 1,
  },
  calOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
  },
  calSheet: {
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
    background: '#0a0a0a',
    borderRadius: '20px 20px 0 0',
    padding: '12px 0 32px',
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  calHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.12)',
    margin: '0 auto 12px',
  },
  closeBtn: {
    width: 'calc(100% - 32px)',
    margin: '16px 16px 0',
    padding: '12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
};
