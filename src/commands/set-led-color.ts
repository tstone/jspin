import { ColorInstance } from "color";
import { LED } from "../hardware";
import { DynFastCommand } from "./fast-command";

export class SetLEDColor implements DynFastCommand {
  constructor(
    private readonly led: LED,
    private readonly color: ColorInstance) { }

  toString(): string {
    const hex = this.color.hex().slice(1); // Remove '#'
    return `RS@${this.led.expAddress}:${this.led.indexHex}${hex}`;
  }
}