import { FastDataParser } from "./parser/data-parser";
import { IoNetwork, OrderedIoNetworkBoardDesc } from "./hardware/io-network";
import { Mainboard, PortType } from "./hardware/mainboard";
import { PinActor } from "./pin-actor";
import { MachineState, StateChange, StateMachine } from "./state-machine";
import { PinHardware } from "./hardware/hardware-wrapper";
import { WatchdogEvent } from "./parser/watchdog-event";
import { toHex } from "./commands/hex";
import { watchdogSetCmd } from "./commands/watchdog";

export class Machine<K extends Record<string, OrderedIoNetworkBoardDesc>> {
  private readonly mainboard: Mainboard;
  private readonly ioNet?: IoNetwork<K>;
  private readonly actors: PinActor<any>[];
  private watchdogInterval?: NodeJS.Timeout;

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
    console.log('Mainboard initialized.');

    // TODO: verify/error check ionet config with CN:

    await this.runWatchdog();
    await this.configureDevices();

    // MAYBE: CP: https://fastpinball.com/fast-serial-protocol/exp/cp/

    MachineState.state = 'ready';

    // Run forever (never resolve)
    return new Promise(() => { });
  }

  private async configureDevices() {
    for (const device of this.ioNet?.devices || []) {
      await device.configure();
    }
  }

  private async runWatchdog() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = undefined;
    }

    // Ensure the first watchdog command is working before continuing
    let wdResp = 'WD:F';
    while (wdResp == 'WD:F') {
      wdResp = await this.mainboard.sendAndReceive(watchdogSetCmd(1250));
      console.debug('Watchdog response:', wdResp);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.watchdogInterval = setInterval(() => {
      this.mainboard.send(watchdogSetCmd(1250));
    }, 1000);
  }

  private async onData(port: PortType, raw: string) {
    const event = FastDataParser.parse(raw, this.ioNet);
    console.log(`${port} → ${raw}`);

    if (event instanceof WatchdogEvent) {
      // Don't pass on to actors
    } else if (event) {
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