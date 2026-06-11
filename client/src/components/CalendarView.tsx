import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Meal } from '../types';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({
  meals,
  onDayClick,
}: {
  meals: Meal[];
  onDayClick: (date: string) => void;
}) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const navigate = (d: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + d);
    setCurrentDate(next);
  };

  const mealsByDate = useMemo(() => {
    const map: Record<string, Meal[]> = {};
    for (const meal of meals) {
      const d = meal.date.slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(meal);
    }
    return map;
  }, [meals]);

  const fmt = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const todayStr = fmt(today.getFullYear(), today.getMonth(), today.getDate());
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = fmt(year, month, d);
    const dayMeals = mealsByDate[dateStr] || [];
    const isToday = dateStr === todayStr;
    cells.push(
      <button key={d} style={styles.dayCell} onClick={() => onDayClick(dateStr)}>
        <span
          style={{
            ...styles.dayNum,
            color: isToday ? 'var(--text)' : 'var(--text-muted)',
            ...(isToday ? styles.dayNumToday : {}),
          }}
        >
          {d}
        </span>
        <div style={styles.emojiRow}>
          {dayMeals.slice(0, 3).map((m, i) => (
            <span key={i} style={styles.emojiDot}>{m.emoji}</span>
          ))}
        </div>
      </button>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.navRow}>
        <button style={{ ...styles.navBtn, color: 'var(--text)' }} onClick={() => navigate(-1)}>‹</button>
        <h2 style={{ ...styles.title, color: 'var(--text)' }}>{MONTHS[month]} {year}</h2>
        <button style={{ ...styles.navBtn, color: 'var(--text)' }} onClick={() => navigate(1)}>›</button>
      </div>
      <motion.div key={`${year}-${month}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }}>
        <div style={styles.dayHeaders}>
          {DAYS.map((d) => <span key={d} style={{ ...styles.dayHeader, color: 'var(--text-faint)' }}>{d.slice(0, 2)}</span>)}
        </div>
        <div style={styles.grid}>{cells}</div>
      </motion.div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0 16px',
    maxWidth: 500,
    margin: '0 auto',
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.8rem',
    cursor: 'pointer',
    padding: '4px 10px',
    lineHeight: 1,
    WebkitTapHighlightColor: 'transparent',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
  },
  dayHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    marginBottom: 2,
  },
  dayHeader: {
    fontSize: '0.65rem',
    fontWeight: 500,
    padding: '4px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 1,
  },
  dayCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '6px 2px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    minHeight: 44,
    WebkitTapHighlightColor: 'transparent',
  },
  dayNum: {
    fontSize: '0.8rem',
    fontWeight: 400,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumToday: {
    fontWeight: 700,
    border: '1px solid var(--border-strong)',
    borderRadius: '50%',
    fontSize: '0.75rem',
  },
  emojiRow: {
    display: 'flex',
    gap: 1,
    marginTop: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emojiDot: {
    fontSize: '0.6rem',
    lineHeight: 1,
  },
};
