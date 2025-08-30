import { DualWoundFlipper, IO_3208, IoNetwork, Power, SingleCoil } from "@jspin/core";

export const ioNet = new IoNetwork({
  io3208: IO_3208(0),
});

// export const LeftSling = ioNet.defineDevice(({ io3208 }) => new SingleCoil({
//   driver: io3208.drivers[0],
//   switch: io3208.switches[31],
//   mode: 'pulse',
//   initialPwmDurationMs: 20,
//   initialPwmPower: Power.fromPercent(0.75),
//   restMs: 80,
// }));

export const LeftFlipper = ioNet.defineDevice(({ io3208 }) => new DualWoundFlipper({
  main: {
    driver: io3208.drivers[1],
    fullPowerMs: 12,
  },
  hold: {
    driver: io3208.drivers[2],
    maxInitialOnTimeMs: 20,
    initialPwmPower: Power.fromPercent(0.75),
  },
  eosSwitch: io3208.switches[30],
  flipperButton: io3208.switches[31],
}));