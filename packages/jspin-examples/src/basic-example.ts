import {
  Machine,
  Neutron,
  NeutronExpansion,
  LED,
  IoNetwork,
  SingleCoil,
  CabinetIO,
  IO_3208,
  IO_0804,
} from "@jspin/core";

// hardware, states, modules
// hardware defines what exists
// states define states things can be in
// modules can be activated or deactivated based on state changes
// modules receive switch events
// modules can interact with hardware

const TestLED = new LED(NeutronExpansion, 0, 1);
const [L1, L2] = LED.port(NeutronExpansion, 0, 2);

const ioNet = new IoNetwork({
  cabinet: CabinetIO(0),
  io3208: IO_3208(1),
  lowerPlayfield: IO_0804(2),
  upperPlayfield: IO_0804(3),
});

const LeftSling = ioNet.defineDevice(({ io3208 }) => {
  return new SingleCoil({
    driver: io3208.drivers[1],
    mode: 'pulse',
    switch: io3208.switches[5],
    initialPwmDurationMs: 20,
    initialPwmPower: 255,
    restMs: 80,
  })
});

(async () => {
  const machine = new Machine({
    mainboard: new Neutron({
      ioPort: '/dev/ttyACM0',
      expPort: '/dev/ttyACM1',
    }),
    ioNet,
    actors: [],
  });
  await machine.run();
})();
