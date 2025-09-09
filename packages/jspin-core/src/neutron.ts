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
    let resp = 'ID:F';
    let idCounter = 0;
    while (!resp.includes('ID:NET')) {
      idCounter++;
      if (idCounter > 10000) {
        throw new Error('Failed to boot board');
      }

      resp = await this.sendAndReceive(idCmd(), 'io');
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    console.log('Board ID:', resp.trim());

    // Tell board it's a Neutron
    const resp2 = await this.sendAndReceive(configureHardwareCmd('2000', { switchReporting: 'verbose' }), 'io');
    console.log('Configuration response:', resp2.toString().trim());

    // Setup is done, bind to machine
    this.listen(this.ioPort, 'io', dataListener);

    if (this.expPort) {
      await this.openPort(this.expPort);
      console.log('EXP Port opened:', this.expPort.path);
      const resp3 = await this.sendAndReceive(idCmd(NeutronExpansion), 'exp');
      console.log('EXP configuration response:', resp3.toString().trim());
      this.listen(this.expPort, 'exp', dataListener);
    }
  }

  listen(port: SerialPort, portType: PortType, dataListener: DataListener): void {
    let buffer = '';
    port.on('data', (data) => {
      const raw = data.toString();
      buffer += raw;

      if (raw.includes('\r')) {
        const msgs = buffer.split('\r').filter(m => m.trim().length > 0);

        // send all but the last (which may be incomplete)
        const last = msgs.pop()!.trim();

        for (const msg of msgs) {
          const cleaned = msg.trim();
          if (cleaned.length > 0) {
            dataListener(portType, cleaned);
          }
        }

        // if the last ends with \r, message is complete, otherwise save for later
        if (raw.endsWith('\r')) {
          buffer = '';
          dataListener(portType, last);
        } else {
          buffer = last;
        }
        return;
      }
    });
  }

  send(data: string, port?: PortType): Promise<boolean> {
    console.log(`${port || 'io'} ← ${data}`);
    const outboundPort = port === 'exp' ? this.expPort : this.ioPort;

    if (outboundPort) {
      return new Promise((resolve, reject) => {
        outboundPort.write(data, (err) => {
          if (err) {
            reject(err);
          } else {
            outboundPort.drain((drainErr) => {
              if (drainErr) {
                reject(drainErr);
              } else {
                resolve(true);
              }
            });
          }
        });
      });
    }

    return Promise.resolve(false);
  }

  sendAndReceive(data: string, port?: PortType): Promise<string> {
    const outboundPort = port === 'exp' ? this.expPort : this.ioPort;
    if (outboundPort) {
      return new Promise(async (resolve) => {
        outboundPort.once('data', (data) => {
          resolve(data.toString().trim());
        });
        await this.send(data, port);
      });
    }

    return Promise.reject(`Port ${port} not configured.`);
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
}

export type NeutronOptions = {
  ioPort: string;
  expPort?: string;
};