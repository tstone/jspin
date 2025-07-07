import { Machine } from "./machine";
import { Neutron } from "./neutron";
import { MachineState, State } from "./state";
import { Module, StateChangePayload } from "./module";
import { transition as transitioned, when } from "./module-rules";
import Color from "color";
import { NeutronExpansion } from "./hardware/expansion-board";
import { LED } from "./hardware/led";

// hardware, states, modules
// hardware defines what exists
// states define states things can be in
// modules can be activated or deactivated based on state changes
// modules receive switch events
// modules can interact with hardware

const TestLED = new LED(NeutronExpansion, 0, 1);

const [L1, L2] = LED.port(NeutronExpansion, 0, 2);

class AutoStart implements Module {
  readonly active = transitioned(MachineState, 'boot', 'ready');
  async onActivated() {
    MachineState.state = 'game'; // Automatically start the game (for testing)
  }
}

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

(async () => {
  const machine = new Machine({
    mainboard: new Neutron({
      ioPort: '/dev/ttyACM0',
      expPort: '/dev/ttyACM1',
    }),
    modules: [
      new AutoStart(),
      new TurnOnLEDTest()
    ]
  });
  await machine.run();
})();