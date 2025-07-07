
export class FastDataParser {
  static parse(data: string): FastData | undefined {
    let [cmd, rawArgs] = data.split(':');
    cmd = cmd.toLowerCase();
    rawArgs = rawArgs?.trim();

    if (cmd == '/l:' || cmd == '/n:') {
      const idHex = rawArgs;
      const id = Number(`0x${idHex}`);
      return new SwitchChange(id, 'open');
    } else if (cmd == '-l:' || cmd == '-n:') {
      const idHex = rawArgs;
      const id = Number(`0x${idHex}`);
      return new SwitchChange(id, 'closed');
    }
  }
}

export type FastData = SwitchChange;

export class SwitchChange {
  constructor(
    public readonly id: number,
    public readonly state: 'open' | 'closed'
  ) { }
}
