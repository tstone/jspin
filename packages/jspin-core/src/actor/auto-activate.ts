import { stateEntered, stateExited } from "../actor-rules";
import { IoNetwork } from "../hardware/io-network";
import { handler, PinActor } from "../pin-actor";
import { MachineState } from "../state-machine";

/** 
 * An actor to automatically activate all IO Net devices
 * once the machine enters the game state, and deactivate
 * all devices once game state is exited.
 */
export class AutoActivateDevices extends PinActor {
  constructor(private readonly ioNet: IoNetwork) {
    super({});
  }

  @handler(stateEntered(MachineState, 'game'))
  onGame() {
    for (const device of this.ioNet.devices) {
      device.activate();
    }
  }

  @handler(stateExited(MachineState, 'game'))
  onEndGame() {
    for (const device of this.ioNet.devices) {
      device.deactivate();
    }
  }
}