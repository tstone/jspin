import { FastDataParser } from "./parser/data-parser";
import { IoNetwork, OrderedIoNetworkBoardDesc } from "./hardware/io-network";
import { Mainboard, PortType } from "./hardware/mainboard";
import { PinActor } from "./pin-actor";
import { MachineState, StateChange, StateMachine } from "./state-machine";
import { PinHardware } from "./hardware/hardware-wrapper";

export class Machine<K extends Record<string, OrderedIoNetworkBoardDesc>> {
  private readonly mainboard: Mainboard;
  private readonly ioNet?: IoNetwork<K>;
  private readonly actors: PinActor<any>[];

  constructor(config: MachineConfig<K>) {
    this.mainboard = config.mainboard;
    this.ioNet = config.ioNet;
    this.actors = config.actors?.slice() || [];

    const states = Array.from(new Set([
      // automatically add built-in states
      MachineState
    ].concat(config.states || [])));
    for (const state of states) {
      state.addListener('change', this.onStateChange.bind(this));
    }

    for (const device of this.ioNet?.devices || []) {
      device.bindings.mainboard(this.mainboard);
    }

    const hardware = new PinHardware(this.mainboard);
    for (const actor of this.actors) {
      actor.bindings.listener(this.onActorEvent.bind(this));
      actor.bindings.hardware(hardware);
    }
  }

  async run(): Promise<void> {
    await this.mainboard.initialize(this.onData.bind(this));
    // TODO: verify/error check ionet config with CN:

    this.configureDevices();
    this.runWatchdog();

    // MAYBE: CP: https://fastpinball.com/fast-serial-protocol/exp/cp/

    MachineState.state = 'ready';

    // Run forever (never resolve)
    return new Promise(() => { });
  }

  private configureDevices() {
    for (const device of this.ioNet?.devices || []) {
      device.configure();
    }
  }

  private runWatchdog() {
    setInterval(() => {
      this.mainboard.send('WD:1000');
    }, 950);
  }

  private async onData(port: PortType, raw: string) {
    console.log('Received data:', port, raw);
    const event = FastDataParser.parse(raw, this.ioNet);
    if (event) {
      // Emit the event to all actors
      await Promise.all(this.actors.map(actor => actor.bindings.event(event)));
    }
  }

  private async onActorEvent(actor: PinActor<any>, event: Record<string, any>) {
    console.log('Actor event:', actor.constructor.name, event);
    // Echo event to all other actors
    await Promise.all(this.actors.map(a => {
      if (a === actor) return; // Skip self
      a.bindings.event(event);
    }));
  }

  private async onStateChange(event: StateChange) {
    await Promise.all(this.actors.map(actor => actor.bindings.event(event)));
  }
}

export type MachineConfig<K extends Record<string, OrderedIoNetworkBoardDesc>> = {
  mainboard: Mainboard;
  ioNet?: IoNetwork<K>;
  actors?: PinActor<any>[];
  states?: StateMachine[];
}