export function isValidImei(value: string): boolean {
  return /^\d{15}$/.test(value);
}

// Shows the TAC (first 6 digits — identifies make/model, not sensitive) and the
// last 4. Hides the middle serial digits, which is the part worth not exposing.
// IMEI is optional (some devices, e.g. accessories, don't have one) — null in, null out.
export function maskImei(imei: string | null): string | null {
  if (!imei) return null;
  if (imei.length <= 10) return imei;
  return `${imei.slice(0, 6)} ·· ${imei.slice(-4)}`;
}
