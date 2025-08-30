import { DriverConfig, PulseCancelDriverConfig, PulseDriverConfig, PulseHoldCancelDriverConfig, PulseHoldDriverConfig } from "../hardware/driver";

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
  }

  if (!cmd) {
    throw new Error(`Unknown driver config type: ${config.mode}`);
  }

  return `DL:${cmd.driverId},${triggerToHex(cmd.trigger)},${cmd.switchId},${cmd.mode},${cmd.param1},${cmd.param2},${cmd.param3},${cmd.param4},${cmd.param5}\r`
}

function disabledCmd(driverId: number): DlCommand {
  return dl({
    driverId: driverId.toString(16),
  });
}

function pulseCmd(driverId: number, config: PulseDriverConfig): DlCommand {
  return dl({
    driverId: driverId.toString(16),
    trigger: trigger({
      enabled: true,
      invertSwitch1: config.invertSwitch,
    }),
    switchId: config.switch?.id.toString(16),
    mode: "10",
    param1: config.initialPwmDurationMs.toString(16),
    param2: powerToHex(config.initialPwmPower),
    param3: config.secondaryPwmDurationMs?.toString(16),
    param4: powerToHex(config.secondaryPwmPower),
    param5: config.restMs?.toString(16),
  });
}

function pulseHoldCmd(driverId: number, config: PulseHoldDriverConfig): DlCommand {
  return dl({
    driverId: driverId.toString(16),
    trigger: trigger({
      enabled: true,
      invertSwitch1: config.invertSwitch,
    }),
    switchId: config.switch?.id.toString(16),
    mode: "18",
    param1: config.initialPwmDurationMs.toString(16),
    param2: powerToHex(config.initialPwmPower),
    param3: powerToHex(config.secondaryPwmPower),
    param4: config.restMs?.toString(16),
  });
}

function pulseHoldCancelCmd(driverId: number, config: PulseHoldCancelDriverConfig): DlCommand {
  return dl({
    driverId: driverId.toString(16),
    trigger: trigger({
      enabled: true,
      invertSwitch1: config.invertSwitch,
      invertSwitch2: config.invertOffSwitch,
    }),
    switchId: config.switch?.id.toString(16),
    mode: "20",
    param1: config.offSwitch.id.toString(16),
    param2: config.maxInitialOnTimeMs.toString(16),
    param3: powerToHex(config.initialPwmPower),
    param4: powerToHex(config.secondaryPwmPower),
    param5: config.restMs?.toString(16),
  });
}

function pulseCancelCmd(driverId: number, config: PulseCancelDriverConfig): DlCommand {
  return dl({
    driverId: driverId.toString(16),
    trigger: trigger({
      enabled: true,
      invertSwitch1: config.invertSwitch,
      invertSwitch2: config.invertOffSwitch,
    }),
    switchId: config.switch?.id.toString(16),
    mode: "75",
    param1: config.offSwitch.id.toString(16),
    param2: config.initialPwmDurationMs.toString(16),
    param3: powerToHex(config.secondaryPwmDurationTenthSeconds),
    param4: powerToHex(config.secondaryPwmPower),
    param5: config.restMs?.toString(16),
  });
}

export function powerToHex(power?: number): string {
  if (power === undefined) {
    return '0';
  }
  return Math.round(power).toString(16);
}

function dl(values: Partial<DlCommand>): DlCommand {
  return {
    driverId: values.driverId ?? "0",
    trigger: values.trigger ?? trigger({}),
    switchId: values.switchId ?? "0",
    mode: values.mode ?? "0",
    param1: values.param1 ?? "0",
    param2: values.param2 ?? "0",
    param3: values.param3 ?? "0",
    param4: values.param4 ?? "0",
    param5: values.param5 ?? "0",
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
  return parseInt(bitArray.join(''), 2).toString(16);
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