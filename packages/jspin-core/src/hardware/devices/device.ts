import { configureDriverCmd } from "../../commands/configure-driver";
import { DriverTriggerMode, triggerDriverCmd } from "../../commands/trigger-driver";
import { DriverConfig } from "../driver";
import { Mainboard } from "../mainboard";

export abstract class Device {
  public abstract configure(): Promise<void>;
  public abstract activate(): Promise<void>;
  public abstract deactivate(): Promise<void>;
  public abstract ballSearch(): Promise<void>;

  protected _mainboard?: Mainboard;

  get bindings() {
    return {
      mainboard: (mainboard: Mainboard) => {
        this._mainboard = mainboard;
      }
    }
  }

  protected get mainboard() {
    return this._mainboard!;
  }

  protected async configureDriver(driverId: number, config: DriverConfig) {
    await this.mainboard.send(configureDriverCmd(driverId, config));
  }

  protected async triggerDriver(driverId: number, mode: DriverTriggerMode) {
    await this.mainboard.send(triggerDriverCmd(driverId, mode));
  }
}