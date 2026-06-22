const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export type Period = 'Today' | 'Week' | 'Month';

// Trailing windows (last 7/30 days inclusive of today), not calendar week/month — a
// dealer checking "how's this week going" mid-week cares about the last 7 days, not a
// partial calendar week that resets on a fixed day.
export function getPeriodStartDateString(period: Period): string {
  if (period === 'Today') return getTodayDateString();
  const date = new Date();
  date.setDate(date.getDate() - (period === 'Week' ? 6 : 29));
  return date.toISOString().slice(0, 10);
}

export function periodLabel(period: Period): string {
  if (period === 'Today') return 'today';
  return period === 'Week' ? 'this week' : 'this month';
}

export function formatHeaderDate(date: Date = new Date()): string {
  return `${WEEKDAYS[date.getDay()]} · ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// Takes a "YYYY-MM-DD" date_of_entry/date_of_sale string, e.g. "2026-06-10" -> "10 Jun".
export function formatShortDate(dateString: string): string {
  const [, month, day] = dateString.split('-').map(Number);
  const monthName = MONTHS[month - 1];
  return `${day} ${monthName.charAt(0)}${monthName.slice(1).toLowerCase()}`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours24 = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours24 < 12 ? 'AM' : 'PM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${period}`;
}
