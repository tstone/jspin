import { Driver, PulseCancelDriverConfig, PulseHoldCancelDriverConfig } from "../driver";
import { Mainboard } from "../mainboard";
import { Switch } from "../switch";
import { Device } from "./device";


export class DualWoundFlipper extends Device {
  constructor(public readonly config: DualWoundFlipperConfig) {
    super();
  }

  public async configure() {
    const mainDriverConfig: PulseCancelDriverConfig = {
      mode: 'pulse+cancel',
      switch: this.config.flipperButton,
      offSwitch: this.config.eosSwitch,
      initialPwmDurationMs: this.config.main.fullPowerMs,
      secondaryPwmPower: this.config.main.secondaryPwmPower,
      secondaryPwmDurationTenthSeconds: this.config.main.secondaryPwmDurationTenthSeconds,
      restMs: this.config.main.restMs,
    };
    const holdDriverConfig: PulseHoldCancelDriverConfig = {
      mode: 'pulse+hold+cancel',
      switch: this.config.eosSwitch,
      offSwitch: this.config.flipperButton,
      invertOffSwitch: true,
      maxInitialOnTimeMs: this.config.hold.maxInitialOnTimeMs,
      initialPwmPower: this.config.hold.initialPwmPower,
      secondaryPwmPower: this.config.hold.secondaryPwmPower,
      restMs: this.config.hold.restMs,
    };

    await this.configureDriver(this.config.main.driver.id, mainDriverConfig);
    await this.configureDriver(this.config.hold.driver.id, holdDriverConfig);
  }

  public async activate() {
    await this.triggerDriver(this.config.main.driver.id, 'automatic');
    await this.triggerDriver(this.config.hold.driver.id, 'automatic');
  }

  public async deactivate() {
    await this.triggerDriver(this.config.main.driver.id, 'disabled');
    await this.triggerDriver(this.config.hold.driver.id, 'disabled');
  }

  public async ballSearch() {
    // N/A
  }

  public fire() {
    return this.triggerDriver(this.config.main.driver.id, 'manual');
  }
}

export type DualWoundFlipperConfig = {
  main: {
    driver: Driver,
    fullPowerMs: number,
    secondaryPwmPower?: number;
    /** The duration in tenths of a second (e.g. value x 100ms) */
    secondaryPwmDurationTenthSeconds?: number;
    restMs?: number;
  },
  hold: {
    driver: Driver,
    maxInitialOnTimeMs: number;
    initialPwmPower: number;
    secondaryPwmPower?: number;
    restMs?: number;
  },
  flipperButton: Switch,
  eosSwitch: Switch,
}
