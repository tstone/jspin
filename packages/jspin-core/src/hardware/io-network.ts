import { Device } from "./device";
import { Driver } from "./driver";
import { Switch } from "./switch";

/** Used to describe the I/O network of a machine */
export class IoNetwork {
  public readonly boards: IoNetworkBoard[] = [];
  public readonly devices: Device[] = [];

  constructor(...boards: IoNetworkBoardDesc[]) {
    let switchIndexOffset = 0;
    let driverIndexOffset = 0;

    boards.forEach((boardDesc, index) => {
      const board = new IoNetworkBoard(boardDesc, index, switchIndexOffset, driverIndexOffset);
      this.boards.push(board);
      switchIndexOffset += boardDesc.switchCount;
      driverIndexOffset += boardDesc.driverCount;
    });
  }

  getSwitch(boardId: BoardIdentifier, switchIndex: number) {
    const board = this.getBoard(boardId);
    return board.switches[switchIndex];
  }

  getSwitches(boardId: BoardIdentifier) {
    const board = this.getBoard(boardId);
    return board.switches.slice();
  }

  getSwitchById(id: number) {
    for (const board of this.boards) {
      const switchItem = board.switches.find(s => s.id === id);
      if (switchItem) {
        return switchItem;
      }
    }
  }

  getDriver(boardId: BoardIdentifier, driverIndex: number) {
    const board = this.getBoard(boardId);
    return board.drivers[driverIndex];
  }

  getDrivers(boardId: BoardIdentifier) {
    const board = this.getBoard(boardId);
    return board.drivers.slice();
  }

  defineDevice(def: (boards: IoNetworkBoard[]) => Device) {
    const device = def(this.boards);
    this.devices.push(device);
    return device;
  };

  private getBoard(id: BoardIdentifier) {
    if (typeof id === "number") {
      return this.boards[id];
    } else {
      return this.boards.find(board => board.details == id)!;
    }
  }
}

type BoardIdentifier = number | IoNetworkBoardDesc;

export class IoNetworkBoard {
  public readonly switches: Switch[];
  public readonly drivers: Driver[];

  constructor(
    public readonly details: IoNetworkBoardDesc,
    public readonly networkIndex: number,
    switchIndexOffset: number,
    driverIndexOffset: number,
  ) {
    this.switches = Array.from({ length: details.switchCount }, (_, i) => new Switch(i + switchIndexOffset));
    this.drivers = Array.from({ length: details.driverCount }, (_, i) => new Driver(i + driverIndexOffset));
  }
}

export interface IoNetworkBoardDesc {
  desc: string;
  switchCount: number;
  driverCount: number;
}

export const CabinetIO: IoNetworkBoardDesc = {
  desc: 'Cabinet IO Board',
  switchCount: 24,
  driverCount: 8,
};

export const IO_3208: IoNetworkBoardDesc = {
  desc: 'I/O 3208',
  switchCount: 32,
  driverCount: 8,
};

export const IO_1616: IoNetworkBoardDesc = {
  desc: 'I/O 1616',
  switchCount: 16,
  driverCount: 16,
};

export const IO_0804: IoNetworkBoardDesc = {
  desc: 'I/O 0804',
  switchCount: 8,
  driverCount: 4,
};