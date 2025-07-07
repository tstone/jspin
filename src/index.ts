import { Machine } from "./machine";
import { Neutron } from "./neutron";
import { MachineState, StateMachine } from "./state-machine";
import { Module, StateChangePayload } from "./module";
import { transition as transitioned, when } from "./module-rules";
import Color from "color";
import { NeutronExpansion } from "./hardware/expansion-board";
import { LED } from "./hardware/led";
import { CabinetIO, IO_0804, IO_1616, IO_3208, IoNetwork } from "./hardware/io-network";
import { AutoStart } from "./modules/auto-start";

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