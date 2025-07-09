import EventEmitter from 'node:events';

export type StateType = string | number;

export class StateMachine<T extends StateType = any> extends EventEmitter<{ change: [T, T, StateMachine<T>] }> {
  private current: T;
  private past?: T;

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

    this.past = this.current; // Store the previous state
    this.current = newValue;
    this.emit('change', newValue, this.past, this);
  }

  get previous(): T | undefined {
    return this.past;
  }
}

/**
 * boot => ready <=> game
 *
 * `ready` is the state when the machine is not booting or in game mode.
 * `game` is the state when the machine is actively playing a game.
 */
export const MachineState = new StateMachine<'boot' | 'ready' | 'game'>('boot');
