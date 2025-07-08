
export class Switch {
  constructor(
    public readonly id: number,
    public roles: SwitchRole[] = [],
  ) { }
}

export type SwitchRole = 'coin' | 'start' | 'tilt' | 'left-flipper' | 'right-flipper' | 'left-outlane' | 'right-outlane' | 'left-inlane' | 'right-inlane' |
  'left-slingshot' | 'right-slingshot' | 'path' | 'ramp' | 'target' | 'plunge-lane' | string;