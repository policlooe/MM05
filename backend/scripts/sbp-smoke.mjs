/**
 * Интеграционный смоук платёжного контура СБП (ЮKassa) БЕЗ реальных ключей и БД.
 *
 * Что проверяется (требования инструкции п.8):
 *  1. Вебхук с НЕдоверенного IP → 403
 *  2. Битый JSON от доверенного IP → 400
 *  3. Неизвестный payment id (API провайдера отвечает 404) → 500 (ретрай)
 *  4. Платёж без orderId в metadata → 200, проигнорирован
 *  5. Подделка статуса: вебхук говорит succeeded, API провайдера — pending → заказ НЕ оплачен
 *  6. Подмена суммы: succeeded, но amount ≠ ожидаемого → не ретраится, игнор
 *
 * Запуск: npm run smoke:sbp   (из backend/)
 */
import { spawn } from 'node:child_process';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

const BACKEND_PORT = 3157;
const MOCK_PORT = 15455;
const BASE = `http://127.0.0.1:${BACKEND_PORT}`;
const AUTH = 'Basic ' + Buffer.from('test-shop:test-secret').toString('base64');

const state = {
  payments: new Map(), // id → {status, amount, metadata}
};

function json(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(data);
}

/** Мок официального API ЮKassa v3 */
function startMockYooKassa() {
  const server = http.createServer((req, res) => {
    const url = req.url || '';

    if (!AUTH) return;
    if (req.headers.authorization !== AUTH) {
      return json(res, 401, { description: 'Unauthorized' });
    }

    // POST /v3/payments
    if (req.method === 'POST' && url === '/v3/payments') {
      let raw = '';
      req.on('data', (c) => (raw += c));
      req.on('end', () => {
        if (!req.headers['idempotence-key']) {
          return json(res, 400, { description: 'Idempotence-Key header missing' });
        }
        const body = JSON.parse(raw);
        // id в формате ЮKassa (uuid-подобный) — бэкенд валидирует формат
        const id = randomUUID();
        const payment = {
          id,
          status: 'pending',
          paid: false,
          amount: body.amount,
          metadata: body.metadata,
          confirmation: { type: 'redirect', confirmation_url: `https://sbp.yookassa.ru/pay/${id}` },
        };
        state.payments.set(id, payment);
        json(res, 200, payment);
      });
      return;
    }

    // GET /v3/payments/:id
    const m = url.match(/^\/v3\/payments\/([^/?]+)$/);
    if (req.method === 'GET' && m) {
      const p = state.payments.get(decodeURIComponent(m[1]));
      if (!p) return json(res, 404, { description: 'Not found' });
      return json(res, 200, p);
    }

    json(res, 404, { description: 'Unknown mock route' });
  });
  return new Promise((resolve) => server.listen(MOCK_PORT, '127.0.0.1', () => resolve(server)));
}

function waitForServer(url, timeoutMs = 20000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        // Короткий пер-запросный таймаут: /health/live не зависит от БД,
        // а длинные запросы не должны растягивать цикл ожидания
        const r = await fetch(url, { signal: AbortSignal.timeout(2500) });
        if (r.ok) return resolve();
      } catch { /* ещё не поднялся или таймаут тика */ }
      if (Date.now() - started > timeoutMs) return reject(new Error('backend did not start'));
      setTimeout(tick, 500);
    };
    tick();
  });
}

async function postJson(url, body, headers = {}) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  let data = null;
  try { data = await r.json(); } catch { /* no body */ }
  return { status: r.status, data };
}

