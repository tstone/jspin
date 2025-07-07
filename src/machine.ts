import { Mainboard, PortType } from "./hardware/mainboard";
import { Module, StateChangePayload } from "./module";
import { MachineState, State, StateType } from "./state";

export class Machine {
  private readonly states: State<any>[] = [MachineState];
  private readonly activeModules: Module[] = [];

  constructor(private readonly config: MachineConfig) {
    // bind state changes
    this.states.push(...config.states || []);
    for (const state of this.states) {
      state.on('change', (newState, state, oldState) => {
        this.onStateChange(newState, state, oldState);
      });
    }
  }

  async run(): Promise<void> {
    // bootstrap initial states
    for (const state of this.states) {
      this.onStateChange(state.state, state);
    }

    await this.config.mainboard.initialize(this.onData.bind(this));
    MachineState.state = 'ready';

    // Run forever (never resolve)
    return new Promise(() => { });
  }

  private async onData(port: PortType, data: string) {
    console.log('Received data:', port, data);
    // TODO: parse events and pass to modules
  }

  private onStateChange(newState: StateType, state: State<any>, oldState?: StateType) {
    console.log(`State changed from ${oldState} to ${newState}`);
    const payload = new StateChangePayload(state, this.config.mainboard);

    for (const module of this.config.modules || []) {
      const isActive = module.active.isTrue(state, newState, oldState);
      if (isActive && !this.activeModules.includes(module)) {
        this.activeModules.push(module);
        module.onActivated?.(payload);
      } else if (!isActive && this.activeModules.includes(module)) {
        this.activeModules.splice(this.activeModules.indexOf(module), 1);
        module.onDeactivated?.(payload);
      }
    }
  }
}

export type MachineConfig = {
  mainboard: Mainboard;
  states?: State<any>[];
  modules?: Module[];
}