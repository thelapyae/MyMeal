// Telegram WebApp helpers.
//
// Telegram's webview does NOT reliably expose the device safe area through the
// CSS env(safe-area-inset-*) properties, especially the top inset that sits
// under the Telegram header / status bar. The Telegram WebApp API exposes the
// real values via `safeAreaInset` and `contentSafeAreaInset`, so we read those
// and write them into the CSS variables defined in App.css.

interface Inset {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface TelegramWebApp {
  ready: () => void;
  expand?: () => void;
  initData?: string;
  safeAreaInset?: Inset;
  contentSafeAreaInset?: Inset;
  onEvent?: (event: string, handler: () => void) => void;
  initDataUnsafe?: { user?: { id?: number } };
}

function getWebApp(): TelegramWebApp | null {
  return (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp ?? null;
}

// Raw, signed initData string that the server verifies against the bot token.
// Empty when the app is opened outside of Telegram.
export function getInitData(): string {
  return getWebApp()?.initData ?? '';
}

function applySafeArea(tg: TelegramWebApp) {
  // Combine the device safe area (status bar / notch) with Telegram's own
  // content safe area (its header). Either may be undefined.
  const sa = tg.safeAreaInset ?? {};
  const ca = tg.contentSafeAreaInset ?? {};
  const top = (sa.top ?? 0) + (ca.top ?? 0);
  const bottom = (sa.bottom ?? 0) + (ca.bottom ?? 0);
  const root = document.documentElement;
  // Only override when Telegram actually reports a value, otherwise leave the
  // env() fallback in place.
  if (top > 0) root.style.setProperty('--safe-top', `${top}px`);
  if (bottom > 0) root.style.setProperty('--safe-bottom', `${bottom}px`);
}

export function setupTelegram() {
  const tg = getWebApp();
  if (!tg) return;
  try {
    tg.ready();
    tg.expand?.();
  } catch {
    // ignore
  }
  applySafeArea(tg);
  // Re-apply when the layout or safe area changes (rotation, fullscreen, etc.)
  tg.onEvent?.('safeAreaChanged', () => applySafeArea(tg));
  tg.onEvent?.('contentSafeAreaChanged', () => applySafeArea(tg));
  tg.onEvent?.('viewportChanged', () => applySafeArea(tg));
}
