import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const LONGITUD_HASH = 64;

export function generarPasswordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivado = scryptSync(password, salt, LONGITUD_HASH).toString('hex');
  return `scrypt$${salt}$${derivado}`;
}

export function verificarPassword(password: string, passwordHash: string) {
  const [algoritmo, salt, hashGuardado] = passwordHash.split('$');

  if (algoritmo !== 'scrypt' || !salt || !hashGuardado) {
    return false;
  }

  const hashCalculado = scryptSync(password, salt, LONGITUD_HASH);
  const hashBuffer = Buffer.from(hashGuardado, 'hex');

  if (hashCalculado.length !== hashBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashCalculado, hashBuffer);
}
