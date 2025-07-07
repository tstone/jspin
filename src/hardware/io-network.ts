import { Coil } from "./coil";
import { Switch } from "./switch";

export class IoNetwork {
  public readonly boards: IoNetworkBoard[] = [];

  constructor(...boards: IoNetworkBoardDesc[]) {
    let switchIndexOffset = 0;
    let coilIndexOffset = 0;

    boards.forEach((boardDesc, index) => {
      const board = new IoNetworkBoard(boardDesc, index, switchIndexOffset, coilIndexOffset);
      this.boards.push(board);
      switchIndexOffset += boardDesc.switchCount;
      coilIndexOffset += boardDesc.coilCount;
    });
  }

  getSwitch(board: number, index: number) {
    return this.boards[board].switches[index];
  }

  getSwitchById(id: number) {
    for (const board of this.boards) {
      const switchItem = board.switches.find(s => s.id === id);
      if (switchItem) {
        return switchItem;
      }
    }
  }

  getSwitches(board: number) {
    return this.boards[board].switches.slice();
  }

  getCoil(board: number, index: number) {
    return this.boards[board].coils[index];
  }

  getCoils(board: number) {
    return this.boards[board].coils.slice();
  }
}

export class IoNetworkBoard {
  public readonly switches: Switch[];
  public readonly coils: Coil[];

  constructor(
    private readonly details: IoNetworkBoardDesc,
    public readonly networkIndex: number,
    private readonly switchIndexOffset: number,
    private readonly coilIndexOffset: number,
  ) {
    this.switches = Array.from({ length: details.switchCount }, (_, i) => new Switch(i + switchIndexOffset));
    this.coils = Array.from({ length: details.coilCount }, (_, i) => new Coil(i + coilIndexOffset));
  }
}

export interface IoNetworkBoardDesc {
  desc: string;
  switchCount: number;
  coilCount: number;
}

export const CabinetIO: IoNetworkBoardDesc = {
  desc: 'Cabinet IO Board',
  switchCount: 24,
  coilCount: 8,
};

export const IO_3208: IoNetworkBoardDesc = {
  desc: 'I/O 3208',
  switchCount: 32,
  coilCount: 8,
};

export const IO_1616: IoNetworkBoardDesc = {
  desc: 'I/O 1616',
  switchCount: 16,
  coilCount: 16,
};

export const IO_0804: IoNetworkBoardDesc = {
  desc: 'I/O 0804',
  switchCount: 8,
  coilCount: 4,
};