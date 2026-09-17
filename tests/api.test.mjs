import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
  ApiError,
  createCar,
  deleteCar,
  getCar,
  getCars,
  normalizeCar,
  searchCarsByBrand,
  searchCarsByModel,
  updateCar,
} from '../src/api/cars.ts';
import { getApiConfig } from '../src/config/env.ts';

const originalFetch = globalThis.fetch;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const originalUrl = process.env.EXPO_PUBLIC_CARS_API_URL;
const originalToken = process.env.EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN;

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
  setEnv('EXPO_PUBLIC_CARS_API_URL', originalUrl);
  setEnv('EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN', originalToken);
});

function setEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function configure() {
  process.env.EXPO_PUBLIC_CARS_API_URL = 'http://api.example.test/cars.php';
  process.env.EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN = 'local-test-token';
}

function car(overrides = {}) {
  return {
    id: '7',
    brand: ' Toyota ',
    model: 'Vios',
    year: '2024',
    color: 'White',
    price: '732000.50',
    fuel_type: 'Gasoline',
    transmission: 'CVT',
    picture: null,
    ...overrides,
  };
}

test('normalizes PHP numeric strings and a missing picture at the API boundary', () => {
  assert.deepEqual(normalizeCar(car()), {
    id: 7,
    brand: 'Toyota',
    model: 'Vios',
    year: 2024,
    color: 'White',
    price: 732000.5,
    fuel_type: 'Gasoline',
    transmission: 'CVT',
    picture: '',
  });
});

test('rejects malformed numeric API fields instead of partially parsing them', () => {
  for (const [field, value] of [
    ['id', '7x'],
    ['year', '2024.5'],
    ['price', ''],
  ]) {
    assert.throws(
      () => normalizeCar(car({ [field]: value })),
      (error) => error instanceof ApiError && error.code === 'BAD_RESPONSE',
    );
  }
});

test('reads config at call time and rejects a missing or placeholder token', () => {
  setEnv('EXPO_PUBLIC_CARS_API_URL', undefined);
  setEnv('EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN', undefined);
  assert.throws(() => getApiConfig(), /EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN/);

  process.env.EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN = 'replace_me_locally';
  assert.throws(() => getApiConfig(), /EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN/);

  process.env.EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN = 'later-token';
  assert.deepEqual(getApiConfig(), {
    url: 'http://lemzy.duckdns.org/cars.php',
    token: 'later-token',
  });
});

test('rejects non-HTTP API URLs and URLs containing credentials', () => {
  process.env.EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN = 'local-test-token';
  for (const url of ['ftp://api.example.test/cars.php', 'http://user:pass@api.example.test/cars.php']) {
    process.env.EXPO_PUBLIC_CARS_API_URL = url;
    assert.throws(() => getApiConfig(), /valid HTTP or HTTPS URL/);
  }
});

test('lists and searches cars with encoded query values and a central bearer header', async () => {
  configure();
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return new Response(JSON.stringify([car()]), {
      headers: { 'content-type': 'text/html; charset=UTF-8' },
    });
  };

  assert.equal((await getCars())[0].id, 7);
  assert.equal((await searchCarsByBrand('Land Rover'))[0].brand, 'Toyota');
  assert.equal((await searchCarsByModel('A&B'))[0].model, 'Vios');
  assert.deepEqual(
    requests.map(({ url }) => url),
    [
      'http://api.example.test/cars.php',
      'http://api.example.test/cars.php?brand=Land+Rover',
      'http://api.example.test/cars.php?model=A%26B',
    ],
  );
  assert.equal(requests[0].init.headers.Authorization, 'Bearer local-test-token');
});

test('gets and normalizes one car', async () => {
  configure();
  let requestedUrl = '';
  globalThis.fetch = async (url) => {
    requestedUrl = String(url);
    return new Response(JSON.stringify(car()));
  };

  assert.equal((await getCar(7)).price, 732000.5);
  assert.equal(requestedUrl, 'http://api.example.test/cars.php?id=7');
});

