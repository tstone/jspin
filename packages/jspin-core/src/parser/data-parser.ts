import { SwitchChange } from "./switch-change";
import { IoNetwork } from "../hardware/io-network";
import { WatchdogEvent } from "./watchdog-event";

export class FastDataParser {
  static parse(data: string, ioNet?: IoNetwork): FastData | undefined {
    let [cmd, rawArgs] = data.split(':');
    cmd = cmd.toLowerCase();
    rawArgs = rawArgs?.trim()?.toLowerCase();

    if (cmd == '/l' || cmd == '/n') {
      return SwitchChange.fromHex(rawArgs, 'open', ioNet);
    } else if (cmd == '-l' || cmd == '-n') {
      return SwitchChange.fromHex(rawArgs, 'closed', ioNet);
    } else if (cmd == 'wd') {
      return new WatchdogEvent(rawArgs || '');
    }
  }
}

export type FastData = SwitchChange | WatchdogEvent;