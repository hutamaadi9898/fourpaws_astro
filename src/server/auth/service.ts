import { and, eq, gt } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '../db/client';
import { hashPassword, verifyPassword } from './password';
import {
  createSessionCookie,
  destroySessionCookie,
  hashSessionToken,
  readSessionCookie
} from './session';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'Password must be at least 12 characters long')
});

export type Credentials = z.infer<typeof credentialsSchema>;

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.email, email)
  });
}

export async function ensureOwnerExists({
  email,
  password,
  displayName
}: {
  email: string;
  password: string;
  displayName?: string;
}) {
  const existing = await getUserByEmail(email);
  if (existing) return existing;

  const passwordHash = await hashPassword(password);
  const [inserted] = await db
    .insert(schema.users)
    .values({ email, passwordHash, displayName, isOwner: true })
    .returning();

  return inserted;
}

export async function authenticate(credentials: Credentials) {
  const { email, password } = credentialsSchema.parse(credentials);
  const user = await getUserByEmail(email);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  const { token, cookie, payload } = createSessionCookie(user.id);
  await db.insert(schema.sessions).values({
    userId: user.id,
    tokenHash: hashSessionToken(token),
    expiresAt: new Date(payload.expiresAt)
  });

  return { user, cookie, payload };
}

export async function revokeSession(token: string) {
  await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, hashSessionToken(token)));
}

export async function signOut(cookieHeader: string | null | undefined) {
  const payload = readSessionCookie(cookieHeader);
  if (!payload) {
    return destroySessionCookie();
  }

  await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, hashSessionToken(payload.token)));
  return destroySessionCookie();
}

export async function requireSession(cookieHeader: string | null | undefined) {
  const payload = readSessionCookie(cookieHeader);
  if (!payload) return null;

  const now = new Date();
  const session = await db.query.sessions.findFirst({
    where: and(
      eq(schema.sessions.tokenHash, hashSessionToken(payload.token)),
      eq(schema.sessions.userId, payload.userId),
      gt(schema.sessions.expiresAt, now)
    ),
    with: {
      user: true
    }
  });

  if (!session?.user) return null;
  return {
    user: session.user,
    session,
    payload
  };
}

export async function rotateSession(cookieHeader: string | null | undefined) {
  const active = await requireSession(cookieHeader);
  if (!active) return null;

  await db.delete(schema.sessions).where(eq(schema.sessions.id, active.session.id));

  const { token, cookie, payload } = createSessionCookie(active.user.id);
  await db.insert(schema.sessions).values({
    userId: active.user.id,
    tokenHash: hashSessionToken(token),
    expiresAt: new Date(payload.expiresAt)
  });

  return { user: active.user, cookie, payload };
}
