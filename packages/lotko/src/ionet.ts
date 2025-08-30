import { IO_3208, IoNetwork, SingleCoil } from "@jspin/core";

export const ioNet = new IoNetwork(IO_3208);

export const RightSling = ioNet.defineDevice(([Io3208]) => {
  return new SingleCoil({
    driver: Io3208.drivers[7],
    switch: Io3208.switches[0],
    mode: 'pulse',
    initialPwmDurationMs: 20,
    initialPwmPower: 100,
    restMs: 80,
  });
});