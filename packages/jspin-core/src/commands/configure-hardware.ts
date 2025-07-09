export function configureHardwareCmd(platformConfigId: string, flags?: ConfigurationHardwareFlags): string {
  flags = flags || { switchReporting: 'none' };
  const flagHex = flags.switchReporting === 'verbose' ? '01' : '00';
  return `CH:${platformConfigId},${flagHex}\r`;
}

export type ConfigurationHardwareFlags = {
  switchReporting: 'verbose' | 'none'
}