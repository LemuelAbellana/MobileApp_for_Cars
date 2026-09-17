import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import {
  createCar,
  deleteCar,
  getCar,
  getCars,
  searchCarsByModel,
  updateCar,
} from '../src/api/cars.ts';
import { getApiConfig } from '../src/config/env.ts';

const marker = `CODEX_E2E_${Date.now()}_${randomUUID().slice(0, 8)}`;
const brand = 'CODEX_E2E';

function isOwned(car) {
  return car.brand === brand && car.model === marker;
}

async function findOwned() {
  return (await searchCarsByModel(marker)).filter(isOwned);
}

async function cleanup() {
  const leftovers = await findOwned();
  for (const car of leftovers) await deleteCar(car.id);
  assert.equal((await findOwned()).length, 0, 'E2E cleanup left a test record behind');
}

async function smoke() {
  getApiConfig();
  let failure;

  try {
    await getCars();
    console.log('GET all: ok');

    await createCar({
      brand,
      model: marker,
      year: 2024,
      color: 'White',
      price: 1,
      fuel_type: 'Gasoline',
      transmission: 'Automatic',
      picture: 'https://example.com/car.jpg',
    });

    const matches = await findOwned();
    assert.equal(matches.length, 1, 'POST did not create exactly one isolated E2E record');
    const id = matches[0].id;
    assert.equal((await getCar(id)).model, marker, 'GET by id did not return the E2E record');

    await updateCar(id, {
      brand,
      model: marker,
      year: 2024,
      color: 'Black',
      price: 1,
      fuel_type: 'Gasoline',
      transmission: 'Automatic',
      picture: 'https://example.com/car.jpg',
    });
    assert.equal((await getCar(id)).color, 'Black', 'PUT change did not persist');

    await deleteCar(id);
    assert.equal((await findOwned()).length, 0, 'DELETE did not remove the E2E record');
    console.log('POST / GET one / PUT / DELETE: ok');
  } catch (error) {
    failure = error;
  }

  try {
    await cleanup();
    console.log('Cleanup: ok');
  } catch (cleanupError) {
    console.error(`Cleanup marker: ${marker}`);
    if (failure) {
      throw new AggregateError([failure, cleanupError], 'API smoke failed and cleanup also failed');
    }
    throw cleanupError;
  }

  if (failure) throw failure;
}

smoke().catch((error) => {
  console.error(error instanceof Error ? `${error.name}: ${error.message}` : 'API smoke failed');
  process.exitCode = 1;
});
