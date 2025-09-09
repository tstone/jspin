import { CabinetIO, DrivenBulb, DualWoundFlipper, IO_3208, IoNetwork, Power, SingleCoil } from "@jspin/core";

export const ioNet = new IoNetwork({
  cabinet: CabinetIO(0),
  io3208: IO_3208(1),
});



// --- slings ---

export const LeftSling = ioNet.defineDevice(({ io3208 }) => new SingleCoil({
  driver: io3208.drivers[0],
  switch: io3208.switches[31],
  mode: 'pulse',
  initialPwmDurationMs: 20,
  initialPwmPower: Power.fromPercent(0.75),
  restMs: 80,
}));

export const RightSling = ioNet.defineDevice(({ io3208 }) => new SingleCoil({
  driver: io3208.drivers[7],
  switch: io3208.switches[28],
  mode: 'pulse',
  initialPwmDurationMs: 20,
  initialPwmPower: Power.fromPercent(0.75),
  restMs: 80,
}));



// --- flippers ---

export const LeftFlipper = ioNet.defineDevice(({ cabinet, io3208 }) => new DualWoundFlipper({
  main: {
    driver: io3208.drivers[1],
    fullPowerMs: 19,
  },
  hold: {
    driver: io3208.drivers[2],
    maxInitialOnTimeMs: 1,
    initialPwmPower: Power.full,
    secondaryPwmPower: Power.full,
  },
  eosSwitch: io3208.switches[30],
  flipperButton: cabinet.switches[15],
}));

export const RightFlipper = ioNet.defineDevice(({ cabinet, io3208 }) => new DualWoundFlipper({
  main: {
    driver: io3208.drivers[5],
    fullPowerMs: 23,
  },
  hold: {
    driver: io3208.drivers[6],
    maxInitialOnTimeMs: 1,
    initialPwmPower: Power.full,
    secondaryPwmPower: Power.full,
  },
  eosSwitch: io3208.switches[29],
  flipperButton: cabinet.switches[22],
}));



// --- other ---

export const StartButtonBulb = ioNet.defineDevice(({ cabinet }) => new DrivenBulb({
  driver: cabinet.drivers[2],
}));