import { useState, useEffect, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import CalendarView from './components/CalendarView';
import MealDetail from './components/MealDetail';
import MealLogForm from './components/MealLogForm';
import { fetchMeals, createMeal } from './services/notionAPI';
import type { Meal } from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMeals = useCallback(async (date?: string) => {
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

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setShowLogForm(false);
  };

  const handleSaveMeal = async (meal: { name: string; date: string; mealType: string; emoji: string; notes?: string }) => {
    await createMeal(meal);
    await loadMeals();
  };

  const dayMeals = selectedDate
    ? meals.filter((m) => m.date === selectedDate)
    : [];

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <div style={styles.app}>
          <header style={styles.header}>
            <h1 style={styles.logo}>🍽️ MyMeal</h1>
          </header>
          <main style={styles.main}>
            {loading ? (
              <div style={styles.loading}>
                <span style={{ fontSize: '2rem' }}>⏳</span>
                <p style={styles.loadingText}>Loading your meals...</p>
              </div>
            ) : (
              <CalendarView meals={meals} onDayClick={handleDayClick} />
            )}
          </main>

          {selectedDate && !showLogForm && (
            <MealDetail
              date={selectedDate}
              meals={dayMeals}
              onClose={() => setSelectedDate(null)}
              onLogMeal={() => setShowLogForm(true)}
            />
          )}

          {selectedDate && showLogForm && (
            <MealLogForm
              date={selectedDate}
              onSave={handleSaveMeal}
              onClose={() => {
                setShowLogForm(false);
                setSelectedDate(null);
              }}
            />
          )}
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100dvh',
    background: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logo: {
    fontSize: '1.2rem',
    fontWeight: 700,
    margin: 0,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    paddingTop: 8,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    gap: 8,
  },
  loadingText: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
  },
};
