import { Device } from "./device";
import { Driver } from "./driver";
import { Switch } from "./switch";

/** Used to describe the I/O network of a machine */
export class IoNetwork<K extends Record<string, OrderedIoNetworkBoardDesc> = any> {
  public readonly boards: Record<keyof K, IoNetworkBoard> = {} as any;
  public readonly devices: Device[] = [];

  constructor(boards: K) {
    let switchIndexOffset = 0;
    let driverIndexOffset = 0;

    Object.entries(boards).forEach(([key, boardDesc], index) => {
      const board = new IoNetworkBoard(boardDesc, index, switchIndexOffset, driverIndexOffset);
      this.boards[key as keyof K] = board;
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
    for (const board of Object.values(this.boards)) {
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

  defineDevice(def: (boards: Record<keyof K, IoNetworkBoard>) => Device) {
    const device = def(this.boards);
    this.devices.push(device);
    return device;
  }

  private getBoard(id: BoardIdentifier) {
    if (typeof id === "number") {
      return Object.values(this.boards).find(b => b.networkIndex === id)!;
    }
    return this.boards[id];
  }
}

type BoardIdentifier = number | string;

export class IoNetworkBoard {
  public readonly switches: Switch[];
  public readonly drivers: Driver[];

  constructor(
    public readonly details: OrderedIoNetworkBoardDesc,
    public readonly networkIndex: number,
    switchIndexOffset: number,
    driverIndexOffset: number,
  ) {
    this.switches = Array.from({ length: details.switchCount }, (_, i) => new Switch(i + switchIndexOffset));
    this.drivers = Array.from({ length: details.driverCount }, (_, i) => new Driver(i + driverIndexOffset));
  }
}

export interface IoNetworkBoardDesc {
  switchCount: number;
  driverCount: number;
}
export interface OrderedIoNetworkBoardDesc extends IoNetworkBoardDesc {
  order: number;
}

export function CabinetIO(order: number) { return { order, switchCount: 24, driverCount: 8 }; }
export function IO_3208(order: number) { return { order, switchCount: 32, driverCount: 8 }; }
export function IO_1616(order: number) { return { order, switchCount: 16, driverCount: 16 }; }
export function IO_0804(order: number) { return { order, switchCount: 8, driverCount: 4 }; }