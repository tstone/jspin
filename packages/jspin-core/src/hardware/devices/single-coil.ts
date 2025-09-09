import { Driver, DriverConfig } from "../driver";
import { Device } from "./device";


export class SingleCoil extends Device {
  constructor(public readonly config: SingleDriverConfig) {
    super();
  }

  public configure() {
    return this.configureDriver(this.config.driver.id, this.config);
  }

  public activate() {
    return this.triggerDriver(this.config.driver.id, 'automatic');
  }

  public deactivate() {
    return this.triggerDriver(this.config.driver.id, 'disabled');
  }

  public ballSearch() {
    return this.fire();
  }

  public fire() {
    return this.triggerDriver(this.config.driver.id, 'manual');
  }
}

export type SingleDriverConfig = {
  driver: Driver
} & DriverConfig;