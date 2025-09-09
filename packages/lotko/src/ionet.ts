import { CabinetIO, DrivenBulb, DualWoundFlipper, IO_3208, IoNetwork, Power, SingleCoil } from "@jspin/core";

export const ioNet = new IoNetwork({
  cabinet: CabinetIO(0),
  io3208: IO_3208(1),
});

export const LeftSling = ioNet.defineDevice(({ io3208 }) => new SingleCoil({
  driver: io3208.drivers[0],
  switch: io3208.switches[31],
  mode: 'pulse',
  initialPwmDurationMs: 20,
  initialPwmPower: Power.fromPercent(0.75),
  restMs: 80,
}));

export const LeftFlipper = ioNet.defineDevice(({ cabinet, io3208 }) => new DualWoundFlipper({
  main: {
    driver: io3208.drivers[1],
    fullPowerMs: 50,
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

export const StartButtonBulb = ioNet.defineDevice(({ cabinet }) => new DrivenBulb({
  driver: cabinet.drivers[2],
}));

/*
L2 - low voltage driver for start button
15/14 (primary/sec) left flipper btn
13 - start btn

22/23 (prim/sec) right flipper btn
21 tilt bob
*/