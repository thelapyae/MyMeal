import { useEffect, useState } from 'react';

// Allow-list of Telegram user IDs that may use the app. Configure this with the
// VITE_ALLOWED_TELEGRAM_ID environment variable (comma-separated to allow more
// than one user), e.g. VITE_ALLOWED_TELEGRAM_ID=1695096396,123456789
const ALLOWED_TELEGRAM_IDS: number[] = (import.meta.env.VITE_ALLOWED_TELEGRAM_ID ?? '')
  .split(',')
  .map((id: string) => Number(id.trim()))
  .filter((id: number) => Number.isFinite(id) && id > 0);

const IS_CONFIGURED = ALLOWED_TELEGRAM_IDS.length > 0;

type GateState = 'checking' | 'allowed' | 'denied' | 'unconfigured';

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
    // If no allow-list is configured, surface a clear setup message instead of
    // silently denying everyone.
    if (!IS_CONFIGURED) {
      setState('unconfigured');
      return;
    }

    // Telegram injects the WebApp object synchronously once the script loads,
    // but give it a tick in case it is still initializing.
    let attempts = 0;
    const check = () => {
      const userId = getTelegramUserId();
      if (userId !== null) {
        setState(ALLOWED_TELEGRAM_IDS.includes(userId) ? 'allowed' : 'denied');
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
      ) : state === 'unconfigured' ? (
        <>
          <h1 style={styles.title}>setup required</h1>
          <p style={{ ...styles.text, color: 'var(--text-faint)' }}>
            set the <code style={styles.code}>VITE_ALLOWED_TELEGRAM_ID</code> environment variable to
            your Telegram user ID, then rebuild. see the README for setup steps.
          </p>
        </>
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
  code: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    background: 'var(--surface, rgba(255,255,255,0.08))',
    padding: '1px 5px',
    borderRadius: 4,
  },
};
