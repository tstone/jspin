
export type PortType = 'io' | 'exp';
export type DataListener = (port: PortType, data: string) => Promise<void>;

export interface Mainboard {
  /** Perform any start-up, hardware registration, data binding, etc. */
  initialize(callback: DataListener): Promise<void>;
  /** Transmit command */
  send(data: string, port?: PortType): Promise<boolean>;
  sendAndReceive(data: string, port?: PortType): Promise<string>;
}