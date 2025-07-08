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
