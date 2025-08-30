
export class Switch {
  constructor(
    public readonly id: number,
    public roles: Set<string> = new Set<string>(),
  ) { }

  addRole(role: string) {
    this.roles.add(role);
    return this;
  }

  removeRole(role: string) {
    this.roles.delete(role);
    return this;
  }

  hasRole(role: string): boolean {
    return this.roles.has(role);
  }
}

export enum SwitchRoles {
  Coin = 'coin',
  Start = 'start',
  Tilt = 'tilt',
  LeftInlane = 'left-inlane',
  RightInlane = 'right-inlane',
  LeftSlingshot = 'left-slingshot',
  RightSlingshot = 'right-slingshot',
  PlungeLane = 'plunge-lane',
}