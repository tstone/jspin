import {
  Machine,
  Neutron,
  MachineState,
  Module,
  StateChangePayload,
  when,
  NeutronExpansion,
  LED,
  CabinetIO,
  IO_0804,
  IO_1616,
  IO_3208,
  IoNetwork,
  AutoStart
} from "@jspin/core";
import Color from "color";

// hardware, states, modules
// hardware defines what exists
// states define states things can be in
// modules can be activated or deactivated based on state changes
// modules receive switch events
// modules can interact with hardware

const TestLED = new LED(NeutronExpansion, 0, 1);

const [L1, L2] = LED.port(NeutronExpansion, 0, 2);

class TurnOnLEDTest implements Module {
  readonly active = when(MachineState, 'game');

  async onActivated({ leds }: StateChangePayload) {
    console.log('LED Test Module Activated');
    await leds.setSingle(TestLED, Color.rgb(100, 40, 255));

    // per LED animations
    // await leds.clearQueue(TestLED);
    // await leds.enqueue(TestLED, Fade(Black, Blue, 500));
    // await leds.parallelEnqueue(TestLED, Fade(Black, Blue, 500)); -- runs simultaneous to current animation

    // whole playfield animations
    // await leds.sequence.play(Fancyness)
  }
}

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
    modules: [
      new AutoStart(),
      new TurnOnLEDTest()
    ]
  });
  await machine.run();
})();
