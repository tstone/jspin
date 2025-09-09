import { SerialPort } from "serialport";
import { idCmd } from "./commands/id";
import { configureHardwareCmd } from "./commands/configure-hardware";
import { DataListener, Mainboard, PortType } from "./hardware/mainboard";
import { NeutronExpansion } from "./hardware/expansion-board";

export class Neutron implements Mainboard {
  private readonly ioPort: SerialPort;
  private readonly expPort?: SerialPort;

  constructor(options: NeutronOptions) {
    this.ioPort = new SerialPort({
      path: options.ioPort,
      baudRate: 921_600,
      stopBits: 1,
      parity: 'none',
      autoOpen: false,
    });

    if (options.expPort) {
      this.expPort = new SerialPort({
        path: options.expPort,
        baudRate: 921_600,
        stopBits: 1,
        parity: 'none',
        autoOpen: false,
      });
    }
  }

  async initialize(dataListener: DataListener): Promise<void> {
    // Reference: https://fastpinball.com/fast-serial-protocol/net/initial_connection/

    await this.openPort(this.ioPort);
    console.log('IO Port opened:', this.ioPort.path);

    // Wait for board to boot up
    this.send(idCmd(), 'io');
    let resp = 'ID:F';
    let idCounter = 0;
    while (resp != 'ID:P') {
      idCounter++;
      if (idCounter > 10000) {
        throw new Error('Failed to boot board');
      }

      resp = await this.waitForResponse(this.ioPort);

      // sleep for 10ms
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    console.log('Board ID:', resp.trim());

    // Tell board it's a Neutron
    this.send(configureHardwareCmd('2000', { switchReporting: 'verbose' }), 'io');
    const resp2 = await this.waitForResponse(this.ioPort);
    console.log('Configuration response:', resp2.toString().trim());

    // Send watch dog as part of initialization so that triggers always happen after this.
    // Sending TL, etc. before this can cause issues.
    // The Machine will continue sending watchdogs after this.
    this.send('WD:5000', 'io');
    await this.waitForResponse(this.ioPort);

    // Setup is done, bind to machine
    this.ioPort.on('data', (data) => {
      dataListener('io', data.toString());
    });

    if (this.expPort) {
      await this.openPort(this.expPort);
      console.log('EXP Port opened:', this.expPort.path);
      this.send(idCmd(NeutronExpansion), 'exp');
      const resp3 = await this.waitForResponse(this.expPort);
      console.log('EXP configuration response:', resp3.toString().trim());

      this.expPort.on('data', (data) => {
        dataListener('exp', data.toString());
      });
    }
  }

  send(data: string, port?: PortType): boolean {
    port ||= 'io';
    console.log(`Sending command to ${port} port:`, data);

    if (port === 'io') {
      return this.ioPort.write(data);
    } else if (port === 'exp' && this.expPort) {
      return this.expPort.write(data);
    }
    return false;
  }

  private openPort(port: SerialPort): Promise<void> {
    return new Promise((resolve, reject) => {
      port.open((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private waitForResponse(port: SerialPort): Promise<string> {
    return new Promise((resolve) => {
      port.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });
  }
}

export type NeutronOptions = {
  ioPort: string;
  expPort?: string;
};