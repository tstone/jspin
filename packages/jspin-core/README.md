# @jspin/core

Core library for controlling pinball machine hardware. This package provides hardware abstraction, state management, and a module system for building pinball machine control software.

## Features

- **Hardware Control**: Abstractions for LEDs, switches, coils, and I/O networks
- **State Management**: Define and transition between machine states
- **Module System**: Create reusable game logic that responds to state changes
- **Command System**: Send structured commands to hardware controllers
- **Event Handling**: React to switch events and hardware state changes

## Installation

```bash
npm install @jspin/core
```

## Basic Usage

```typescript
import {
  Machine,
  Neutron,
  MachineState,
  LED,
  NeutronExpansion,
  AutoStart,
} from "@jspin/core";

// Create hardware instances
const testLED = new LED(NeutronExpansion, 0, 1);

// Create a machine with hardware and modules
const machine = new Machine({
  mainboard: new Neutron({
    ioPort: "/dev/ttyACM0",
    expPort: "/dev/ttyACM1",
  }),
  modules: [new AutoStart()],
});

// Start the machine
await machine.run();
```

## API Reference

### Hardware Classes

- `LED` - Control individual LEDs or LED strips
- `Switch` - Handle switch inputs
- `Coil` - Control solenoids and motors
- `IoNetwork` - Manage I/O expansion boards

### State Management

- `MachineState` - Built-in machine states
- `StateMachine` - State transition management
- `Module` - Base class for game logic modules

### Commands

- `SetLEDColor` - Set LED colors
- `ConfigureHardware` - Configure hardware settings
- `ID` - Query hardware identification

## Development

```bash
# Build the library
npm run build

# Run tests
npm run test
```

---

Low level: switches
High level: game events

## Architecture: Concept

At it's core, a pinball machine software is nothing more than handling of switch inputs. All playler interactions ultimately distill down
to switches going on or off.

```typescript
// game-level events
export class GameStart {}
export class CreditsUpdated {
  constructor(public readonly count: number) {}
}

export class PaymentActorConfig {
  constructor(public readonly gameCost: number) {}
}

const Startable = new StateMachine<"startable" | "unstartable">("startable");

// actor
export class PaymentsActor extends PinActor<PaymentActorConfig> {
  // Mutable state is always private. Any changes to mutable state that need to be
  // known by other actors will be communicated via events
  private credits: number = 0;

  constructor(private config: PaymentActorConfig = { gameCost: 4 }) {}
  // PinActor includes an automatic functionality that does the following:
  // - On construction emits an `ActorConfigured` event
  // - Adds an `UpdateConfig` event handler to update this.config
  // - ...which also emits an `ActorConfigured` event when changed

  @handler(always())
  function general(event: Object) {
    if (event instanceof SwitchChanged && event.target.role.includes("coin")) {
      this.updateCredits(this.credits + 1);
    } else if (event instanceof AdvanceBall && event.currentBall >= 2) {
      // When any player gets to ball 2, games cannot be started
      this.startable.state = "unstartable";
    } else if (event instanceof GameEnd) {
      this.startable.state = "startable";
    }
  }

  @handler(when(Startable, "startable"))
  function startButton(event: Object) {
    if (
      event.target.roles.includes("start") &&
      this.credits >= this.config.gameCost
    ) {
      this.updateCredits((this.credits -= this.config.gameCost));
      this.emit(new GameStart());
    }
  }

  private updateCredits(count: number) {
    this.credits = count;
    this.emit(new CreditsUpdated(this.credits));
    // events will also be echoed out via a local websockets server allowing
    // other software or interfaces to response to events (e.g. a screen or DMD)
  }
}
```
