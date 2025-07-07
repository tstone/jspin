import { DynFastCommand } from "./fast-command";

export class ConfigureHardware implements DynFastCommand {
  constructor(
    private readonly platformConfigId: string,
    private readonly flags?: ConfigurationHardwareFlags) { }

  toString(): string {
    const flags = this.flags || { switchReporting: 'none' };
    const flagHex = flags.switchReporting === 'verbose' ? '01' : '00';
    return `CH:${this.platformConfigId},${flagHex}`;
  }
}

export type ConfigurationHardwareFlags = {
  switchReporting: 'verbose' | 'none'
}