import { FastDataParser } from "./parser/data-parser";
import { IoNetwork, OrderedIoNetworkBoardDesc } from "./hardware/io-network";
import { Mainboard, PortType } from "./hardware/mainboard";
import { PinActor } from "./pin-actor";
import { MachineState } from "./state-machine";
import { PinHardware } from "./hardware/hardware-wrapper";
import { configureDriverCmd } from "./commands/configure-driver";
import { Device, GenericDrivenDevice } from "./hardware/device";
import { triggerDriverCmd } from "./commands/trigger-driver";

export class Machine<K extends Record<string, OrderedIoNetworkBoardDesc>> {
  private readonly mainboard: Mainboard;
  private readonly ioNet?: IoNetwork<K>;
  private readonly actors: PinActor<any>[];

  constructor(config: MachineConfig<K>) {
    this.mainboard = config.mainboard;
    this.ioNet = config.ioNet;
    this.actors = config.actors?.slice() || [];

    const hardware = new PinHardware(this.mainboard);
    for (const actor of this.actors) {
      actor.bindings.listener(this.onActorEvent.bind(this));
      actor.bindings.hardware(hardware);
    }
  }

  async run(): Promise<void> {
    await this.mainboard.initialize(this.onData.bind(this));
    // TODO: verify ionet config with CN:
    this.configureDrivers();
    this.startWatchdog();

    // MAYBE: CP: https://fastpinball.com/fast-serial-protocol/exp/cp/

    MachineState.state = 'ready';

    // Run forever (never resolve)
    return new Promise(() => { });
  }

  private configureDrivers() {
    for (const device of this.ioNet?.devices || []) {
      if (device instanceof GenericDrivenDevice) {
        // Configure driver
        this.mainboard.send(configureDriverCmd(device.driver.id, device.config));
        // Activate automatic firing if switch is given
        if (device.config.switch) {
          this.mainboard.send(triggerDriverCmd(device.driver.id, 'automatic'));
        }
      }
    }
  }

  private startWatchdog() {
    setInterval(() => {
      this.mainboard.send('WD:500');
    }, 450);
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

export type MachineConfig<K extends Record<string, OrderedIoNetworkBoardDesc>> = {
  mainboard: Mainboard;
  actors?: PinActor<any>[];
  ioNet?: IoNetwork<K>;
}