import { Driver, DriverConfig } from "../driver";
import { Device } from "./device";


export class SingleCoil extends Device {
  constructor(public readonly config: SingleDriverConfig) {
    super();
  }

  public configure(): void {
    this.configureDriver(this.config.driver.id, this.config);
  }

  public activate(): void {
    this.triggerDriver(this.config.driver.id, 'automatic');
  }

  public deactivate(): void {
    this.triggerDriver(this.config.driver.id, 'disconnected');
  }

  public ballSearch(): void {
    this.fire();
  }

  public fire(): void {
    this.triggerDriver(this.config.driver.id, 'manual');
  }
}

export type SingleDriverConfig = {
  driver: Driver
} & DriverConfig;