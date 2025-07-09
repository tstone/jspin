import { IoNetwork } from "../hardware/io-network";
import { Switch } from "../hardware/switch";

export class SwitchChange {
  constructor(
    public readonly id: number,
    public readonly target: Switch,
    public readonly state: 'open' | 'closed'
  ) { }

  static fromId(id: number, state: 'open' | 'closed', ioNet?: IoNetwork) {
    const target = ioNet?.getSwitchById(id);
    if (target) {
      return new SwitchChange(id, target, state);
    }
  }

  static fromHex(hex: string, state: 'open' | 'closed', ioNet?: IoNetwork) {
    const id = Number(`0x${hex}`);
    return SwitchChange.fromId(id, state, ioNet);
  }
}
