import { Switch } from "../hardware/switch";
import { toHex } from "./hex";

export function configureSwitchCmd(config: SwitchConfig): string {
  const debounceClose = config.debounceCloseMs !== undefined ? toHex(config.debounceCloseMs) : toHex(2);
  const debounceOpen = config.debounceOpenMs !== undefined ? toHex(config.debounceOpenMs) : toHex(20);

  const mode = config.inverted ? '2' : '1';
  const id = typeof config.switchId === 'number' ? config.switchId : config.switchId?.id;
  return `SL:${toHex(id)},${debounceClose},${debounceOpen},${mode}\r`;
}

export interface SwitchConfig {
  switchId: number | Switch;
  debounceCloseMs?: number;
  debounceOpenMs?: number;
  inverted?: boolean;
}