import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanceCm } from '../src/dimensions-ar.js';

test('distanceCm computes axis-aligned distance correctly', () => {
  const p1 = { x: 0, y: 0, z: 0 };
  const p2 = { x: 1, y: 0, z: 0 };
  assert.equal(distanceCm(p1, p2), 100);
});

test('distanceCm computes 3-4-5 triangle hypotenuse scaled to meters', () => {
  const p1 = { x: 0, y: 0, z: 0 };
  const p2 = { x: 3, y: 4, z: 0 };
  assert.equal(distanceCm(p1, p2), 500);
});

test('distanceCm returns 0 for identical points', () => {
  const p = { x: 1, y: 2, z: 3 };
  assert.equal(distanceCm(p, p), 0);
});
