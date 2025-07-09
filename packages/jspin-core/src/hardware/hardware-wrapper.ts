import { Mainboard } from "./mainboard";
import { LEDs } from "../commands/leds";

export class PinHardware {
  constructor(private readonly mainboard: Mainboard) { }
  readonly leds = new LEDs(this.mainboard);
}

// EXP
// motors
// color table
// leds (+animations +scenes +shows)
// led blocks

// NET
// switches
// coils (drivers)
// lamps (retro)
// gi (retro)

// Configured:
// motors
// led blocks
// led shows
// switches
// coils