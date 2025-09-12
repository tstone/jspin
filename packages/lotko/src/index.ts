import { allOf, handler, Machine, MachineState, Neutron, PinActor, stateExited, stateEntered, AutoActivateDevices } from "@jspin/core";
import { ioNet, LeftFlipper } from "./ionet";

class AutoStart extends PinActor {
  @handler(stateEntered(MachineState, 'ready'))
  onReady() {
    this.logger.info('Autostarting game');
    MachineState.state = 'game';
  }
}

(async () => {
  const machine = new Machine({
    mainboard: new Neutron({
      ioPort: '/dev/ttyACM0',
      expPort: '/dev/ttyACM1',
    }),
    ioNet,
    actors: [
      new AutoActivateDevices(ioNet),
      new AutoStart({}),
    ],
  });
  await machine.run();
})();

