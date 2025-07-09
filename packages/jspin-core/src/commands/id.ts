import { ExpansionBoardType } from "../hardware/expansion-board";

export function idCmd(board?: ExpansionBoardType, breakoutPort?: number): string {
  if (board && breakoutPort !== undefined) {
    return `ID@${board.address}:${breakoutPort}:`;
  } else if (board) {
    return `ID@${board.address}:`;
  }
  return `ID:`;
}