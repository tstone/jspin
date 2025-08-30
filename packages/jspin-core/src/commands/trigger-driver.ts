
// https://fastpinball.com/fast-serial-protocol/net/tl/
export function triggerDriverCmd(driverId: number, mode: 'automatic' | 'manual' | 'disconnected' | 'hold') {
  const modeValue = mode === 'automatic' ? '0' :
    mode === 'manual' ? '1' :
      mode === 'disconnected' ? '2' : '3';
  return `TL:${driverId.toString(16)}:${modeValue}\r`;
}