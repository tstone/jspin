import { State, StateType } from "./state";

export abstract class ModuleActiveRule {
  abstract isTrue(state: State<any>, to: StateType, from?: StateType): boolean;

  and(...rules: ModuleActiveRule[]): ModuleActiveRule {
    return new class extends ModuleActiveRule {
      isTrue(state: State<any>, to: StateType, from?: StateType): boolean {
        return rules.every(rule => rule.isTrue(state, to, from));
      }
    }
  }

  or(...rules: ModuleActiveRule[]): ModuleActiveRule {
    return new class extends ModuleActiveRule {
      isTrue(state: State<any>, to: StateType, from?: StateType): boolean {
        return rules.some(rule => rule.isTrue(state, to, from));
      }
    }
  }
}

export function always(): ModuleActiveRule {
  return new class extends ModuleActiveRule {
    isTrue(): boolean {
      return true;
    }
  };
}

export function when<T extends StateType>(state: State<T>, value: T) {
  return new class extends ModuleActiveRule {
    isTrue(state: State<any>, to: StateType): boolean {
      return state === state && to === value;
    }
  };
}

export function whenAny<T extends StateType>(state: State<T>, values: T[]) {
  return new class extends ModuleActiveRule {
    isTrue(state: State<any>, to: StateType): boolean {
      return state === state && values.includes(to as any);
    }
  };
}

export function transition(state: State<any>, from: StateType, to: StateType): ModuleActiveRule {
  return new class extends ModuleActiveRule {
    isTrue(currentState: State<any>, toState: StateType, fromState?: StateType): boolean {
      return currentState === state && fromState === from && toState === to;
    }
  };
}

export function not(rule: ModuleActiveRule): ModuleActiveRule {
  return new class extends ModuleActiveRule {
    isTrue(state: State<any>, to: StateType, from?: StateType): boolean {
      return !rule.isTrue(state, to, from);
    }
  };
}