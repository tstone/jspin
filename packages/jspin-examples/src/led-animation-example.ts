import {
  Machine,
  Neutron,
  Module,
  StateChangePayload,
  when,
  MachineState,
  LED,
  NeutronExpansion
} from "@jspin/core";
import Color from "color";

/**
 * Example showing animated LED sequences
 */
class LEDSequenceModule implements Module {
  readonly active = when(MachineState, 'game');

  private readonly playFieldLEDs: LED[] = [];
  private animationRunning = false;

  constructor() {
    // Create a strip of 10 LEDs
    for (let i = 0; i < 10; i++) {
      this.playFieldLEDs.push(new LED(NeutronExpansion, 0, i));
    }
  }

  async onActivated({ leds }: StateChangePayload) {
    console.log('Starting LED animation sequence...');
    this.animationRunning = true;

    // Run a rainbow chase animation
    this.runRainbowChase(leds);
  }

  async onDeactivated({ leds }: StateChangePayload) {
    console.log('Stopping LED animations...');
    this.animationRunning = false;

    // Turn off all LEDs
    for (const led of this.playFieldLEDs) {
      await leds.setSingle(led, Color.rgb(0, 0, 0));
    }
  }

  private async runRainbowChase(leds: any) {
    let hue = 0;

    while (this.animationRunning) {
      for (let i = 0; i < this.playFieldLEDs.length; i++) {
        const ledHue = (hue + (i * 36)) % 360; // Spread colors across LEDs
        const color = Color.hsv(ledHue, 100, 80);

        await leds.setSingle(this.playFieldLEDs[i], color);
      }

      hue = (hue + 10) % 360; // Advance the rainbow

      // Wait 100ms before next frame
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

(async () => {
  const machine = new Machine({
    mainboard: new Neutron({
      ioPort: '/dev/ttyACM0',
      expPort: '/dev/ttyACM1',
    }),
    modules: [
      new LEDSequenceModule()
    ]
  });

  console.log('Starting LED sequence example...');
  await machine.run();
})();
