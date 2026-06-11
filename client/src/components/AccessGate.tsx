import { useEffect, useState } from 'react';
import { getInitData } from '../telegram';

type GateState = 'checking' | 'allowed' | 'denied';

interface TelegramWebApp {
  ready: () => void;
  expand?: () => void;
  initData?: string;
  initDataUnsafe?: {
    user?: { id?: number };
  };
}

function getWebApp(): TelegramWebApp | null {
  const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
  if (!tg) return null;
  try {
    tg.ready();
    tg.expand?.();
  } catch {
    // ignore
  }
  return tg;
}

// Ask the server whether this Telegram user is authorized. The server compares
// the Telegram id (from the signed initData) against ALLOWED_TELEGRAM_ID, so the
// allow-list never ships to the browser. 200 -> allowed, anything else -> denied.
async function checkAuthorized(initData: string): Promise<boolean> {
  try {
    const res = await fetch('/api/meals?date=1970-01-01', {
      headers: { 'X-Telegram-Init-Data': initData },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    let attempts = 0;
    let cancelled = false;

    const run = async () => {
      const tg = getWebApp();
      // Telegram injects the WebApp object synchronously, but give it a few
      // ticks in case the script is still initializing.
      if (!tg) {
        attempts += 1;
        if (attempts < 10) {
          setTimeout(run, 150);
        } else if (!cancelled) {
          // No Telegram WebApp at all (opened directly in a browser).
          setState('denied');
        }
        return;
      }

      const initData = getInitData();
      if (!initData) {
        if (!cancelled) setState('denied');
        return;
      }

      const ok = await checkAuthorized(initData);
      if (!cancelled) setState(ok ? 'allowed' : 'denied');
    };

    run();
    return () => {
      cancelled = true;
    };
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
