import { DriverConfig, PulseDriverConfig } from "../hardware/driver";

// https://fastpinball.com/fast-serial-protocol/net/dl/
export function configureDriverCmd(driverId: number, config: DriverConfig) {
  let cmd: DlCommand | undefined = undefined;

  if (config.mode === 'disabled') {
    cmd = disabledDriverCmd(driverId);
  } else if (config.mode == 'pulse') {
    cmd = pulseDriverCmd(driverId, config);
  }

  if (!cmd) {
    throw new Error(`Unknown driver config type: ${config.mode}`);
  }

  return `DL:${cmd.driverId},${triggerToHex(cmd.trigger)},${cmd.switchId},${cmd.mode},${cmd.param1},${cmd.param2},${cmd.param3},${cmd.param4},${cmd.param5}\r`
}

function disabledDriverCmd(driverId: number): DlCommand {
  return {
    driverId: driverId.toString(16),
    trigger: {
      enabled: false,
      oneShot: false,
      invertSwitch1: false,
      invertSwitch2: false,
      manual: false,
      disableSwitch: false
    },
    switchId: "0",
    mode: "0",
    param1: "0",
    param2: "0",
    param3: "0",
    param4: "0",
    param5: "0"
  }
}

function pulseDriverCmd(driverId: number, config: PulseDriverConfig): DlCommand {
  return {
    driverId: driverId.toString(16),
    trigger: {
      enabled: true,
      oneShot: false,
      invertSwitch1: false,
      invertSwitch2: false,
      manual: false,
      disableSwitch: false
    },
    switchId: config.switch?.id.toString(16) || "0",
    mode: "10",
    param1: config.initialPwmDurationMs.toString(16),
    param2: powerToHex(config.initialPwmPower),
    param3: config.secondaryPwmDurationMs?.toString(16) || "0",
    param4: powerToHex(config.secondaryPwmPower),
    param5: config.restMs?.toString(16) || "0",
  }
}

export function powerToHex(power?: number): string {
  if (power === undefined) {
    return '00';
  }
  return Math.round(power).toString(16).padStart(2, '0');
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
  ]
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