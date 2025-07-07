import { MainboardComm } from "./machine";
import { ModuleActiveRule } from "./module-rules";
import { State } from "./state";

export interface Module {
  active: ModuleActiveRule;
  onActivated?<S extends State<any> = State<any>>(payload: StateChangePayload<S>): void;
  onDeactivated?<S extends State<any> = State<any>>(payload: StateChangePayload<S>): void;
  // onSwitch
  // onConfigChanged
}

export type StateChangePayload<S extends State<any> = State<any>> = {
  triggeringState: S;
  mainboard: MainboardComm;
  // leds
  // switches
  // coils
  // motors
};