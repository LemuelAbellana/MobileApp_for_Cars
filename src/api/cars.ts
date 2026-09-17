import { getApiConfig } from '../config/env.ts';
import type { Car, CarInput } from '../types/car.ts';

export type ApiErrorCode =
  | 'CONFIG'
  | 'UNAUTHORIZED'
  | 'HTTP'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'BAD_RESPONSE';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_SERVER_MESSAGE_LENGTH = 200;
const AUTH_GUIDANCE =
  'Check EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN in .env.local, then restart Expo.';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  query?: Record<string, string>;
  body?: CarInput;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function badResponse(): never {
  throw new ApiError('BAD_RESPONSE', 'The server returned unexpected car data.');
}

function requiredString(record: Record<string, unknown>, field: keyof Car): string {
  const value = record[field];
  if (typeof value !== 'string') badResponse();
  return value.trim();
}

function finiteNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return badResponse();
}

export function normalizeCar(value: unknown): Car {
  if (!isRecord(value)) return badResponse();

  const id = finiteNumber(value.id);
  const year = finiteNumber(value.year);
  const price = finiteNumber(value.price);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(year) || price < 0) {
    return badResponse();
  }

  return {
    id,
    brand: requiredString(value, 'brand'),
    model: requiredString(value, 'model'),
    year,
    color: requiredString(value, 'color'),
    price,
    fuel_type: requiredString(value, 'fuel_type'),
    transmission: requiredString(value, 'transmission'),
    picture: typeof value.picture === 'string' ? value.picture.trim() : '',
  };
}

function assertId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError('BAD_RESPONSE', 'A positive car ID is required.');
  }
}

function sanitizeServerMessage(message: string, token: string): string | undefined {
  const sanitized = message.replaceAll(token, '[redacted]').replace(/\s+/g, ' ').trim();
  if (!sanitized) return undefined;
  return sanitized.length <= MAX_SERVER_MESSAGE_LENGTH
    ? sanitized
    : `${sanitized.slice(0, MAX_SERVER_MESSAGE_LENGTH - 3)}...`;
}

function responseError(body: unknown, token: string): string | undefined {
  if (!isRecord(body)) return undefined;
  if (typeof body.error === 'string') return sanitizeServerMessage(body.error, token);
  return undefined;
}

function responseMessage(body: unknown, token: string): string | undefined {
  const error = responseError(body, token);
  if (error) return error;
  if (!isRecord(body)) return undefined;
  if (typeof body.message === 'string') return sanitizeServerMessage(body.message, token);
  return undefined;
}

async function request(options: RequestOptions = {}): Promise<unknown> {
  let config;
  try {
    config = getApiConfig();
  } catch (error) {
    throw new ApiError(
      'CONFIG',
      error instanceof Error ? error.message : 'The Cars API is not configured.',
    );
  }

  const url = new URL(config.url);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${config.token}`,
  };
  if (options.body) headers['Content-Type'] = 'application/json';

  try {
    const response = await fetch(url.toString(), {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    const text = await response.text();
    let body: unknown;
    if (text.trim()) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    const serverError = responseError(body, config.token);
    if (response.status === 401) {
      const detail = responseMessage(body, config.token);
      throw new ApiError(
        'UNAUTHORIZED',
        detail ? `${detail}. ${AUTH_GUIDANCE}` : `The Cars API rejected authorization. ${AUTH_GUIDANCE}`,
        response.status,
      );
    }
    if (!response.ok) {
      throw new ApiError(
        'HTTP',
        responseMessage(body, config.token) ?? `The Cars API request failed (${response.status}).`,
        response.status,
      );
    }
    if (serverError) throw new ApiError('HTTP', serverError, response.status);
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new ApiError('TIMEOUT', 'The Cars API request timed out.');
    }
    throw new ApiError('NETWORK', 'Unable to reach the Cars API.');
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeCars(value: unknown): Car[] {
  if (!Array.isArray(value)) return badResponse();
  return value.map(normalizeCar);
}

export async function getCars(): Promise<Car[]> {
  return normalizeCars(await request());
}

export async function getCar(id: number): Promise<Car> {
  assertId(id);
  // Contract assumption: GET ?id returns one object; authenticated shape is not yet verified.
  return normalizeCar(await request({ query: { id: String(id) } }));
}

export async function searchCarsByBrand(brand: string): Promise<Car[]> {
  return normalizeCars(await request({ query: { brand: brand.trim() } }));
}

export async function searchCarsByModel(model: string): Promise<Car[]> {
  return normalizeCars(await request({ query: { model: model.trim() } }));
}

export async function createCar(input: CarInput): Promise<void> {
  await request({ method: 'POST', body: input });
}

export async function updateCar(id: number, input: CarInput): Promise<void> {
  assertId(id);
  await request({ method: 'PUT', query: { id: String(id) }, body: input });
}

export async function deleteCar(id: number): Promise<void> {
  assertId(id);
  await request({ method: 'DELETE', query: { id: String(id) } });
}
