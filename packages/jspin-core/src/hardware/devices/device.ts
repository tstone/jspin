import { configureDriverCmd } from "../../commands/configure-driver";
import { DriverTriggerMode, triggerDriverCmd } from "../../commands/trigger-driver";
import { DriverConfig } from "../driver";
import { Mainboard } from "../mainboard";

export abstract class Device {
  public abstract configure(): void;
  public abstract activate(): void;
  public abstract deactivate(): void;
  public abstract ballSearch(): void;

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

  protected configureDriver(driverId: number, config: DriverConfig) {
    this.mainboard.send(configureDriverCmd(driverId, config));
  }

  protected triggerDriver(driverId: number, mode: DriverTriggerMode) {
    this.mainboard.send(triggerDriverCmd(driverId, mode));
  }
}