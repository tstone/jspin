import { Driver, PulseCancelDriverConfig, PulseHoldCancelDriverConfig } from "../driver";
import { Mainboard } from "../mainboard";
import { Switch } from "../switch";
import { Device } from "./device";


export class DualWoundFlipper extends Device {
  constructor(public readonly config: DualWoundFlipperConfig) {
    super();
  }

  public configure(): void {
    const mainDriverConfig: PulseCancelDriverConfig = {
      mode: 'pulse+cancel',
      switch: this.config.flipperButton,
      offSwitch: this.config.eosSwitch,
      initialPwmDurationMs: this.config.main.fullPowerMs,
      secondaryPwmPower: this.config.main.secondaryPwmPower,
      secondaryPwmDurationTenthSeconds: this.config.main.secondaryPwmDurationTenthSeconds,
      restMs: this.config.main.restMs,
      invertOffSwitch: true,
    };
    const holdDriverConfig: PulseHoldCancelDriverConfig = {
      mode: 'pulse+hold+cancel',
      switch: this.config.eosSwitch,
      offSwitch: this.config.flipperButton,
      maxInitialOnTimeMs: this.config.hold.maxInitialOnTimeMs,
      initialPwmPower: this.config.hold.initialPwmPower,
      secondaryPwmPower: this.config.hold.secondaryPwmPower,
      restMs: this.config.hold.restMs,
      invertOffSwitch: true,
    };

    this.configureDriver(this.config.main.driver.id, mainDriverConfig);
    this.configureDriver(this.config.hold.driver.id, holdDriverConfig);
  }

  public activate(): void {
    this.triggerDriver(this.config.main.driver.id, 'automatic');
    this.triggerDriver(this.config.hold.driver.id, 'automatic');
  }

  public deactivate(): void {
    this.triggerDriver(this.config.main.driver.id, 'disconnected');
    this.triggerDriver(this.config.hold.driver.id, 'disconnected');
  }

  public ballSearch(): void {
    // N/A
  }

  public fire(): void {
    this.triggerDriver(this.config.main.driver.id, 'manual');
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