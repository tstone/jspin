import { IO_3208, IoNetwork, SingleCoil } from "@jspin/core";

export const ioNet = new IoNetwork({
  io3208: IO_3208(0),
});

export const LeftSling = ioNet.defineDevice(({ io3208 }) => {
  return new SingleCoil({
    driver: io3208.drivers[0],
    switch: io3208.switches[31],
    mode: 'pulse',
    initialPwmDurationMs: 20,
    initialPwmPower: 100,
    restMs: 80,
  });
});
