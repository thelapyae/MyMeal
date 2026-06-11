import crypto from 'crypto';

// Telegram Mini Apps sign the `initData` payload with a key derived from the
// bot token. Verifying this signature server-side is the only way to be sure a
// request actually came from Telegram (and from an authorized user) rather than
// from someone hitting the API directly in a browser.
//
// Docs: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Comma-separated allow-list of Telegram user IDs permitted to use the API.
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

export function verifyTelegramRequest(initData: string | undefined): AuthResult {
  if (!BOT_TOKEN) {
    return { ok: false, status: 500, error: 'Server missing TELEGRAM_BOT_TOKEN' };
  }
  if (ALLOWED_IDS.length === 0) {
    return { ok: false, status: 500, error: 'Server missing ALLOWED_TELEGRAM_ID' };
  }
  if (!initData) {
    return { ok: false, status: 401, error: 'Missing Telegram auth' };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return { ok: false, status: 401, error: 'Missing auth hash' };
  }

  // Build the data-check-string: all fields except `hash`, sorted by key.
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // Constant-time comparison.
  const valid =
    computedHash.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
  if (!valid) {
    return { ok: false, status: 401, error: 'Invalid Telegram auth' };
  }

  // Reject stale payloads (older than 24h) to limit replay.
  const authDate = Number(params.get('auth_date'));
  if (Number.isFinite(authDate)) {
    const ageSeconds = Date.now() / 1000 - authDate;
    if (ageSeconds > 60 * 60 * 24) {
      return { ok: false, status: 401, error: 'Telegram auth expired' };
    }
  }

  // Extract and authorize the user.
  let userId: number | undefined;
  try {
    const user = JSON.parse(params.get('user') || '{}');
    userId = Number(user?.id);
  } catch {
    return { ok: false, status: 401, error: 'Invalid user payload' };
  }

  if (!userId || !ALLOWED_IDS.includes(userId)) {
    return { ok: false, status: 403, error: 'Not authorized' };
  }

  return { ok: true, status: 200, userId };
}
