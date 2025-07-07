import { ExpansionBoardType } from "../hardware/expansion-board";
import { DynFastCommand } from "./fast-command";

export class ID implements DynFastCommand {
  constructor(
    private readonly board?: ExpansionBoardType,
    readonly breakoutPort?: number) { }

  toString(): string {
    if (this.board && this.breakoutPort !== undefined) {
      return `ID@${this.board.address}:${this.breakoutPort}:`;
    } else if (this.board) {
      return `ID@${this.board.address}:`;
    }
    return `ID:`;
  }
}