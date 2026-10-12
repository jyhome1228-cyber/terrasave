import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const send = (res, code, payload) => { res.setHeader('Cache-Control', 'no-store'); return res.status(code).json(payload); };
export const cors = (req, res) => {
  const origin = req.headers.origin;
  const allowed = new Set([
    'https://terrasave.co.kr',
    'https://www.terrasave.co.kr',
    'https://jyhome1228-cyber.github.io',
  ]);
  if (origin && allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  }
  return !!origin && allowed.has(origin);
};
export const sameOrigin = req => {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try { return !!host && new URL(origin).host === host; } catch { return false; }
};
export const equal = (a, b) => {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && timingSafeEqual(x, y);
};
const hash = value => createHmac('sha256', process.env.ADMIN_SESSION_SECRET || 'not-configured').update(value).digest('base64url');
export const createSession = () => {
  if (!process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) throw Error('Missing secure session secret');
  const until = Date.now() + 12 * 60 * 60 * 1000;
  const body = `${until}.${randomBytes(18).toString('base64url')}`;
  return `${body}.${hash(body)}`;
};
export const loggedIn = req => {
  if (!process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) return false;
  const value = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('ts_admin_session='))?.slice('ts_admin_session='.length);
  if (!value) return false;
  const segments = value.split('.');
  if (segments.length !== 3 || !/^\d+$/.test(segments[0])) return false;
  const body = segments.slice(0, 2).join('.');
  return Number(segments[0]) > Date.now() && equal(hash(body), segments[2]);
};
export const passwordValid = password => {
  const salt = process.env.ADMIN_PASSWORD_SALT;
  const target = process.env.ADMIN_PASSWORD_HASH;
  if (!salt || !target || typeof password !== 'string') return false;
  const derived = scryptSync(password, salt, 64).toString('hex');
  return equal(derived, target);
};
export const sessionCookie = token => `ts_admin_session=${token}; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Strict`;
export const clearCookie = 'ts_admin_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict';
