import { Switch } from "./switch";

/** Corresponds to a `D#` output pin on an I/O board */
export class Driver {
  constructor(
    public readonly id: number,
  ) { }
}

export interface BaseDriverConfig {
  mode: string;
  switch?: Switch;
  invertSwitch?: false;
}

export interface DisabledDriverConfig extends BaseDriverConfig {
  mode: 'disabled';
}

export interface PulseDriverConfig extends BaseDriverConfig {
  mode: 'pulse';
  initialPwmDurationMs: number;
  /** 0-255 */
  initialPwmPower: number;
  secondaryPwmDurationMs?: number;
  /** 0-255 */
  secondaryPwmPower?: number;
  restMs?: number;
}

export type DriverConfig =
  | DisabledDriverConfig
  | PulseDriverConfig;
// TODO: other driver configs