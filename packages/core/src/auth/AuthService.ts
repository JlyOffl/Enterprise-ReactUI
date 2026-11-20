import type { KeyValueStorage } from '../platform/types';
import type { Logger } from '../logging/Logger';
import type { AuthSession } from './authSlice';

const SESSION_KEY = 'erui.session';

export interface TokenClaims {
  sub: string;
  email: string;
  roles: string[];
  exp: number; // epoch seconds
  iat: number;
}

/**
 * Authentication service: session persistence in secure storage, token decoding and expiry.
 * Authorization rules live in permissions.ts; Redux holds the in-memory session.
 */
export class AuthService {
  private readonly log: Logger;

  constructor(
    private readonly secureStorage: KeyValueStorage,
    logger: Logger,
  ) {
    this.log = logger.child('auth');
  }

  async persistSession(session: AuthSession): Promise<void> {
    await this.secureStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async loadSession(): Promise<AuthSession | null> {
    const raw = await this.secureStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as AuthSession;
      if (this.isExpired(session.expiresAt)) {
        this.log.info('Stored session expired; clearing');
        await this.clearSession();
        return null;
      }
      return session;
    } catch (error) {
      this.log.warn('Corrupt session in storage', undefined, error);
      await this.clearSession();
      return null;
    }
  }

  async clearSession(): Promise<void> {
    await this.secureStorage.removeItem(SESSION_KEY);
  }

  isExpired(expiresAt: number | null | undefined, skewMs = 5_000): boolean {
    return !expiresAt || Date.now() + skewMs >= expiresAt;
  }

  /** Decodes the payload segment of a JWT-like token (no signature validation on the client). */
  decodeToken(token: string): TokenClaims | null {
    try {
      const segment = token.split('.')[1];
      if (!segment) return null;
      const json = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json) as TokenClaims;
    } catch {
      return null;
    }
  }

  millisecondsUntilExpiry(expiresAt: number | null): number {
    return expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;
  }
}
