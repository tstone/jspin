import { ExpansionBoardType } from "./expansion-board";

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

  static port(board: ExpansionBoardType, port: number, count: number): LED[] {
    return Array.from({ length: count }, (_, i) => new LED(board, port, i));
  }
}