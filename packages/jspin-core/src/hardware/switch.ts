import { SwitchConfig } from "../commands/configure-switch";

export class Switch {
  constructor(
    public readonly id: number,
  ) { }

  static from(id: number | Switch | SwitchConfig): Switch {
    if (id instanceof Switch) {
      return id;
    } else if (typeof id === 'number') {
      return new Switch(id);
    } else {
      return this.from(id.switchId);
    }
  }
}
