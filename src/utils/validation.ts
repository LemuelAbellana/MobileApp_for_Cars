import type { CarInput } from '../types/car.ts';

export type CarFields = { [K in keyof CarInput]: string };
export type FieldErrors = Partial<Record<keyof CarInput, string>>;

export function validateCar(fields: CarFields): { errors: FieldErrors; input?: CarInput } {
  const errors: FieldErrors = {};
  const text = (key: keyof CarFields) => fields[key].trim();
  for (const key of ['brand', 'model', 'color', 'fuel_type', 'transmission'] as const) {
    if (!text(key)) errors[key] = 'This field is required.';
  }
  const year = Number(text('year'));
  const price = Number(text('price'));
  const nextYear = new Date().getFullYear() + 1;
  if (!/^\d{4}$/.test(text('year')) || !Number.isInteger(year) || year < 1886 || year > nextYear) {
    errors.year = `Enter a year from 1886 to ${nextYear}.`;
  }
  if (!/^\d+(\.\d+)?$/.test(text('price')) || !Number.isFinite(price) || price < 0) {
    errors.price = 'Enter a price of zero or more, without commas.';
  }
  try {
    const url = new URL(text('picture'));
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
  } catch {
    errors.picture = 'Enter a full https:// image URL (http:// is allowed for demos).';
  }
  if (Object.keys(errors).length) return { errors };
  return { errors, input: {
    brand: text('brand'), model: text('model'), color: text('color'), year, price,
    fuel_type: text('fuel_type'), transmission: text('transmission'), picture: text('picture'),
  } };
}
