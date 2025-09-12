import { SwitchConfig } from "../../commands/configure-switch";
import { Driver, PulseCancelDriverConfig, PulseHoldCancelDriverConfig } from "../driver";
import { Switch } from "../switch";
import { Device } from "./device";


export class DualWoundFlipper extends Device {
  constructor(public readonly config: DualWoundFlipperConfig) {
    super();
  }

  public async configure() {
    const mainDriverConfig: PulseCancelDriverConfig = {
      mode: 'pulse+cancel',
      switch: Switch.from(this.config.flipperButton),
      offSwitch: Switch.from(this.config.eosSwitch),
      initialPwmDurationMs: this.config.main.fullPowerMs,
      secondaryPwmPower: this.config.main.secondaryPwmPower,
      secondaryPwmDurationTenthSeconds: this.config.main.secondaryPwmDurationTenthSeconds,
      restMs: this.config.main.restMs ?? 1,
    };
    const holdDriverConfig: PulseHoldCancelDriverConfig = {
      mode: 'pulse+hold+cancel',
      switch: Switch.from(this.config.eosSwitch),
      offSwitch: Switch.from(this.config.flipperButton),
      invertOffSwitch: true,
      maxInitialOnTimeMs: this.config.hold.maxInitialOnTimeMs,
      initialPwmPower: this.config.hold.initialPwmPower,
      secondaryPwmPower: this.config.hold.secondaryPwmPower,
      restMs: this.config.hold.restMs,
    };
    const flipperSwitchConfig: SwitchConfig = this.config.flipperButton instanceof Switch ? {
      switchId: this.config.flipperButton.id,
      debounceCloseMs: 2,
      debounceOpenMs: 4,
      inverted: false,
    } : this.config.flipperButton;
    const eosSwitchConfig: SwitchConfig = this.config.eosSwitch instanceof Switch ? {
      switchId: this.config.eosSwitch.id,
      debounceOpenMs: 8,
      inverted: true,
    } : this.config.eosSwitch;

    await this.configureSwitch(flipperSwitchConfig);
    await this.configureSwitch(eosSwitchConfig);
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
  // strategy: 'eos' | 'timed',
  // TODO: timed mode uses mode 18+50 for hold driver where delay is fullPowerMs + secondaryPwmDuration
  // TODO: just set initial power MS to 0 and use secondaryPwmDuration for primary driver?

  // repulse: boolean
  // TODO: repulse means a timer is set and if the EOS switch is not hit in that time, the main driver is manually triggered again

  // TODO: investigate switch debounce settings for flipper + EOS switches

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
  flipperButton: SwitchConfig | Switch,
  eosSwitch: SwitchConfig | Switch,
}
