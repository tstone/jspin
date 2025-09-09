import { toHex } from "./hex";

export function configureHardwareCmd(platformConfigId: string, flags?: ConfigurationHardwareFlags): string {
  flags = flags || { switchReporting: 'none' };
  const flagHex = flags.switchReporting === 'verbose' ? toHex(1) : toHex(0);
  return `CH:${platformConfigId},${flagHex}\r`;
}

export type ConfigurationHardwareFlags = {
  switchReporting: 'verbose' | 'none'
}