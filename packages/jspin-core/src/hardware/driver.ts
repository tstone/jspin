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

/** Activates the driver for a fixed duration */
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

/** Keeps secondary PWM power active until switch is off */
export interface PulseHoldDriverConfig extends BaseDriverConfig {
  mode: 'pulse+hold',
  initialPwmDurationMs: number;
  /** 0-255 */
  initialPwmPower: number;
  /** 0-255 */
  secondaryPwmPower?: number;
  restMs?: number;
}

/** Keeps secondary PWM power active until a second switch is triggered */
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

/** Activates the driver for a fixed duration, but cancels on a second switch trigger */
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

/** Activates the driver after a delay for a fixed duration */
export interface DelayedPulseDriverConfig extends BaseDriverConfig {
  mode: 'delayed-pulse';
  /** Delay time in tenths of milliseconds (e.g. value x 10ms) */
  delayTimeTenthMs: number;
  initialPwmDurationMs: number;
  /** 0-255 */
  initialPwmPower: number;
  secondaryPwmDurationMs?: number;
  /** 0-255 */
  secondaryPwmPower?: number;
  restMs?: number;
}

/** Pulse the driver for an initial time, then switch to an extended timed pulse (up to 25 seconds) */
export interface LongPulseDriverConfig extends BaseDriverConfig {
  mode: 'long-pulse';
  /** Initial PWM on-time in milliseconds */
  initialPwmDurationMs: number;
  /** 0-255 */
  initialPwmPower: number;
  /** Secondary PWM on-time in hundreds of milliseconds (e.g. value x 100ms) */
  secondaryPwmDurationMs100: number;
  /** 0-255 */
  secondaryPwmPower: number;
  restMs?: number;
}

export type DriverConfig =
  | DisabledDriverConfig
  | PulseDriverConfig
  | PulseCancelDriverConfig
  | PulseHoldDriverConfig
  | PulseHoldCancelDriverConfig
  | DelayedPulseDriverConfig
  | LongPulseDriverConfig;
// TODO: other driver configs