import { parse, serialize } from 'cookie';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { z } from 'zod';

import { getEnv, isProduction } from '../env';

const SESSION_COOKIE_NAME = 'fourpaws_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

const sessionPayloadSchema = z.object({
  token: z.string().min(1),
  userId: z.string().uuid(),
  expiresAt: z.number().int()
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

function signPayload(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodePayload(encoded: string) {
  const raw = Buffer.from(encoded, 'base64url').toString('utf8');
  return JSON.parse(raw) as SessionPayload;
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createSessionCookie(userId: string) {
  const env = getEnv();
  const payload: SessionPayload = {
    token: randomBytes(32).toString('hex'),
    userId,
    expiresAt: Date.now() + SESSION_DURATION_MS
  };

  sessionPayloadSchema.parse(payload);
  const encoded = encodePayload(payload);
  const signature = signPayload(encoded, env.SESSION_SECRET);
  const value = `${encoded}.${signature}`;

  return {
    token: payload.token,
    cookie: serialize(SESSION_COOKIE_NAME, value, {
      httpOnly: true,
      secure: isProduction(),
      path: '/',
      sameSite: 'lax',
      maxAge: Math.floor(SESSION_DURATION_MS / 1000)
    }),
    payload
  };
}

export function destroySessionCookie() {
  return serialize(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction(),
    path: '/',
    sameSite: 'lax',
    maxAge: 0
  });
}

export function readSessionCookie(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return null;
  const { SESSION_SECRET } = getEnv();
  const cookies = parse(cookieHeader);
  const raw = cookies[SESSION_COOKIE_NAME];
  if (!raw) return null;

  const [encoded, signature] = raw.split('.');
  if (!encoded || !signature) return null;

  const expectedSignature = signPayload(encoded, SESSION_SECRET);
  const providedBuffer = Buffer.from(signature, 'base64url');
  const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
  if (providedBuffer.length !== expectedBuffer.length) return null;

  const isValidSignature = timingSafeEqual(providedBuffer, expectedBuffer);
  if (!isValidSignature) return null;

  const payload = sessionPayloadSchema.safeParse(decodePayload(encoded));
  if (!payload.success) return null;
  if (Date.now() > payload.data.expiresAt) return null;

  return payload.data;
}

export const sessionCookieName = SESSION_COOKIE_NAME;
export const sessionMaxAge = Math.floor(SESSION_DURATION_MS / 1000);
