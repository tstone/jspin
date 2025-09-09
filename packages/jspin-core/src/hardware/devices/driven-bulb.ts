import { Driver, DriverConfig } from "../driver";
import { Device } from "./device";

export class DrivenBulb extends Device {
  constructor(public readonly config: DrivenBulbConfig) {
    super();
  }

  public configure() {
    return this.configureDriver(this.config.driver.id, {
      mode: 'pulse+hold',
      initialPwmDurationMs: 20,
      initialPwmPower: this.config.powerLevel ?? 1,
    });
  }

  public activate() {
    return this.turnOn();
  }

  public deactivate() {
    return this.turnOff();
  }

  public async ballSearch() {
  }

  public turnOn() {
    return this.triggerDriver(this.config.driver.id, 'manual');
  }

  public turnOff() {
    return this.triggerDriver(this.config.driver.id, 'disabled');
  }
}

export type DrivenBulbConfig = {
  driver: Driver;
  powerLevel?: number;
};