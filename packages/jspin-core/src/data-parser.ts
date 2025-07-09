import { IoNetwork } from "./hardware/io-network";
import { Switch } from "./hardware/switch";

export class FastDataParser {
  static parse(data: string, ioNet?: IoNetwork): FastData | undefined {
    let [cmd, rawArgs] = data.split(':');
    cmd = cmd.toLowerCase();
    rawArgs = rawArgs?.trim();

    if (cmd == '/l:' || cmd == '/n:') {
      const idHex = rawArgs;
      const id = Number(`0x${idHex}`);
      return SwitchChange.fromId(id, 'open', ioNet);
    } else if (cmd == '-l:' || cmd == '-n:') {
      const idHex = rawArgs;
      const id = Number(`0x${idHex}`);
      return SwitchChange.fromId(id, 'closed', ioNet);
    }
  }
}

export type FastData = SwitchChange;

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
}
