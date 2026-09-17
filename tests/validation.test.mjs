import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCar } from '../src/utils/validation.ts';

const fields = { brand: ' Toyota ', model: ' Vios ', year: '2024', color: ' White ', price: '732000.50', fuel_type: ' Gasoline ', transmission: ' CVT ', picture: ' https://example.com/car.jpg ' };

test('valid form trims fields and produces numeric API values', () => {
  const result = validateCar(fields);
  assert.deepEqual(result.errors, {});
  assert.equal(result.input.brand, 'Toyota');
  assert.equal(result.input.price, 732000.5);
  assert.equal(result.input.year, 2024);
});

test('invalid inputs never coerce blanks, nonfinite numbers or unsafe URLs into records', () => {
  for (const [field, value] of [['brand', ' '], ['model', ''], ['year', '2024.5'], ['year', '100'], ['price', ''], ['price', '-1'], ['price', 'Infinity'], ['picture', 'javascript:alert(1)'], ['picture', 'https://user:password@example.com/car.jpg']]) {
    const result = validateCar({ ...fields, [field]: value });
    assert.ok(result.errors[field], `${field} should reject invalid value`);
    assert.equal(result.input, undefined);
  }
  assert.equal(validateCar({ ...fields, price: '0' }).input.price, 0);
});
