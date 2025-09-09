
export type DriverTriggerMode = 'automatic' | 'manual' | 'disabled' | 'hold';

// https://fastpinball.com/fast-serial-protocol/net/tl/
export function triggerDriverCmd(driverId: number, mode: DriverTriggerMode) {
  const modeValue = mode === 'automatic' ? '0' :
    mode === 'manual' ? '1' :
      mode === 'disabled' ? '2' : '3';
  return `TL:${driverId.toString(16)},${modeValue}\r`;
}
