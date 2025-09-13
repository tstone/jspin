import { SwitchConfig } from "../../commands/configure-switch";
import { Driver, FlipperHoldDirectDriverConfig, FlipperMainDirectDriverConfig, PulseCancelDriverConfig, PulseHoldCancelDriverConfig } from "../driver";
import { Power } from "../power";
import { Switch } from "../switch";
import { Device } from "./device";


export class DualWoundFlipper extends Device {
  constructor(public readonly config: DualWoundFlipperConfig) {
    super();
  }

  public async configure() {
    const mainDriverConfig: FlipperMainDirectDriverConfig = {
      mode: 'flipper-main-direct',
      switch: Switch.from(this.config.flipperButton),
      eosSwitch: Switch.from(this.config.eosSwitch),
      initialPwm: this.config.main.initialPwm ?? Power.percent(45.8),
      secondaryPwm: this.config.main.secondaryPwm ?? Power.full,
      maxEosTimeMs: this.config.main.maxEosTimeMs ?? 60,
      nextFlipRefreshTimeMs: this.config.main.nextFlipRefreshTimeMs ?? 8,
    };
    const holdDriverConfig: FlipperHoldDirectDriverConfig = {
      mode: 'flipper-hold-direct',
      switch: Switch.from(this.config.flipperButton),
      driverOnTime1Ms: this.config.hold.driverOnTime1Ms ?? 48,
      initialPwm: this.config.hold.initialPwm ?? Power.full,
      secondaryPwm: this.config.hold.secondaryPwm ?? Power.full,
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
    /** Initial PWM value (16-bit) */
    initialPwm?: number;
    /** Remaining PWM used after initial time expires */
    secondaryPwm?: number;
    /** Maximum time in milliseconds for a single movement */
    maxEosTimeMs?: number;
    /** Time in milliseconds for flipper switch to be released before resetting driver timers */
    nextFlipRefreshTimeMs?: number;
  },
  hold: {
    driver: Driver,
    /** Time in milliseconds to run initial PWM */
    driverOnTime1Ms?: number;
    /** Initial hold PWM value */
    initialPwm?: number;
    /** Remaining PWM used after initial time expires */
    secondaryPwm?: number;
  },
  flipperButton: SwitchConfig | Switch,
  eosSwitch: SwitchConfig | Switch,
}
