import { ColorInstance } from "color";
import { DynFastCommand } from "./fast-command";
import { LED } from "../hardware/led";

export class SetLEDColor implements DynFastCommand {
  constructor(
    private readonly expAddress: string,
    /** [index hex, color] */
    private readonly pairs: [string, ColorInstance][]) { }

  toString(): string {
    const colors = this.pairs.map(([indexHex, color]) => {
      const hex = color.hex().slice(1); // Remove '#'
      return `${indexHex}${hex}`;
    }).join(',');

    return `RS@${this.expAddress}:${colors}`;
  }

  static single(led: LED, color: ColorInstance): SetLEDColor {
    return new SetLEDColor(led.expAddress, [[led.indexHex, color]]);
  }
}