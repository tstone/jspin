import {
  Machine,
  Neutron,
  Module,
  StateChangePayload,
  when,
  MachineState,
  Switch,
  IoNetwork,
  CabinetIO,
  IO_1616
} from "@jspin/core";

/**
 * Example showing how to handle switch events
 */
class SwitchHandler implements Module {
  readonly active = when(MachineState, 'game');

  async onSwitchClosed(switchId: number, payload: StateChangePayload) {
    console.log(`Switch ${switchId} was pressed!`);

    // Example: Start button pressed
    if (switchId === 0) {
      console.log('Start button pressed - beginning game!');
      // Add your game start logic here
    }

    // Example: Flipper button pressed
    if (switchId === 1 || switchId === 2) {
      console.log('Flipper activated!');
      // Add flipper logic here
    }
  }

  async onSwitchOpened(switchId: number, payload: StateChangePayload) {
    console.log(`Switch ${switchId} was released`);
  }
}

(async () => {
  const ioNet = new IoNetwork(CabinetIO, IO_1616);

  const machine = new Machine({
    mainboard: new Neutron({
      ioPort: '/dev/ttyACM0',
      expPort: '/dev/ttyACM1',
    }),
    ioNet,
    modules: [
      new SwitchHandler()
    ]
  });

  console.log('Starting switch handling example...');
  await machine.run();
})();
