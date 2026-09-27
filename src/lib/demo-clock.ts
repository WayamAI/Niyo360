/**
 * The instant this demo dataset is authored against.
 *
 * Every record in src/data ships with dates written around 22 May 2025:
 * FEED_EVENTS deadlines, the pre-computed `daysRemaining` and
 * `slaDaysRemaining` fields, the audit timestamps, the calendar window. Code
 * that asked the real clock instead therefore disagreed with the data it sat
 * next to — by the time this is read, every deadline in the set is in the past
 * and the whole Deadline column renders OVERDUE in red, which is both wrong
 * and hides the two records that genuinely are at risk.
 *
 * Anchoring here keeps the derived values consistent with the stored ones.
 * When this app is wired to a live backend, this module is the single place
 * that has to change.
 */
export const DEMO_NOW = new Date("2025-05-22T09:20:00");

/** Milliseconds of real time elapsed since the app booted. */
const BOOT = Date.now();

/**
 * "Now" inside the dataset's world, advancing in real time from DEMO_NOW so
 * entries logged during a session stay in order instead of all sharing one
 * timestamp.
 */
export function demoNow(): Date {
  return new Date(DEMO_NOW.getTime() + (Date.now() - BOOT));
}

/** `YYYY-MM-DD HH:mm`, the format the audit log stores. */
export function demoTimestamp(): string {
  const d = demoNow();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
