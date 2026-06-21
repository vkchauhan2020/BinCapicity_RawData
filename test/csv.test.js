import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entriesToCsv, escapeCsvField } from '../src/csv.js';

test('escapeCsvField leaves plain values untouched', () => {
  assert.equal(escapeCsvField('ABC123'), 'ABC123');
  assert.equal(escapeCsvField(42), '42');
});

test('escapeCsvField quotes values containing commas, quotes, or newlines', () => {
  assert.equal(escapeCsvField('a,b'), '"a,b"');
  assert.equal(escapeCsvField('a"b'), '"a""b"');
  assert.equal(escapeCsvField('a\nb'), '"a\nb"');
});

test('entriesToCsv produces the exact required header row', () => {
  const csv = entriesToCsv([]);
  assert.equal(csv, 'Article,Case L,Case W,Case H,Weight (g),EA/Box');
});

test('entriesToCsv converts kg to grams and rounds correctly', () => {
  const csv = entriesToCsv([
    { article: 'ART1', l: 30, w: 20, h: 10, weightKg: 2.5, eaPerBox: 12 },
  ]);
  const lines = csv.split('\r\n');
  assert.equal(lines[1], 'ART1,30,20,10,2500,12');
});

test('entriesToCsv handles multiple rows joined with CRLF', () => {
  const csv = entriesToCsv([
    { article: 'A1', l: 1, w: 2, h: 3, weightKg: 1, eaPerBox: 1 },
    { article: 'A2', l: 4, w: 5, h: 6, weightKg: 0.5, eaPerBox: 2 },
  ]);
  const lines = csv.split('\r\n');
  assert.equal(lines.length, 3);
  assert.equal(lines[1], 'A1,1,2,3,1000,1');
  assert.equal(lines[2], 'A2,4,5,6,500,2');
});
