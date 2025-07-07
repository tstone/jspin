import { FastCommand } from "./commands/fast-command";
import { ColorInstance } from 'color';

export type PortType = 'io' | 'exp';
export type DataListener = (port: PortType, data: string) => Promise<void>;

export interface MainBoard {
  initialize(callback: DataListener): Promise<void>;
  send(command: FastCommand, port?: PortType): boolean;
}

export interface ExpansionBoardType {
  get address(): string;
}

export const NeutronExpansion: ExpansionBoardType = {
  get address() {
    return '48';
  }
};

export class FP_EXP_0071 implements ExpansionBoardType {
  constructor(
    private readonly jumper0: boolean,
    private readonly jumper1: boolean) { }
  get address() {
    if (!this.jumper0 && !this.jumper1) {
      return 'B4';
    } else if (this.jumper0 && !this.jumper1) {
      return 'B5';
    } else if (!this.jumper0 && this.jumper1) {
      return 'B6';
    } else { // both jumpers are set
      return 'B7';
    }
  }
};

// TODO: other expansion boards

export class LED {
  readonly type = 'LED' as const;
  readonly indexHex: string;
  readonly expAddress: string;

  constructor(
    public readonly board: ExpansionBoardType,
    public readonly port: number = 0,
    public readonly index: number = 0) {

    this.indexHex = this.index.toString(16).padStart(2, '0');
    this.expAddress = `${this.board.address}${this.port}`;
  }
}

type Hardware = LED;