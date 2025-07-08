import { ColorInstance } from "color";
import { LED } from "./hardware/led";
import { Mainboard } from "./hardware/mainboard";
import { ModuleActiveRule } from "./module-rules";
import { StateMachine } from "./state-machine";
import { SetLEDColor } from "./commands/set-led-color";
import { Repository } from "./repository";
import { Switch } from "./hardware/switch";
import { SwitchChange } from "./data-parser";

export type ModuleChild = StateMachine<any> | Module | Repository<any>;

export interface Module {
  active: ModuleActiveRule;
  children?: ModuleChild[];

  onActivated?<S extends StateMachine<any> = StateMachine<any>>(payload: StateChangePayload<S>): void;
  onDeactivated?<S extends StateMachine<any> = StateMachine<any>>(payload: StateChangePayload<S>): void;
  onStateChange?<S extends StateMachine<any> = StateMachine<any>>(payload: StateChangePayload<S>): void;
  onRepositoryChange?<T extends Record<string, any> = Record<string, any>>(payload: RepoDataChangePayload<T>): void;
  onSwitch?(payload: SwitchChangePayload): void;
  onEvent?(payload: CustomEventPayload): void;
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

class ModuleEventPayload<S extends StateMachine<any> = StateMachine<any>> {
  private _leds?: LEDsHandler;

  constructor(
    public readonly mainboard: Mainboard,
  ) { }

  get leds(): LEDsHandler {
    if (!this._leds) {
      this._leds = new LEDsHandler(this.mainboard);
    }
    return this._leds;
  }
}

export class StateChangePayload<S extends StateMachine<any> = StateMachine<any>> extends ModuleEventPayload<S> {
  constructor(
    public readonly triggeringState: S,
    mainboard: Mainboard,
  ) {
    super(mainboard);
  }
}

export class RepoDataChangePayload<T extends Record<string, any> = Record<string, any>> extends ModuleEventPayload {
  constructor(
    public readonly payload: T[keyof T],
    public readonly path: string,
    public readonly newValue: any,
    public readonly oldValue: any,
    mainboard: Mainboard,
  ) {
    super(mainboard);
  }
}

export class SwitchChangePayload extends ModuleEventPayload {
  constructor(
    public readonly target: Switch,
    public readonly state: SwitchChange['state'],
    mainboard: Mainboard,
  ) {
    super(mainboard);
  }
}

export class CustomEventPayload extends ModuleEventPayload {
  constructor(
    public readonly event: string,
    mainboard: Mainboard,
  ) {
    super(mainboard);
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