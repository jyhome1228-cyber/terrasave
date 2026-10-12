import { randomUUID } from 'node:crypto';
import { get, list, put } from '@vercel/blob';
import { cors, loggedIn, sameOrigin, send } from '../lib/security.js';

const intakeFields = ['inquiryType', 'name', 'company', 'email', 'phone', 'message'];
const limits = { inquiryType: 100, name: 100, company: 120, email: 200, phone: 50, message: 6000 };
const types = new Set(['제품 구매 및 공급', '샘플·테스트', '맞춤형 제품개발', '공동 R&D·라이선싱', '기타 문의']);
const validId = id => /^[a-f0-9-]{36}$/.test(String(id || ''));
const readJSON = async pathname => {
  const file = await get(pathname, { access: 'private' });
  return file?.statusCode === 200 ? new Response(file.stream).json() : null;
};
const storageReady = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    const allowed = cors(req, res);
    return res.status(allowed ? 204 : 403).end();
  }
  if (!storageReady()) return send(res, 503, { error: '접수 저장소가 아직 준비되지 않았습니다.' });

  if (req.method === 'POST') {
    if (!cors(req, res)) return send(res, 403, { error: '접수 허용 사이트가 아닙니다.' });
    const body = req.body || {};
    if (JSON.stringify(body).length > 14500) return send(res, 413, { error: '입력 가능한 글자 수를 초과했습니다.' });
    if (body.website) return send(res, 200, { accepted: false });
    const age = Date.now() - Number(body.startedAt);
    if (!Number.isFinite(age) || age < 1200 || age > 86_400_000) return send(res, 400, { error: '폼을 다시 열어 접수해 주세요.' });
    if (body.privacyConsent !== true) return send(res, 400, { error: '개인정보 수집 동의가 필요합니다.' });
    const fields = Object.fromEntries(intakeFields.map(key => [key, String(body[key] || '').trim()]));
    if (!types.has(fields.inquiryType) || fields.name.length < 1 || !/^\S+@\S+\.\S+$/.test(fields.email) || fields.message.length < 5) {
      return send(res, 400, { error: '필수 항목을 확인해 주세요.' });
    }
    if (intakeFields.some(key => fields[key].length > limits[key])) return send(res, 400, { error: '입력 가능한 글자 수를 초과했습니다.' });
    const entry = {
      id: randomUUID(), createdAt: new Date().toISOString(), status: 'new', memo: '', ...fields,
    };
    try {
      await put(`inquiries/${entry.createdAt.replace(/[:.]/g, '-')}-${entry.id}.json`, JSON.stringify(entry), {
        access: 'private', contentType: 'application/json', addRandomSuffix: false,
      });
      return send(res, 201, { accepted: true, receiptId: entry.id });
    } catch {
      return send(res, 503, { error: '일시적인 접수 오류입니다. 잠시 후 다시 시도해 주세요.' });
    }
  }

  if (!loggedIn(req)) return send(res, 401, { error: '관리자 로그인 후 이용할 수 있습니다.' });

  if (req.method === 'GET') {
    try {
      let cursor, all = [];
      do {
        const page = await list({ prefix: 'inquiries/', limit: 1000, cursor });
        all.push(...page.blobs);
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor && all.length < 10000);
      const selected = all.sort((a, b) => b.pathname.localeCompare(a.pathname)).slice(0, 200);
      const entries = (await Promise.all(selected.map(blob => readJSON(blob.pathname).catch(() => null)))).filter(Boolean);
      const statusEntries = await Promise.all(entries.map(async entry => {
        const status = await readJSON(`states/${entry.id}.json`).catch(() => null);
        return { ...entry, status: status?.status || entry.status, memo: status?.memo || '', updatedAt: status?.updatedAt || null };
      }));
      return send(res, 200, { inquiries: statusEntries, total: all.length, limit: 200 });
    } catch {
      return send(res, 503, { error: '접수 목록을 불러오지 못했습니다.' });
    }
  }

  if (req.method === 'PATCH') {
    if (!sameOrigin(req)) return send(res, 403, { error: '출처가 일치하지 않습니다.' });
    const id = req.body?.id;
    const status = req.body?.status;
    const memo = String(req.body?.memo || '').trim();
    if (!validId(id) || !['new', 'reviewing', 'replied', 'closed'].includes(status) || memo.length > 2000) {
      return send(res, 400, { error: '입력 내용을 확인해 주세요.' });
    }
    try {
      const state = { id, status, memo, updatedAt: new Date().toISOString() };
      await put(`states/${id}.json`, JSON.stringify(state), {
        access: 'private', contentType: 'application/json', allowOverwrite: true, cacheControlMaxAge: 60,
      });
      return send(res, 200, { updated: true, ...state });
    } catch {
      return send(res, 503, { error: '상태 저장에 실패했습니다.' });
    }
  }
  return send(res, 405, { error: '지원하지 않는 요청입니다.' });
}
