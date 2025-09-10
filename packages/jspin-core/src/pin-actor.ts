import createLogger from 'logging';
import { PinHardware } from "./hardware/hardware-wrapper";
import { ActorRule } from "./actor-rules";

export abstract class PinActor<Config extends Record<string, any> = {}> {
  protected config: Config;
  protected readonly logger = createLogger(this.constructor.name);

  private _hardware?: PinHardware;
  private listener?: PinActorListener;
  private handlers: { handler: PinActorHandler; rule: ActorRule }[] = [];

  constructor(initialConfig: Config) {
    this.config = Object.assign({}, initialConfig);
    this.emit(new PinActorConfigured(this.config));

    // Identify event handlers from the class prototype
    const handlerMetadata: HandlerMetadata[] = (this.constructor as any)[HANDLER_METADATA_KEY] || [];
    for (const { methodName, rule } of handlerMetadata) {
      const method = this[methodName as keyof this];
      if (typeof method === 'function') {
        // Bind the method to this instance and add to handlers with its rule
        this.handlers.push({
          handler: method.bind(this) as PinActorHandler,
          rule
        });
      }
    }
  }

  protected emit<Event extends Record<string, any>>(e: Event) {
    if (this.listener) {
      this.listener(this, e);
    }
  }

  protected get hardware(): PinHardware {
    return this._hardware!;
  }

  readonly bindings = {
    listener: (listener: PinActorListener) => {
      this.listener = listener;
    },
    event: async (event: Record<string, any>) => {
      // Filter handlers based on their active rules by checking registered state machines
      const activeHandlers = this.handlers.filter(({ rule }) => {
        return rule.isTrue(event);
      });
      // Run all handlers
      for (const { handler } of activeHandlers) {
        await handler(event);
      }
    },
    hardware: (hardware: PinHardware) => {
      this._hardware = hardware;
    }
  }
}

export type PinActorListener = (actor: PinActor<any>, event: Record<string, any>) => void;
export type PinActorHandler = (event: Record<string, any>) => unknown | Promise<unknown>;

/** Event that indicates when a PinActor has been configured */
export class PinActorConfigured<Config extends Record<string, any>> {
  public readonly config: Config;
  constructor(config: Config) {
    this.config = Object.assign({}, config);
  }
}


// Metadata key for storing handler information
const HANDLER_METADATA_KEY = Symbol('pinActorHandlers');

// Interface for handler metadata
interface HandlerMetadata {
  methodName: string;
  rule: ActorRule;
}

/**
 * Mark methods as PinActor handlers
 * 
 * @param rule - ModuleActiveRule that determines when this handler is active
 * 
 * @example
 * ```typescript
 * class Example extends PinActor<any> {
 *   @handler(always())
 *   async example1(event: Record<string, any>): Promise<void> {
 *     // Always active handler
 *   }
 * 
 *   @handler(when(GameState, 'playing'))
 *   async example2(event: Record<string, any>): Promise<void> {
 *     // Only active when GameState is 'playing'
 *   }
 * }
 * ```
 */
export function handler(rule: ActorRule) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    // Ensure the method signature matches PinActorHandler
    const originalMethod = descriptor.value;

    if (typeof originalMethod !== 'function') {
      throw new Error(`@handler can only be applied to methods. ${propertyKey} is not a function.`);
    }

    // Store handler metadata on the constructor
    if (!target.constructor[HANDLER_METADATA_KEY]) {
      target.constructor[HANDLER_METADATA_KEY] = [];
    }

    const metadata: HandlerMetadata = {
      methodName: propertyKey,
      rule: rule
    };

    // Check if this method is already registered and replace it
    const existingIndex = target.constructor[HANDLER_METADATA_KEY].findIndex(
      (meta: HandlerMetadata) => meta.methodName === propertyKey
    );

    if (existingIndex >= 0) {
      target.constructor[HANDLER_METADATA_KEY][existingIndex] = metadata;
    } else {
      target.constructor[HANDLER_METADATA_KEY].push(metadata);
    }

    // Return the original descriptor unchanged
    return descriptor;
  };
}