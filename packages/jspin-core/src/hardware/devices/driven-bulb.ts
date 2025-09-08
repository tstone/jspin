import { Driver, DriverConfig } from "../driver";
import { Device } from "./device";

export class DrivenBulb extends Device {
  constructor(public readonly config: DrivenBulbConfig) {
    super();
  }

  public configure(): void {
    this.configureDriver(this.config.driver.id, {
      mode: 'pulse+hold',
      initialPwmDurationMs: 20,
      initialPwmPower: this.config.powerLevel ?? 1,
    });
  }

  public activate(): void {
    this.triggerDriver(this.config.driver.id, 'manual');
  }

  public deactivate(): void {
    this.triggerDriver(this.config.driver.id, 'disconnected');
  }

  public ballSearch(): void {
  }

  public fire(): void {
    this.triggerDriver(this.config.driver.id, 'manual');
  }
}

export type DrivenBulbConfig = {
  driver: Driver;
  powerLevel?: number;
};