import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Meal, ViewMode } from '../types';
import ViewToggle from './ViewToggle';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const COLORS: Record<string, string> = {
  Breakfast: '#f59e0b',
  Lunch: '#10b981',
  Dinner: '#6366f1',
};

export default function CalendarView({
  meals,
  onDayClick,
}: {
  meals: Meal[];
  onDayClick: (date: string) => void;
}) {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const navigate = (direction: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + direction);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + direction * 7);
    } else {
      d.setFullYear(d.getFullYear() + direction);
    }
    setCurrentDate(d);
  };

  const mealsByDate = useMemo(() => {
    const map: Record<string, Meal[]> = {};
    for (const meal of meals) {
      if (!map[meal.date]) map[meal.date] = [];
      map[meal.date].push(meal);
    }
    return map;
  }, [meals]);

  const formatDate = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      <div style={styles.navRow}>
        <button style={styles.navBtn} onClick={() => navigate(-1)}>‹</button>
        <h2 style={styles.monthTitle}>
          {viewMode === 'year'
            ? String(year)
            : `${MONTHS[month]} ${year}`}
        </h2>
        <button style={styles.navBtn} onClick={() => navigate(1)}>›</button>
      </div>

      <motion.div
        key={`${viewMode}-${year}-${month}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {viewMode === 'month' && renderMonthView(year, month, mealsByDate, today, onDayClick, formatDate)}
        {viewMode === 'week' && renderWeekView(year, month, currentDate, mealsByDate, today, onDayClick, formatDate)}
        {viewMode === 'year' && renderYearView(year, mealsByDate, today, onDayClick, formatDate)}
      </motion.div>
    </div>
  );
}

function renderMonthView(
  year: number,
  month: number,
  mealsByDate: Record<string, Meal[]>,
  today: Date,
  onDayClick: (d: string) => void,
  formatDate: (y: number, m: number, d: number) => string,
) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const cells: React.ReactNode[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(year, month, d);
    const dayMeals = mealsByDate[dateStr] || [];
    const isToday = dateStr === todayStr;

    cells.push(
      <button key={d} style={styles.dayCell} onClick={() => onDayClick(dateStr)}>
        <span style={{ ...styles.dayNum, ...(isToday ? styles.todayNum : {}) }}>{d}</span>
        <div style={styles.emojiRow}>
          {dayMeals.slice(0, 3).map((m, i) => (
            <span key={i} style={{ ...styles.mealDot, background: COLORS[m.mealType] || '#666' }} title={m.name}>
              {m.emoji || (COLORS[m.mealType] ? '' : '')}
            </span>
          ))}
        </div>
      </button>
    );
  }

  return (
    <div>
      <div style={styles.dayHeaders}>
        {DAYS.map((d) => (
          <span key={d} style={styles.dayHeader}>{d.slice(0, 2)}</span>
        ))}
      </div>
      <div style={styles.grid}>{cells}</div>
    </div>
  );
}

function renderWeekView(
  year: number,
  month: number,
  currentDate: Date,
  mealsByDate: Record<string, Meal[]>,
  today: Date,
  onDayClick: (d: string) => void,
  formatDate: (y: number, m: number, d: number) => string,
) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const days: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    const dateStr = formatDate(d.getFullYear(), d.getMonth(), d.getDate());
    const dayMeals = mealsByDate[dateStr] || [];
    const isToday = dateStr === todayStr;

    days.push(
      <button key={i} style={styles.weekDayCell} onClick={() => onDayClick(dateStr)}>
        <span style={styles.weekDayName}>{DAYS[i].slice(0, 2)}</span>
        <span style={{ ...styles.weekDayNum, ...(isToday ? styles.todayNum : {}) }}>
          {d.getDate()}
        </span>
        <div style={styles.weekEmojis}>
          {dayMeals.map((m, j) => (
            <span key={j} style={{ fontSize: '1.1rem' }}>{m.emoji}</span>
          ))}
        </div>
      </button>
    );
  }

  return <div style={styles.weekGrid}>{days}</div>;
}

function renderYearView(
  year: number,
  mealsByDate: Record<string, Meal[]>,
  today: Date,
  onDayClick: (d: string) => void,
  formatDate: (y: number, m: number, d: number) => string,
) {
  const months: React.ReactNode[] = [];

  for (let m = 0; m < 12; m++) {
    const daysInM = getDaysInMonth(year, m);
    let totalMeals = 0;
    const monthMeals: string[] = [];
    for (let d = 1; d <= daysInM; d++) {
      const dateStr = formatDate(year, m, d);
      const dayMeals = mealsByDate[dateStr] || [];
      totalMeals += dayMeals.length;
      if (dayMeals.length > 0) monthMeals.push(dateStr);
    }

    const intensity = Math.min(totalMeals / 30, 1);

    months.push(
      <button
        key={m}
        style={styles.yearMonth}
        onClick={() => {
          if (monthMeals.length > 0) onDayClick(monthMeals[0]);
        }}
      >
        <div
          style={{
            ...styles.yearMonthBar,
            opacity: 0.2 + intensity * 0.8,
            background: intensity > 0 ? '#6366f1' : '#333',
            height: `${Math.max(8, intensity * 40)}px`,
          }}
        />
        <span style={styles.yearMonthLabel}>{MONTHS[m]}</span>
        <span style={styles.yearMealCount}>{totalMeals}</span>
      </button>
    );
  }

  return <div style={styles.yearGrid}>{months}</div>;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0 12px',
    maxWidth: 500,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 12,
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '2rem',
    cursor: 'pointer',
    padding: '4px 12px',
    lineHeight: 1,
    WebkitTapHighlightColor: 'transparent',
  },
  monthTitle: {
    fontSize: '1.15rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  dayHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    marginBottom: 4,
  },
  dayHeader: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 500,
    padding: '4px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 2,
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
    minHeight: 52,
    transition: 'background 0.15s',
    WebkitTapHighlightColor: 'transparent',
  },
  dayNum: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 500,
  },
  todayNum: {
    background: '#6366f1',
    color: '#fff',
    borderRadius: '50%',
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 700,
  },
  emojiRow: {
    display: 'flex',
    gap: 2,
    marginTop: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  mealDot: {
    fontSize: '0.7rem',
    lineHeight: 1,
  },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 4,
  },
  weekDayCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 4px',
    borderRadius: 12,
    border: 'none',
    background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer',
    gap: 4,
    WebkitTapHighlightColor: 'transparent',
  },
  weekDayName: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 500,
  },
  weekDayNum: {
    fontSize: '1.1rem',
    color: '#fff',
    fontWeight: 600,
  },
  weekEmojis: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  yearGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    padding: '8px 0',
  },
  yearMonth: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    border: 'none',
    background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  yearMonthBar: {
    width: '60%',
    borderRadius: 4,
    transition: 'all 0.3s',
  },
  yearMonthLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 500,
  },
  yearMealCount: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.3)',
  },
};
