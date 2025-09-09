import { toHex } from "./hex";

export function watchdogSetCmd(timeoutMs: number): string {
  return `WD:${toHex(timeoutMs)}\r`;
}

export function watchdogGetCmd(): string {
  return `WD:?\r`;
}