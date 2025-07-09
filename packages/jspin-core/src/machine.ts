import { FastDataParser } from "./parser/data-parser";
import { IoNetwork } from "./hardware/io-network";
import { Mainboard, PortType } from "./hardware/mainboard";
import { PinActor } from "./pin-actor";
import { MachineState } from "./state-machine";
import { PinHardware } from "./hardware/hardware-wrapper";

export class Machine {
  private readonly mainboard: Mainboard;
  private readonly ioNet?: IoNetwork;
  private readonly actors: PinActor<any>[] = [];

  constructor(config: MachineConfig) {
    this.mainboard = config.mainboard;
    this.ioNet = config.ioNet;
    this.actors = config.actors.slice();

    const hardware = new PinHardware(this.mainboard);
    for (const actor of this.actors) {
      actor.bindings.listener(this.onActorEvent.bind(this));
      actor.bindings.hardware(hardware);
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
    // Echo event to all other actors
    await Promise.all(this.actors.map(a => {
      if (a === actor) return; // Skip self
      a.bindings.event(event);
    }));
  }
}

export type MachineConfig = {
  mainboard: Mainboard;
  actors: PinActor<any>[];
  ioNet?: IoNetwork;
}