# JSpin Monorepo

A TypeScript library for controlling pinball machine hardware, organized as a monorepo with separate packages for the core library and examples.

## Packages

- **`@jspin/core`** - Core library for pinball machine hardware control
- **`@jspin/examples`** - Example implementations and demos

## Getting Started

1. Install dependencies for all packages:

   ```bash
   npm install
   ```

2. Build all packages:

   ```bash
   npm run build
   ```

3. Run the examples:
   ```bash
   npm run start:examples
   ```

## Development

- **Build all packages**: `npm run build`
- **Run tests**: `npm run test`
- **Start examples**: `npm run start:examples`
- **Development mode for examples**: `npm run dev:examples`
- **Clean build artifacts**: `npm run clean`

## Project Structure

```
packages/
├── jspin-core/          # Core library
│   ├── src/
│   │   ├── hardware/    # Hardware abstraction layer
│   │   ├── commands/    # Hardware commands
│   │   ├── modules/     # Game modules
│   │   └── __tests__/   # Tests
│   └── package.json
└── jspin-examples/      # Example implementations
    ├── src/
    │   └── basic-example.ts
    └── package.json
```

## Core Library Features

- **Hardware Abstraction**: Control LEDs, switches, coils, and I/O networks
- **State Management**: Define and manage machine states
- **Module System**: Create reusable game logic modules
- **Command System**: Send commands to hardware controllers
- **Event Handling**: React to switch events and state changes

## Examples

The examples package contains sample implementations showing how to use the core library:

- **Basic Example**: Demonstrates LED control and module activation based on machine state
- **Switch Example**: Shows how to handle switch events and respond to button presses
- **LED Animation Example**: Demonstrates creating animated LED sequences and effects

### Running Examples

```bash
# Run different examples
npm run start:basic      # Basic LED control example
npm run start:switch     # Switch handling example
npm run start:led        # LED animation example

# Development mode (with file watching)
npm run dev:basic        # Watch basic example
npm run dev:switch       # Watch switch example
npm run dev:led          # Watch LED animation example
```
