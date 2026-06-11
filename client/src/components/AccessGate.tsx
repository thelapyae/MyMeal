import { useEffect, useState } from 'react';

type GateState = 'checking' | 'allowed' | 'denied';

interface TelegramWebApp {
  ready: () => void;
  expand?: () => void;
  initData?: string;
  initDataUnsafe?: {
    user?: { id?: number };
  };
}

function getTelegramContext(): { hasUser: boolean } | null {
  const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
  if (!tg) return null;
  try {
    tg.ready();
    tg.expand?.();
  } catch {
    // ignore
  }
  // Require a signed initData payload and a user id. Real authorization is
  // enforced server-side against ALLOWED_TELEGRAM_ID; this gate only confirms
  // the app is genuinely running inside Telegram.
  const hasUser = Boolean(tg.initData) && typeof tg.initDataUnsafe?.user?.id === 'number';
  return { hasUser };
}

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    // Telegram injects the WebApp object synchronously once the script loads,
    // but give it a tick in case it is still initializing.
    let attempts = 0;
    const check = () => {
      const ctx = getTelegramContext();
      if (ctx) {
        setState(ctx.hasUser ? 'allowed' : 'denied');
        return;
      }
      attempts += 1;
      if (attempts < 10) {
        setTimeout(check, 150);
      } else {
        // No Telegram WebApp at all (opened directly in a browser).
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
