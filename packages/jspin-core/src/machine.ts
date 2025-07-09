import { FastDataParser, SwitchChange } from "./data-parser";
import { IoNetwork } from "./hardware/io-network";
import { Mainboard, PortType } from "./hardware/mainboard";
import { PinActor } from "./pin-actor";
import { MachineState } from "./state-machine";

export class Machine {
  private readonly mainboard: Mainboard;
  private readonly ioNet?: IoNetwork;
  private readonly actors: PinActor<any>[] = [];

  constructor(config: MachineConfig) {
    this.mainboard = config.mainboard;
    this.ioNet = config.ioNet;
    this.actors = config.actors.slice();

    for (const actor of this.actors) {
      // Bind the actor's events to the machine
      actor.bindings.listener(this.onActorEvent.bind(this));
    }
  }

  async run(): Promise<void> {
    await this.mainboard.initialize(this.onData.bind(this));
    MachineState.state = 'ready';

    // Run forever (never resolve)
    return new Promise(() => { });
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
    // Echo event to all actors
    await Promise.all(this.actors.map(a => a.bindings.event(event)));
  }
}

export type MachineConfig = {
  mainboard: Mainboard;
  actors: PinActor<any>[];
  ioNet?: IoNetwork;
}