import { createSession, loggedIn, passwordValid, sameOrigin, send, sessionCookie, clearCookie } from '../lib/security.js';

export default async function handler(req, res) {
  if (req.method === 'GET') return send(res, 200, { authenticated: loggedIn(req) });
  if (!sameOrigin(req)) return send(res, 403, { error: '출처를 확인할 수 없습니다.' });
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearCookie);
    return send(res, 200, { authenticated: false });
  }
  if (req.method !== 'POST') return send(res, 405, { error: '지원하지 않는 요청입니다.' });
  if (!process.env.ADMIN_PASSWORD_SALT || !process.env.ADMIN_PASSWORD_HASH || !process.env.ADMIN_SESSION_SECRET) {
    return send(res, 503, { error: '관리자 인증이 아직 설정되지 않았습니다.' });
  }
  if (JSON.stringify(req.body || {}).length > 500) return send(res, 400, { error: '잘못된 요청입니다.' });
  const username = String(req.body?.username || '').trim();
  if (username !== (process.env.ADMIN_USERNAME || 'admin') || !passwordValid(req.body?.password)) {
    return send(res, 401, { error: '아이디 또는 비밀번호를 확인해 주세요.' });
  }
  res.setHeader('Set-Cookie', sessionCookie(createSession()));
  return send(res, 200, { authenticated: true });
}
