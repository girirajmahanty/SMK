import { useEffect, useState } from 'react';
import { festivalSchedule } from './festivalSchedule.js';

const DAY = 24 * 60 * 60 * 1000;
const IST_OFFSET = 5.5 * 60 * 60 * 1000;
const TIME_ZONE = 'Asia/Kolkata';

function dayParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

// A date-only festival day represented as midnight in Asia/Kolkata.
function isValidDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

const parseDay = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day) - IST_OFFSET);
};

const today = (now = new Date()) => {
  const { year, month, day } = dayParts(now);
  return parseDay(`${year}-${month}-${day}`);
};

const addDays = (date, count) => new Date(date.getTime() + count * DAY);

function nextMidnightDelay() {
  const { year, month, day } = dayParts(new Date());
  const next = addDays(parseDay(`${year}-${month}-${day}`), 1);
  return Math.max(1000, next.getTime() - Date.now());
}

function verifiedRanges(festivalName) {
  const schedule = festivalSchedule[festivalName];
  if (!schedule) {
    console.error(`Missing festival date verification record for "${festivalName}".`);
    return [];
  }
  if (schedule.verificationStatus !== 'verified') return [];
  return schedule.occurrences.flatMap((occurrence) => {
    const end = occurrence.end || occurrence.start;
    const hasVerification = occurrence.sources?.length || occurrence.verifiedBy === 'local-user';
    if (occurrence.status !== 'verified' || !isValidDay(occurrence.start) || !isValidDay(end) || end < occurrence.start || !hasVerification) {
      console.error(`Invalid verified date record for "${festivalName}".`, occurrence);
      return [];
    }
    return [{ start: parseDay(occurrence.start), end: parseDay(end) }];
  }).sort((a, b) => a.start - b.start);
}

export function nextFestivalOccurrence(festivalName, now = new Date()) {
  const currentDay = today(now);
  for (const range of verifiedRanges(festivalName)) {
    if (range.end >= currentDay) return range;
  }
  return null;
}

export function needsDateVerification(festivalName, range) {
  return !range && festivalSchedule[festivalName]?.verificationStatus === 'verified';
}

// The curated dates are year-specific; refresh at Kolkata midnight to move past
// an event that ended while the page was open.
export function useFestivalDates(list) {
  const [, refresh] = useState(0);
  useEffect(() => {
    let timer;
    const scheduleRefresh = () => {
      timer = setTimeout(() => {
        refresh((value) => value + 1);
        scheduleRefresh();
      }, nextMidnightDelay());
    };
    scheduleRefresh();
    return () => clearTimeout(timer);
  }, []);
  return list.map((festival) => {
    if (isValidDay(festival.startDate) && (!festival.endDate || isValidDay(festival.endDate)) && (!festival.endDate || festival.endDate >= festival.startDate)) {
      return { start: parseDay(festival.startDate), end: parseDay(festival.endDate || festival.startDate) };
    }
    return nextFestivalOccurrence(festival.name.en);
  });
}

export function festivalStatus(list, dates = [], now = new Date()) {
  const currentDay = today(now);
  let bestIndex = -1;
  let bestStart = Infinity;
  for (let index = 0; index < list.length; index++) {
    const range = dates[index];
    if (!range) continue;
    if (range.start <= currentDay && currentDay <= range.end) {
      return { index, kind: 'now' };
    }
    if (range.start > currentDay && range.start.getTime() < bestStart) {
      bestStart = range.start.getTime();
      bestIndex = index;
    }
  }
  return { index: bestIndex, kind: 'next' };
}

export function formatRange(range, lang) {
  const oneDay = range.start.getTime() === range.end.getTime();
  const format = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-IN' : 'en-IN', {
    timeZone: TIME_ZONE,
    ...(oneDay && { weekday: 'short' }),
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return oneDay ? format.format(range.start) : format.formatRange(range.start, range.end);
}

export const daysUntil = (range, now = new Date()) =>
  Math.max(0, Math.round((range.start.getTime() - today(now).getTime()) / DAY));
