import EventEmitter from 'node:events';

export type StateType = string | number;

export class State<T extends StateType> extends EventEmitter<{ change: [T, State<T>, T] }> {
  private current: T;

  constructor(initial: T) {
    super();
    this.current = initial;
  }

  get state(): T {
    return this.current;
  }

  set state(newValue: T) {
    if (newValue === this.current) {
      return; // No change, do nothing
    }

    const old = this.current;
    this.current = newValue;
    this.emit('change', newValue, this, old);
  }
}

/**
 * boot => ready => game => ready => ...
 *
 * `ready` is the state when the machine is not booting or in game mode.
 * `game` is the state when the machine is actively playing a game.
 */
export const MachineState = new State<'boot' | 'ready' | 'game'>('boot');