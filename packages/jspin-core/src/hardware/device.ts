import { Driver, DriverConfig } from "./driver"

export type Device = GenericDrivenDevice | SingleCoil; // DualCoil, Motor, Servo, etc.

export class GenericDrivenDevice {
  public readonly driver: Driver;

  constructor(public readonly config: SingleDriverConfig) {
    this.driver = config.driver;
  }
}

export class SingleCoil extends GenericDrivenDevice { }

export type SingleDriverConfig = {
  driver: Driver
} & DriverConfig;