import test from 'node:test';
import assert from 'node:assert/strict';
import { village } from './village.js';
import { festivalSchedule } from './festivalSchedule.js';
import { daysUntil, festivalStatus, nextFestivalOccurrence } from './festivalDates.js';

const kolkataTime = (value) => new Date(`${value}+05:30`);
const years = [2026, 2027, 2028, 2029, 2030];

test('every displayed festival has verified occurrences for 2026–2030', () => {
  const names = village.festivals.map(({ name }) => name.en);
  assert.equal(names.length, 13);
  assert.equal(new Set(names).size, names.length);
  assert.deepEqual(Object.keys(festivalSchedule).sort(), [...names].sort());

  for (const [name, schedule] of Object.entries(festivalSchedule)) {
    assert.equal(schedule.verificationStatus, 'verified', name);
    for (const year of years) {
      assert.ok(schedule.occurrences.some(({ start }) => start.startsWith(`${year}-`)), `${name} is missing ${year}`);
    }
    for (const occurrence of schedule.occurrences) {
      assert.match(occurrence.start, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(occurrence.sources.length || occurrence.verifiedBy === 'local-user', `${name} has no verification record`);
      if (occurrence.end) assert.ok(occurrence.end >= occurrence.start, `${name} has an invalid range`);
    }
  }
});

test('Kali Puja advances after the current occurrence and uses the corrected 2027 date', () => {
  assert.equal(festivalSchedule['Kali Puja'].occurrences[1].start, '2027-10-28');
  assert.equal(
    nextFestivalOccurrence('Kali Puja', kolkataTime('2027-10-28T00:01:00')).start.toISOString(),
    '2027-10-27T18:30:00.000Z',
  );
  assert.equal(
    nextFestivalOccurrence('Kali Puja', kolkataTime('2027-10-29T00:01:00')).start.toISOString(),
    '2028-10-16T18:30:00.000Z',
  );
});

test('date selection respects the Kolkata day boundary', () => {
  const justAfterMidnightInKolkata = new Date('2027-10-27T18:35:00.000Z');
  assert.equal(
    nextFestivalOccurrence('Kali Puja', justAfterMidnightInKolkata).start.toISOString(),
    '2027-10-27T18:30:00.000Z',
  );
});

test('multi-day festivals stay active through their inclusive end date', () => {
  const festival = village.festivals.find(({ name }) => name.en === 'Durga Puja');
  const duringPuja = kolkataTime('2026-10-19T12:00:00');
  const range = nextFestivalOccurrence('Durga Puja', duringPuja);
  assert.equal(range.start.toISOString(), '2026-10-16T18:30:00.000Z');
  assert.equal(range.end.toISOString(), '2026-10-19T18:30:00.000Z');
  assert.deepEqual(festivalStatus([festival], [range], duringPuja), { index: 0, kind: 'now' });

  const afterPuja = kolkataTime('2026-10-21T00:01:00');
  assert.equal(nextFestivalOccurrence('Durga Puja', afterPuja).start.toISOString(), '2027-10-04T18:30:00.000Z');
});

test('countdowns count calendar days in Asia/Kolkata', () => {
  const range = nextFestivalOccurrence('Hori', kolkataTime('2027-04-05T23:59:00'));
  assert.equal(daysUntil(range, kolkataTime('2027-04-05T23:59:00')), 1);
  assert.equal(daysUntil(range, kolkataTime('2027-04-06T00:01:00')), 0);
});

test('Manasa has separate Nag Panchami and Shravan Sankranti occurrences where they differ', () => {
  const dates = festivalSchedule['Manasa Puja'].occurrences;
  assert.deepEqual(
    dates.filter(({ start }) => start.startsWith('2027-')).map(({ start }) => start),
    ['2027-08-06', '2027-08-17'],
  );
  assert.equal(
    nextFestivalOccurrence('Manasa Puja', kolkataTime('2027-08-07T00:01:00')).start.toISOString(),
    '2027-08-16T18:30:00.000Z',
  );
});
