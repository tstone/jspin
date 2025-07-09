import { StateMachine, StateType } from "./state-machine";

export abstract class ActorRule {
  abstract isTrue(event: Object): boolean;

  and(...rules: ActorRule[]): ActorRule {
    return allOf(...rules);
  }

  or(...rules: ActorRule[]): ActorRule {
    return anyOf(...rules);
  }
}

export function allOf(...rules: ActorRule[]): ActorRule {
  return new class extends ActorRule {
    isTrue(event: Object): boolean {
      return rules.every(rule => rule.isTrue(event));
    }
  }
}

export function anyOf(...rules: ActorRule[]): ActorRule {
  return new class extends ActorRule {
    isTrue(event: Object): boolean {
      return rules.some(rule => rule.isTrue(event));
    }
  };
}

export function always(): ActorRule {
  return new class extends ActorRule {
    isTrue(): boolean {
      return true;
    }
  };
}

export function stateIs<T extends StateType>(state: StateMachine, value: T) {
  return new class extends ActorRule {
    isTrue(): boolean {
      return state.state == value
    }
  };
}

export function stateAnyOf<T extends StateType>(state: StateMachine, values: T[]) {
  return new class extends ActorRule {
    isTrue(): boolean {
      return state === state && values.includes(state.state as any);
    }
  };
}

export function stateTransitionedFrom(state: StateMachine<any>, from: StateType, to: StateType): ActorRule {
  return new class extends ActorRule {
    isTrue(): boolean {
      return state.state === to && state.previous === from;
    }
  };
}

export function not(rule: ActorRule): ActorRule {
  return new class extends ActorRule {
    isTrue(event: Object): boolean {
      return !rule.isTrue(event);
    }
  };
}

/**
 * Requires the event to be an instance of the specified class.
 * 
 * @example
 * ```typescript
 * @handler(eventIs(SwitchChanged))
 * async handleSwitchEvents(event: SwitchChanged): Promise<void> {
 *   // This handler only runs when event is an instance of SwitchChanged
 * }
 * ```
 */
export function eventIs<T extends object>(constructor: new (...args: any[]) => T): ActorRule {
  return new class extends ActorRule {
    isTrue(event: Object): boolean {
      return event instanceof constructor;
    }
  };
}