import { StateMachine, StateType } from "./state-machine";

export abstract class ActorRule {
  abstract isTrue(event: Object): boolean;

  /**
   * Combines this rule with other rules using logical AND.
   * All rules must be true for the combined rule to be true.
   */
  and(...rules: ActorRule[]): ActorRule {
    return allOf(...rules);
  }

  /**
   * Combines this rule with other rules using logical OR.
   * At least one rule must be true for the combined rule to be true.
   */
  or(...rules: ActorRule[]): ActorRule {
    return anyOf(...rules);
  }
}

/**
 * Creates a rule that requires all provided rules to be true.
 * 
 * @example
 * ```typescript
 * @handler(allOf(eventIs(SwitchChanged), stateIs(myState, 'active')))
 * async handleActiveSwitch(event: SwitchChanged): Promise<void> {
 *   // Only runs when event is SwitchChanged AND state is 'active'
 * }
 * ```
 */
export function allOf(...rules: ActorRule[]): ActorRule {
  return new class extends ActorRule {
    isTrue(event: Object): boolean {
      return rules.every(rule => rule.isTrue(event));
    }
  }
}

/**
 * Creates a rule that requires at least one of the provided rules to be true.
 * 
 * @example
 * ```typescript
 * @handler(anyOf(eventIs(ButtonPressed), eventIs(SwitchChanged)))
 * async handleInputEvents(event: ButtonPressed | SwitchChanged): Promise<void> {
 *   // Runs when event is either ButtonPressed OR SwitchChanged
 * }
 * ```
 */
export function anyOf(...rules: ActorRule[]): ActorRule {
  return new class extends ActorRule {
    isTrue(event: Object): boolean {
      return rules.some(rule => rule.isTrue(event));
    }
  };
}

/**
 * Creates a rule that is always true, allowing handlers to run for any event.
 * 
 * @example
 * ```typescript
 * @handler(always())
 * async handleAllEvents(event: Object): Promise<void> {
 *   // This handler runs for every event
 * }
 * ```
 */
export function always(): ActorRule {
  return new class extends ActorRule {
    isTrue(): boolean {
      return true;
    }
  };
}

/**
 * Creates a rule that checks if a state machine is in a specific state.
 * 
 * @example
 * ```typescript
 * @handler(stateIs(gameState, 'playing'))
 * async handlePlayingEvents(event: Object): Promise<void> {
 *   // Only runs when gameState is in 'playing' state
 * }
 * ```
 */
export function stateIs<T extends StateType>(state: StateMachine, value: T) {
  return new class extends ActorRule {
    isTrue(): boolean {
      return state.state == value
    }
  };
}

/**
 * Creates a rule that checks if a state machine is in any of the specified states.
 * 
 * @example
 * ```typescript
 * @handler(stateAnyOf(gameState, ['paused', 'menu', 'settings']))
 * async handleNonPlayingEvents(event: Object): Promise<void> {
 *   // Runs when gameState is in 'paused', 'menu', or 'settings'
 * }
 * ```
 */
export function stateAnyOf<T extends StateType>(state: StateMachine, values: T[]) {
  return new class extends ActorRule {
    isTrue(): boolean {
      return state === state && values.includes(state.state as any);
    }
  };
}

/**
 * Creates a rule that checks if a state machine has transitioned from one specific state to another.
 * 
 * @example
 * ```typescript
 * @handler(stateTransitionedFrom(gameState, 'menu', 'playing'))
 * async handleGameStart(event: Object): Promise<void> {
 *   // Only runs when transitioning from 'menu' to 'playing'
 * }
 * ```
 */
export function stateTransitionedFrom(state: StateMachine<any>, from: StateType, to: StateType): ActorRule {
  return new class extends ActorRule {
    isTrue(): boolean {
      return state.state === to && state.previous === from;
    }
  };
}

/**
 * Creates a rule that negates another rule, inverting its boolean result.
 * 
 * @example
 * ```typescript
 * @handler(not(stateIs(gameState, 'paused')))
 * async handleNonPausedEvents(event: Object): Promise<void> {
 *   // Runs when gameState is NOT in 'paused' state
 * }
 * ```
 */
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