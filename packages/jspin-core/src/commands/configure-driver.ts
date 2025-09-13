import { DelayedPulseDriverConfig, DriverConfig, LongPulseDriverConfig, PulseCancelDriverConfig, PulseDriverConfig, PulseHoldCancelDriverConfig, PulseHoldDriverConfig } from "../hardware/driver";
import { toHex } from "./hex";

// https://fastpinball.com/fast-serial-protocol/net/dl/
export function configureDriverCmd(driverId: number, config: DriverConfig) {
  let cmd: DlCommand | undefined = undefined;

  if (config.mode === 'disabled') {
    cmd = disabledCmd(driverId);
  } else if (config.mode == 'pulse') {
    cmd = pulseCmd(driverId, config);
  } else if (config.mode == 'pulse+cancel') {
    cmd = pulseCancelCmd(driverId, config);
  } else if (config.mode == 'pulse+hold') {
    cmd = pulseHoldCmd(driverId, config);
  } else if (config.mode == 'pulse+hold+cancel') {
    cmd = pulseHoldCancelCmd(driverId, config);
  } else if (config.mode == 'delayed-pulse') {
    cmd = delayedPulseCmd(driverId, config);
  } else if (config.mode == 'long-pulse') {
    cmd = longPulseCmd(driverId, config);
  }

  if (!cmd) {
    throw new Error(`Unknown driver config type: ${config.mode}`);
  }

  return `DL:${cmd.driverId},${triggerToHex(cmd.trigger)},${cmd.switchId},${cmd.mode},${cmd.param1},${cmd.param2},${cmd.param3},${cmd.param4},${cmd.param5}\r`
}

function disabledCmd(driverId: number): DlCommand {
  return dl({
    driverId: toHex(driverId),
  });
}

function pulseCmd(driverId: number, config: PulseDriverConfig): DlCommand {
  return dl({
    driverId: toHex(driverId),
    trigger: trigger({
      enabled: true,
      invertSwitch1: config.invertSwitch,
    }),
    switchId: toHex(config.switch?.id),
    mode: "10",
    param1: toHex(config.initialPwmDurationMs),
    param2: toHex(config.initialPwmPower),
    param3: toHex(config.secondaryPwmDurationMs),
    param4: toHex(config.secondaryPwmPower),
    param5: toHex(config.restMs),
  });
}

function pulseHoldCmd(driverId: number, config: PulseHoldDriverConfig): DlCommand {
  return dl({
    driverId: toHex(driverId),
    trigger: trigger({
      enabled: true,
      invertSwitch1: config.invertSwitch,
    }),
    switchId: toHex(config.switch?.id),
    mode: "18",
    param1: toHex(config.initialPwmDurationMs),
    param2: toHex(config.initialPwmPower),
    param3: toHex(config.secondaryPwmPower),
    param4: toHex(config.restMs),
  });
}

function pulseHoldCancelCmd(driverId: number, config: PulseHoldCancelDriverConfig): DlCommand {
  return dl({
    driverId: toHex(driverId),
    trigger: trigger({
      enabled: true,
      invertSwitch1: config.invertSwitch,
      invertSwitch2: config.invertOffSwitch,
    }),
    switchId: toHex(config.switch?.id),
    mode: "20",
    param1: toHex(config.offSwitch.id),
    param2: toHex(config.maxInitialOnTimeMs),
    param3: toHex(config.initialPwmPower),
    param4: toHex(config.secondaryPwmPower),
    param5: toHex(config.restMs),
  });
}

function pulseCancelCmd(driverId: number, config: PulseCancelDriverConfig): DlCommand {
  return dl({
    driverId: toHex(driverId),
    trigger: trigger({
      enabled: true,
      invertSwitch1: config.invertSwitch,
      invertSwitch2: config.invertOffSwitch,
    }),
    switchId: toHex(config.switch?.id),
    mode: "75",
    param1: toHex(config.offSwitch.id),
    param2: toHex(config.initialPwmDurationMs),
    param3: toHex(config.secondaryPwmDurationTenthSeconds),
    param4: toHex(config.secondaryPwmPower),
    param5: toHex(config.restMs),
  });
}

function delayedPulseCmd(driverId: number, config: DelayedPulseDriverConfig): DlCommand {
  return dl({
    driverId: toHex(driverId),
    trigger: trigger({
      enabled: true,
      invertSwitch1: config.invertSwitch,
    }),
    switchId: toHex(config.switch?.id),
    mode: "30",
    param1: toHex(config.delayTimeTenthMs),
    param2: toHex(config.initialPwmDurationMs),
    param3: toHex(config.initialPwmPower),
    param4: toHex(config.secondaryPwmDurationMs),
    param5: toHex(config.restMs),
  });
}

function longPulseCmd(driverId: number, config: LongPulseDriverConfig): DlCommand {
  return dl({
    driverId: toHex(driverId),
    trigger: trigger({
      enabled: true,
      invertSwitch1: config.invertSwitch,
    }),
    switchId: toHex(config.switch?.id),
    mode: "70",
    param1: toHex(config.initialPwmDurationMs),
    param2: toHex(config.initialPwmPower),
    param3: toHex(config.secondaryPwmDurationMs100),
    param4: toHex(config.secondaryPwmPower),
    param5: toHex(config.restMs),
  });
}

function dl(values: Partial<DlCommand>): DlCommand {
  return {
    driverId: values.driverId ?? "00",
    trigger: values.trigger ?? trigger({}),
    switchId: values.switchId ?? "00",
    mode: values.mode ?? "00",
    param1: values.param1 ?? "00",
    param2: values.param2 ?? "00",
    param3: values.param3 ?? "00",
    param4: values.param4 ?? "00",
    param5: values.param5 ?? "00",
  }
}

function trigger(values: Partial<DriverTrigger>): DriverTrigger {
  return {
    enabled: values.enabled ?? false,
    oneShot: values.oneShot ?? false,
    invertSwitch1: values.invertSwitch1 ?? false,
    invertSwitch2: values.invertSwitch2 ?? false,
    manual: values.manual ?? false,
    disableSwitch: values.disableSwitch ?? true
  }
}

export function triggerToHex(trigger: DriverTrigger): string {
  const bitArray = [
    trigger.enabled ? 1 : 0,
    0,
    0,
    trigger.oneShot ? 1 : 0,
    trigger.invertSwitch1 ? 1 : 0,
    trigger.invertSwitch2 ? 1 : 0,
    trigger.manual ? 1 : 0,
    trigger.disableSwitch ? 1 : 0
  ].reverse();
  return parseInt(bitArray.join(''), 2).toString(16).padStart(2, '0');
}


export type DriverTrigger = {
  enabled: boolean;
  oneShot: boolean;
  invertSwitch1: boolean;
  invertSwitch2: boolean;
  manual: boolean;
  disableSwitch: boolean;
}

type DlCommand = {
  driverId: string;
  trigger: DriverTrigger;
  switchId: string;
  mode: string;
  param1: string;
  param2: string;
  param3: string;
  param4: string;
  param5: string;
}