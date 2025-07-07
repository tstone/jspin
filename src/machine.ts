import { FastCommand } from "./commands/fast-command";
import { MainBoard, PortType } from "./hardware";
import { Module } from "./module";
import { MachineState, State, StateType } from "./state";

export class Machine {
  private readonly states: State<any>[] = [MachineState];
  private readonly activeModules: Module[] = [];
  private readonly comms: MainboardComm = new MainboardComm(this.config.mainboard);

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
    for (const module of this.config.modules || []) {
      const isActive = module.active.isTrue(state, newState, oldState);
      if (isActive && !this.activeModules.includes(module)) {
        this.activeModules.push(module);
        module.onActivated?.({
          triggeringState: state,
          mainboard: this.comms
        });
      } else if (!isActive && this.activeModules.includes(module)) {
        this.activeModules.splice(this.activeModules.indexOf(module), 1);
        module.onDeactivated?.({
          triggeringState: state,
          mainboard: this.comms
        });
      }
    }
  }
}

export class MainboardComm {
  constructor(private readonly mainboard: MainBoard) { }
  async send(command: FastCommand, port: PortType): Promise<void> {
    await this.mainboard.send(command, port);
  }
}

export type MachineConfig = {
  mainboard: MainBoard;
  states?: State<any>[];
  modules?: Module[];
}