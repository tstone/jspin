import { ColorInstance } from "color";
import { LED } from "./hardware/led";
import { Mainboard } from "./hardware/mainboard";
import { ModuleActiveRule } from "./module-rules";
import { State } from "./state";
import { SetLEDColor } from "./commands/set-led-color";

export interface Module {
  active: ModuleActiveRule;
  onActivated?<S extends State<any> = State<any>>(payload: StateChangePayload<S>): void;
  onDeactivated?<S extends State<any> = State<any>>(payload: StateChangePayload<S>): void;
  // onSwitch
  // onConfigChanged
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

export class StateChangePayload<S extends State<any> = State<any>> {
  private _leds?: LEDsHandler;

  constructor(
    public readonly triggeringState: S,
    private mainboard: Mainboard,
  ) { }

  get leds(): LEDsHandler {
    if (!this._leds) {
      this._leds = new LEDsHandler(this.mainboard);
    }
    return this._leds;
  }
}

export class LEDsHandler {
  constructor(private mainboard: Mainboard) { }

  async setSingle(led: LED, color: ColorInstance): Promise<void> {
    await this.mainboard.send(SetLEDColor.single(led, color), 'exp');
  }

  async setMany(pairs: [LED, ColorInstance][]): Promise<void> {
    // group by expansion address
    const grouped = pairs.reduce((acc, [led, color]) => {
      if (!acc[led.expAddress]) {
        acc[led.expAddress] = [];
      }
      acc[led.expAddress].push([led.indexHex, color]);
      return acc;
    }, {} as Record<string, [string, ColorInstance][]>);

    for (const [expAddress, pairs] of Object.entries(grouped)) {
      await this.mainboard.send(new SetLEDColor(expAddress, pairs), 'exp');
    }
  }

  async setAll(leds: LED[], color: ColorInstance): Promise<void> {
    // group by expansion address
    const grouped = leds.reduce((acc, led) => {
      if (!acc[led.expAddress]) {
        acc[led.expAddress] = [];
      }
      acc[led.expAddress].push([led.indexHex, color]);
      return acc;
    }, {} as Record<string, [string, ColorInstance][]>);

    for (const [expAddress, pairs] of Object.entries(grouped)) {
      await this.mainboard.send(new SetLEDColor(expAddress, pairs), 'exp');
    }
  }
}