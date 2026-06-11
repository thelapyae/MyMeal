import { useEffect, useState } from 'react';

// Only this Telegram user is allowed to use the app.
const ALLOWED_TELEGRAM_ID = 1695096396;

type GateState = 'checking' | 'allowed' | 'denied';

interface TelegramWebApp {
  ready: () => void;
  expand?: () => void;
  initDataUnsafe?: {
    user?: { id?: number };
  };
}

function getTelegramUserId(): number | null {
  const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
  if (!tg) return null;
  try {
    tg.ready();
    tg.expand?.();
  } catch {
    // ignore
  }
  const id = tg.initDataUnsafe?.user?.id;
  return typeof id === 'number' ? id : null;
}

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    // Telegram injects the WebApp object synchronously once the script loads,
    // but give it a tick in case it is still initializing.
    let attempts = 0;
    const check = () => {
      const userId = getTelegramUserId();
      if (userId !== null) {
        setState(userId === ALLOWED_TELEGRAM_ID ? 'allowed' : 'denied');
        return;
      }
      attempts += 1;
      if (attempts < 10) {
        setTimeout(check, 150);
      } else {
        // Could not determine the Telegram user (opened outside Telegram).
        setState('denied');
      }
    };
    check();
  }, []);

  if (state === 'allowed') {
    return <>{children}</>;
  }

  return (
    <div style={{ ...styles.container, background: 'var(--bg)', color: 'var(--text)' }}>
      {state === 'checking' ? (
        <p style={{ ...styles.text, color: 'var(--text-faint)' }}>checking access...</p>
      ) : (
        <>
          <h1 style={styles.title}>access denied</h1>
          <p style={{ ...styles.text, color: 'var(--text-faint)' }}>
            this app is private. open it from Telegram with an authorized account.
          </p>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '24px',
    gap: 12,
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 400,
    letterSpacing: '0.05em',
    margin: 0,
  },
  text: {
    fontSize: '0.9rem',
    maxWidth: 280,
    lineHeight: 1.5,
    margin: 0,
  },
};
