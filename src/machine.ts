import { FastDataParser, SwitchChange } from "./data-parser";
import { IoNetwork } from "./hardware/io-network";
import { Mainboard, PortType } from "./hardware/mainboard";
import { Module, StateChangePayload, RepoDataChangePayload, SwitchChangePayload } from "./module";
import { Repository } from "./repository";
import { MachineState, StateMachine, StateType } from "./state-machine";

export class Machine {
  private readonly states: StateMachine<any>[] = [MachineState];
  private readonly repository: Repository<any>[] = [];
  private readonly mainboard: Mainboard;
  private readonly ioNet?: IoNetwork;
  private readonly allModules: Module[] = [];
  private readonly activeModules: Module[] = [];

  constructor(config: MachineConfig) {
    this.mainboard = config.mainboard;
    this.ioNet = config.ioNet;

    for (const module of config.modules || []) {
      this.allModules.push(module);
      if (module.children) {
        for (const child of module.children) {
          if ('active' in child) {
            this.allModules.push(child);
          } else if (child instanceof StateMachine) {
            this.states.push(child);
          } else if (child instanceof Repository) {
            this.repository.push(child);
          }
        }
      }
    }

    // bind change events
    for (const state of this.states) {
      state.on('change', (newState, oldState, state) => {
        this.onStateChange(newState, oldState, state);
      });
    }
    for (const repo of this.repository) {
      repo.on('change', (payload, path, newValue, oldValue) => {
        this.onRepoDataChange(payload, path, newValue, oldValue);
      });
    }
  }

  async run(): Promise<void> {
    // bootstrap initial states
    for (const state of this.states) {
      this.onStateChange(state.state, undefined, state);
    }

    await this.mainboard.initialize(this.onData.bind(this));
    MachineState.state = 'ready';

    // Run forever (never resolve)
    return new Promise(() => { });
  }

  private async onData(port: PortType, raw: string) {
    console.log('Received data:', port, raw);
    const data = FastDataParser.parse(raw);
    if (data instanceof SwitchChange) {
      const target = this.ioNet?.getSwitchById(data.id);
      if (!target) {
        console.warn(`Switch with ID ${data.id} not found in IoNetwork.`);
        return;
      }
      const payload = new SwitchChangePayload(target, data.state, this.mainboard);

      for (const module of this.activeModules) {
        try {
          await module.onSwitch?.(payload);
        } catch (error) {
          console.error(`Error in module ${module.constructor.name} on switch change:`, error);
        }
      }
    }
  }

  private onStateChange(newState: StateType, oldState: StateType | undefined, state: StateMachine<any>) {
    console.log(`State changed from ${oldState?.toString()} to ${newState.toString()}`);
    const event = new StateChangePayload(state, this.mainboard);

    for (const module of this.allModules) {
      const isActive = module.active.isTrue(state, newState, oldState);
      if (isActive && !this.activeModules.includes(module)) {
        this.activeModules.push(module);
        module.onActivated?.(event);
      } else if (!isActive && this.activeModules.includes(module)) {
        this.activeModules.splice(this.activeModules.indexOf(module), 1);
        module.onDeactivated?.(event);
      }
    }
  }

  private async onRepoDataChange(payload: Record<string, any>, path: string, newValue: any, oldValue: any) {
    console.log(`Repo data changed at path ${path}: ${oldValue} -> ${newValue}`);
    const event = new RepoDataChangePayload(payload, path, newValue, oldValue, this.mainboard);
    for (const module of this.activeModules) {
      try {
        await module.onRepositoryChange?.(event);
      } catch (error) {
        console.error(`Error in module ${module.constructor.name} on state data change:`, error);
      }
    }
  }
}

export type MachineConfig = {
  mainboard: Mainboard;
  modules?: Module[];
  ioNet?: IoNetwork;
}