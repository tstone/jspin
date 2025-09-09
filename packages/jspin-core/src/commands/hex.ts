
export function toHex(value: number | undefined, length: number = 2) {
  if (value === undefined) {
    return '0'.repeat(length);
  }
  return Math.round(value).toString(16).padStart(length, '0');
}