
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