test('maps authorization failures to actionable guidance without trusting body format', async () => {
  configure();
  for (const body of ['', '<html><body>Unauthorized</body></html>', '{"error":"Invalid token"}']) {
    globalThis.fetch = async () => new Response(body, { status: 401 });
    await assert.rejects(
      getCars(),
      (error) =>
        error instanceof ApiError &&
        error.code === 'UNAUTHORIZED' &&
        error.status === 401 &&
        error.message.includes('EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN') &&
        error.message.toLowerCase().includes('restart') &&
        !error.message.includes('<html>'),
    );
  }
});

test('rejects malformed success responses', async () => {
  configure();

  globalThis.fetch = async () => new Response('{broken', { status: 200 });
  await assert.rejects(
    getCars(),
    (error) => error instanceof ApiError && error.code === 'BAD_RESPONSE',
  );
});

test('shows bounded server messages without echoing the bearer token', async () => {
  configure();
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: `Maintenance local-test-token ${'x'.repeat(500)}` }), {
      status: 503,
    });

  await assert.rejects(getCars(), (error) =>
    error instanceof ApiError &&
    error.code === 'HTTP' &&
    error.message.startsWith('Maintenance') &&
    !error.message.includes('local-test-token') &&
    error.message.length <= 241,
  );
});

test('maps fetch rejection and request abortion to distinct errors', async () => {
  configure();
  globalThis.fetch = async () => { throw new Error('socket failed'); };
  await assert.rejects(
    getCars(),
    (error) => error instanceof ApiError && error.code === 'NETWORK',
  );

  globalThis.setTimeout = (callback) => {
    callback();
    return 1;
  };
  globalThis.clearTimeout = () => {};
  globalThis.fetch = async (_url, { signal }) => {
    assert.equal(signal.aborted, true);
    throw new DOMException('Aborted', 'AbortError');
  };
  await assert.rejects(
    getCars(),
    (error) => error instanceof ApiError && error.code === 'TIMEOUT',
  );
});

test('rejects bad IDs before any network request', async () => {
  configure();
  globalThis.fetch = async () => { throw new Error('fetch must not run'); };
  const input = {
    brand: 'Toyota', model: 'Vios', year: 2024, color: 'White', price: 1,
    fuel_type: 'Gasoline', transmission: 'CVT', picture: 'https://example.com/car.jpg',
  };

  for (const operation of [getCar(0), getCar(1.5), updateCar(-1, input), deleteCar(Number.NaN)]) {
    await assert.rejects(
      operation,
      (error) => error instanceof ApiError && error.code === 'BAD_RESPONSE',
    );
  }
});

test('sends create, update, and delete requests without assuming mutation bodies', async () => {
  configure();
  const requests = [];
  const responses = [
    new Response('{"message":"created"}'),
    new Response(null, { status: 204 }),
    new Response('deleted'),
  ];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return responses.shift();
  };
  const input = {
    brand: 'Toyota',
    model: 'Vios',
    year: 2024,
    color: 'White',
    price: 732000,
    fuel_type: 'Gasoline',
    transmission: 'CVT',
    picture: 'https://example.com/car.jpg',
  };

  await createCar(input);
  await updateCar(7, input);
  await deleteCar(7);

  assert.deepEqual(requests.map(({ init }) => init.method), ['POST', 'PUT', 'DELETE']);
  assert.equal(requests[0].init.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(requests[0].init.body), input);
  assert.equal(requests[1].url, 'http://api.example.test/cars.php?id=7');
  assert.equal(requests[2].url, 'http://api.example.test/cars.php?id=7');
});

test('rejects an error object even when a mutation returns HTTP 200', async () => {
  configure();
  globalThis.fetch = async () => new Response('{"error":"Database rejected write"}');

  await assert.rejects(
    deleteCar(7),
    (error) =>
      error instanceof ApiError &&
      error.code === 'HTTP' &&
      error.message === 'Database rejected write',
  );
});
