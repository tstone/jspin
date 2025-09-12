import { Driver } from "../driver";
import { Power } from "../power";
import { Switch } from "../switch";
import { SingleCoil } from "./single-coil";

export class Slingshot extends SingleCoil {
  constructor(public readonly slingConfig: SlingshotConfig) {
    super({
      mode: 'pulse',
      driver: slingConfig.driver,
      switch: slingConfig.switch,
      initialPwmDurationMs: slingConfig.durationMs ?? 20,
      initialPwmPower: slingConfig.power ?? Power.full,
      restMs: slingConfig.restMs ?? 80,
    });
  }

  public async configure() {
    await super.configure();
    await this.configureSwitch({
      switchId: this.slingConfig.switch.id,
      debounceOpenMs: this.slingConfig.switchDebounceMs || 5,
      inverted: this.slingConfig.invertSwitch,
    });
  }
}

export type SlingshotConfig = {
  driver: Driver;
  switch: Switch;
  switchDebounceMs?: number;
  invertSwitch?: boolean;
  durationMs?: number;
  power?: number;
  restMs?: number;
}