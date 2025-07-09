import {
  Machine,
  Neutron,
  NeutronExpansion,
  LED,
  CabinetIO,
  IO_0804,
  IO_1616,
  IO_3208,
  IoNetwork,
} from "@jspin/core";

// hardware, states, modules
// hardware defines what exists
// states define states things can be in
// modules can be activated or deactivated based on state changes
// modules receive switch events
// modules can interact with hardware

const TestLED = new LED(NeutronExpansion, 0, 1);
const [L1, L2] = LED.port(NeutronExpansion, 0, 2);
const ioNet = new IoNetwork(CabinetIO, IO_1616, IO_3208, IO_0804);

// read switch by board, port, and pin
// const StartButton = ioNet.getSwitch(0, 0);
// read switch by board and port
// const [StartButton, LeftFlipperButton, TiltBobSwitch] = ioNet.getSwitches(0);

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
