import { always, stateEntered, stateIs } from "../actor-rules"
import { PinActor, handler } from '../pin-actor';
import { MachineState, StateChange } from "../state-machine";

describe('PinActor', () => {
  describe('handlers', () => {
    it('should run always handlers', async () => {
      const actor = new TestActor({});
      expect(actor.invoked).toBe(false);
      actor.bindings.event({ type: 'test' });
      expect(actor.invoked).toBe(true);
    });

    it('should run on state changes', async () => {
      const actor = new TestActor({});
      expect(actor.invoked).toBe(false);
      actor.bindings.event(new StateChange('ready', 'game', MachineState));
      expect(actor.invoked).toBe(true);
    });
  });
});

class TestActor extends PinActor {
  public invoked = false;

  @handler(always())
  async always(): Promise<void> {
    this.invoked = true;
  }

  @handler(stateEntered(MachineState, 'ready'))
  async ready(): Promise<void> {
    this.invoked = true;
  }
}