import crypto from 'crypto';

const SALT = 'etw-elektrische-anlagen-wien-salt-2026';

export function hashPassword(plain: string): string {
  return crypto
    .pbkdf2Sync(plain, SALT, 10000, 32, 'sha256')
    .toString('hex');
}

export function verifyPassword(plain: string, expectedHash: string): boolean {
  const actualHash = hashPassword(plain);
  return actualHash === expectedHash;
}
