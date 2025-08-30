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
  invertSwitch?: boolean;
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
export interface PulseKickDriverConfig extends BaseDriverConfig {
  mode: 'pulse+kick';
  initialPwmDurationMs: number;
  /** 0-255 */
  initialPwmPower: number;
  secondaryPwmDurationMs?: number;
  /** 0-255 */
  secondaryPwmPower?: number;
  kickMs: number;
}

export interface PulseHoldDriverConfig extends BaseDriverConfig {
  mode: 'pulse+hold',
  initialPwmDurationMs: number;
  /** 0-255 */
  initialPwmPower: number;
  secondaryPwmDurationMs?: number;
  /** 0-255 */
  secondaryPwmPower?: number;
  restMs?: number;
}

export interface PulseHoldCancelDriverConfig extends BaseDriverConfig {
  mode: 'pulse+hold+cancel';
  offSwitch: Switch;
  invertOffSwitch?: boolean;
  maxInitialOnTimeMs: number;
  /** 0-255 */
  initialPwmPower: number;
  /** 0-255 */
  secondaryPwmPower?: number;
  restMs?: number;
}

export interface PulseCancelDriverConfig extends BaseDriverConfig {
  mode: 'pulse+cancel';
  offSwitch: Switch;
  invertOffSwitch?: boolean;
  initialPwmDurationMs: number;
  /** 0-255 */
  secondaryPwmPower?: number;
  /** The duration in tenths of a second (e.g. value x 100ms) */
  secondaryPwmDurationTenthSeconds?: number;
  restMs?: number;
}

export type DriverConfig =
  | DisabledDriverConfig
  | PulseDriverConfig
  | PulseCancelDriverConfig
  | PulseHoldDriverConfig
  | PulseHoldCancelDriverConfig
  | PulseKickDriverConfig;
// TODO: other driver configs