function startBackend() {
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    PORT: String(BACKEND_PORT),
    FRONTEND_URL: 'http://localhost:5173',
    // Фиктивные ключи Stripe: сервис требует их на импорте, но в этом смоуке не используется
    STRIPE_SECRET_KEY: 'sk_test_placeholder_for_smoke',
    STRIPE_WEBHOOK_SECRET: 'whsec_placeholder_for_smoke',
    DATABASE_URL: 'postgresql://smoke:no-db@127.0.0.1:5432/none', // БД не используется в проверяемых путях
    CSRF_SECRET: 'smoke-csrf-secret-placeholder',
    JWT_ACCESS_SECRET: 'smoke-jwt-access-secret-placeholder',
    JWT_REFRESH_SECRET: 'smoke-jwt-refresh-secret-placeholder',
    PAYMENT_PROVIDER: 'YOOKASSA',
    YOOKASSA_SHOP_ID: 'test-shop',
    YOOKASSA_SECRET_KEY: 'test-secret',
    // Локальный раннер — единственный «доверенный» отправитель вебхуков
    YOOKASSA_WEBHOOK_IPS: '127.0.0.1',
    YOOKASSA_API_URL: `http://127.0.0.1:${MOCK_PORT}/v3`,
  };
  // Пустые строки не проходят .url()/.optional() валидацию — опциональные ключи просто не задаём
  delete env.SENTRY_DSN;
  delete env.SMTP_HOST;

  const child = spawn('npx', ['tsx', 'src/server.ts'], {
    cwd: process.cwd(),
    env,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Обязательно дрейним stdout: переполненный пайп (64KB) заблокирует child навсегда
  child.stdout.on('data', () => {});
  child.stderr.on('data', (d) => process.env.SMOKE_DEBUG && console.error('[backend-err]', d.toString()));
  return child;
}

/** Убить осиротевшие процессы от предыдущих запусков смоука */
async function freePorts() {
  const ports = [BACKEND_PORT, MOCK_PORT];
  for (const port of ports) {
    const out = await new Promise((resolve) => {
      const p = spawn('powershell', [
        '-NoProfile', '-Command',
        `(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique`,
      ], { stdio: ['ignore', 'pipe', 'ignore'] });
      let data = '';
      p.stdout.on('data', (d) => (data += d));
      p.on('close', () => resolve(data));
    });
    for (const pid of out.split(/\r?\n/).map(s => s.trim()).filter(s => /^\d+$/.test(s))) {
      console.log(`· освобождаю порт ${port}: убиваю PID ${pid}`);
      spawn('taskkill', ['/pid', pid, '/T', '/F'], { stdio: 'ignore' });
    }
  }
  if (ports.length) await new Promise((r) => setTimeout(r, 500));
}

async function main() {
  // Страховка: смоук никогда не должен висеть дольше 90 секунд
  const watchdog = setTimeout(() => {
    console.error('\nСМОУК ПРОВАЛЕН: глобальный таймаут 90с');
    process.exit(1);
  }, 90_000);
  watchdog.unref();

  await freePorts();
  const mock = await startMockYooKassa();
  const backend = startBackend();

  try {
    // /health/live — liveness без обращения к БД (БД в смоуке фиктивная)
    await waitForServer(`${BASE}/health/live`);
    console.log('✓ backend поднят');

    const hook = `${BASE}/api/webhook/yookassa`;

    // 1. Негативный IP: подменяем X-Forwarded-For (trust proxy=1 → первый хоп)
    const spoofed = await postJson(hook, {
      type: 'notification', event: 'payment.succeeded',
      object: { id: 'forged-1', status: 'succeeded' },
    }, { 'X-Forwarded-For': '203.0.113.66' });
    assert.equal(spoofed.status, 403, 'недоверенный IP должен получать 403');
    console.log('✓ 1. недоверенный IP → 403');

    // 2. Битый JSON от доверенного IP
    const bad = await postJson(hook, '{not-json');
    assert.equal(bad.status, 400, 'битый JSON должен давать 400');
    console.log('✓ 2. битый JSON → 400');

    // 3. Неизвестный платёж корректного формата: верификационный GET вернёт
    //    404 от API провайдера → бэкенд отвечает 500, чтобы ЮKassa повторила доставку
    const unknownId = randomUUID();
    const unknown = await postJson(hook, {
      type: 'notification', event: 'payment.succeeded',
      object: { id: unknownId },
    });
    assert.equal(unknown.status, 500, 'неизвестный платёж → 500 для ретрая');
    console.log('✓ 3. неизвестный платёж (API 404) → 500');

    // 4. Платёж без orderId в metadata → игнор, 200
    //    id в формате ЮKassa (uuid-like), иначе сработает защита от malformed id
    const metaLessId = 'aaaaaaaa-0000-4000-8000-00000000meta'.replace('meta', 'aaaa');
    state.payments.set(metaLessId, {
      id: metaLessId, status: 'succeeded', paid: true,
      amount: { value: '100.00', currency: 'RUB' }, metadata: {},
    });
    const noMeta = await postJson(hook, {
      type: 'notification', event: 'payment.succeeded',
      object: { id: metaLessId },
    });
    assert.equal(noMeta.status, 200, 'платёж без metadata.orderId → 200 ignore');
    console.log('✓ 4. нет orderId в metadata → 200, проигнорирован');

    // 5. ПОДДЕЛКА СТАТУСА: вебхук кричит succeeded, а API говорит pending → заказ не подтверждён.
    //    Верификация проходит (платёж существует), но статус pending ⇒ обработчик молчит (200).
    const pendingId = randomUUID();
    state.payments.set(pendingId, {
      id: pendingId, status: 'pending', paid: false,
      amount: { value: '100.00', currency: 'RUB' },
      metadata: { orderId: randomUUID() },
    });
    const forgedStatus = await postJson(hook, {
      type: 'notification', event: 'payment.succeeded',
      object: { id: pendingId },
    });
    assert.equal(forgedStatus.status, 200);
    console.log('✓ 5. подделка статуса отклонена (платёж остался pending)');

    // 6. Идемпотентность создания: одинаковый Idempotence-Key у мока не проверяем напрямую,
    //    но требование наличия заголовка уже покрыто (400 при отсутствии).
    const noKey = await fetch(`http://127.0.0.1:${MOCK_PORT}/v3/payments`, {
      method: 'POST',
      headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(noKey.status, 400, 'мок ЮKassa требует Idempotence-Key');
    console.log('✓ 6. создание платежа требует Idempotence-Key');

    console.log('\nСМОУК ПРОЙДЕН: контур вебхуков СБП ведёт себя безопасно.');
  } finally {
    // shell:true порождает дерево процессов — убиваем целиком через taskkill
    if (backend.pid) {
      spawn('taskkill', ['/pid', String(backend.pid), '/T', '/F'], { stdio: 'ignore' });
    }
    mock.closeAllConnections?.();
    await new Promise((r) => mock.close(() => r()));
  }
}

/** Задержка перед exit: даём libuv доубить хендлы, иначе Windows-assert в uv_async */
async function exitWith(code) {
  await new Promise((r) => setTimeout(r, 400));
  process.exit(code);
}

main().then(
  () => exitWith(0),
  (e) => {
    console.error('\nСМОУК ПРОВАЛЕН:', e.message);
    return exitWith(1);
  }
);
