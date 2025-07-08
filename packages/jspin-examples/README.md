# @jspin/examples

Example implementations demonstrating how to use the JSpin core library for pinball machine control.

## Examples

### Basic Example (`basic-example.ts`)

Demonstrates:

- Setting up a machine with hardware configuration
- Creating custom modules that respond to state changes
- Controlling LEDs based on machine state
- Using the AutoStart module

## Running Examples

```bash
# Run the basic example
npm start

# Run in development mode (with file watching)
npm run dev
```

## Example Structure

```typescript
import { Machine, Neutron, LED, Module, when, MachineState } from "@jspin/core";

// Create custom module
class TurnOnLEDTest implements Module {
  readonly active = when(MachineState, "game");

  async onActivated({ leds }) {
    // Your game logic here
  }
}

// Set up machine
const machine = new Machine({
  mainboard: new Neutron({
    /* config */
  }),
  modules: [new TurnOnLEDTest()],
});
```

## Creating Your Own Examples

1. Create a new TypeScript file in the `src/` directory
2. Import the necessary classes from `@jspin/core`
3. Set up your hardware configuration
4. Create modules for your game logic
5. Initialize and run the machine

## Hardware Configuration

The examples assume you have:

- A Neutron mainboard connected via serial ports
- Expansion boards for I/O
- LEDs connected to the expansion board ports

Adjust the hardware configuration in the examples to match your setup.
