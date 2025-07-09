import { ColorInstance } from "color";
import { LED } from "../hardware/led";
import { Mainboard } from "../hardware/mainboard";

export class LEDs {
  constructor(private readonly mainboard: Mainboard) { }

  setColor(led: LED, color: ColorInstance): void {
    const cmd = this.rsCmd(led.expAddress, [[led.indexHex, color]]);
    this.mainboard.send(cmd);
  }

  private rsCmd(expAddress: string, pairs: [string, ColorInstance][]): string {
    const colors = pairs.map(([indexHex, color]) => {
      const hex = color.hex().slice(1); // Remove '#'
      return `${indexHex}${hex}`;
    }).join(',');

    return `RS@${expAddress}:${colors}`;
  }
}