import { SwitchChange } from "./switch-change";
import { IoNetwork } from "../hardware/io-network";

export class FastDataParser {
  static parse(data: string, ioNet?: IoNetwork): FastData | undefined {
    let [cmd, rawArgs] = data.split(':');
    cmd = cmd.toLowerCase();
    rawArgs = rawArgs?.trim();

    if (cmd == '/l:' || cmd == '/n:') {
      return SwitchChange.fromHex(rawArgs, 'open', ioNet);
    } else if (cmd == '-l:' || cmd == '-n:') {
      return SwitchChange.fromHex(rawArgs, 'closed', ioNet);
    }
  }
}

export type FastData = SwitchChange;

