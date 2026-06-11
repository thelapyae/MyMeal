import crypto from 'crypto';

// Authorization for the meals API.
//
// The rule is simple: a request is allowed only when the Telegram user id
// matches one of the ids in ALLOWED_TELEGRAM_ID. The user id comes from the
// Telegram Mini App `initData` payload that the client forwards on every
// request.
//
// If TELEGRAM_BOT_TOKEN is also configured, we additionally verify the
// cryptographic signature of `initData` (so the id cannot be forged). The bot
// token is therefore OPTIONAL hardening — the app still works with just
// ALLOWED_TELEGRAM_ID set.
//
// Docs: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const ALLOWED_IDS: number[] = (process.env.ALLOWED_TELEGRAM_ID || '')
  .split(',')
  .map((id) => Number(id.trim()))
  .filter((id) => Number.isFinite(id) && id > 0);

export interface AuthResult {
  ok: boolean;
  status: number;
  error?: string;
  userId?: number;
}

function signatureValid(params: URLSearchParams): boolean {
  const hash = params.get('hash');
  if (!hash) return false;

  // Build the data-check-string: all fields except `hash`, sorted by key.
  const entries = [...params.entries()].filter(([k]) => k !== 'hash');
  const dataCheckString = entries
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return (
    computedHash.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash))
  );
}

export function verifyTelegramRequest(initData: string | undefined): AuthResult {
  if (ALLOWED_IDS.length === 0) {
    return { ok: false, status: 500, error: 'Server missing ALLOWED_TELEGRAM_ID' };
  }
  if (!initData) {
    return { ok: false, status: 401, error: 'Missing Telegram auth' };
  }

  const params = new URLSearchParams(initData);

  // Optional signature check (only when a bot token is configured).
  if (BOT_TOKEN && !signatureValid(params)) {
    return { ok: false, status: 401, error: 'Invalid Telegram auth' };
  }

  // Extract the user id from the payload.
  let userId: number | undefined;
  try {
    const user = JSON.parse(params.get('user') || '{}');
    userId = Number(user?.id);
  } catch {
    return { ok: false, status: 401, error: 'Invalid user payload' };
  }

  // The core rule: the id must be in the allow-list.
  if (!userId || !ALLOWED_IDS.includes(userId)) {
    return { ok: false, status: 403, error: 'Not authorized' };
  }

  return { ok: true, status: 200, userId };
}
