import { CabinetIO, DrivenBulb, DualWoundFlipper, IO_3208, IoNetwork, Power, SingleCoil, Slingshot } from "@jspin/core";

export const ioNet = new IoNetwork({
  cabinet: CabinetIO(0),
  io3208: IO_3208(1),
});


// --- slings ---

export const LeftSling = ioNet.defineDevice(({ io3208 }) => new Slingshot({
  driver: io3208.drivers[0],
  switch: io3208.switches[31],
}));

export const RightSling = ioNet.defineDevice(({ io3208 }) => new Slingshot({
  driver: io3208.drivers[7],
  switch: io3208.switches[28],
}));


// --- flippers ---

export const LeftFlipper = ioNet.defineDevice(({ cabinet, io3208 }) => new DualWoundFlipper({
  main: {
    driver: io3208.drivers[1],
    fullPowerMs: 14,
    secondaryPwmPower: Power.percent(0.66),
    secondaryPwmDurationTenthSeconds: 5,
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
    fullPowerMs: 14,
    secondaryPwmPower: Power.threeQuarters,
    secondaryPwmDurationTenthSeconds: 5,
  },
  hold: {
    driver: io3208.drivers[6],
    maxInitialOnTimeMs: 1,
    initialPwmPower: Power.full,
    secondaryPwmPower: Power.full,
  },
  eosSwitch: io3208.switches[29],
  flipperButton: {
    switchId: cabinet.switches[22],
    debounceOpenMs: 2
  }
}));


// --- other ---

export const StartButtonBulb = ioNet.defineDevice(({ cabinet }) => new DrivenBulb({
  driver: cabinet.drivers[2],
}));