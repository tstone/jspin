import { always, handler, Machine, MachineState, Neutron, PinActor, stateIs, not } from "@jspin/core";
import { ioNet, LeftFlipper } from "./ionet";

class AutoStart extends PinActor {
  @handler(stateIs(MachineState, 'ready'))
  onReady() {
    MachineState.state = 'game';
  }
}

class ActivateHardware extends PinActor {
  @handler(stateIs(MachineState, 'game'))
  onGame() {
    LeftFlipper.activate();
  }

  @handler(not(stateIs(MachineState, 'game')))
  onNotGame() {
    LeftFlipper.deactivate();
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
      new ActivateHardware({}),
      new AutoStart({}),
    ],
  });
  await machine.run();
})();

