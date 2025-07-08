// Core library exports
export { Machine } from "./machine";
export { Neutron } from "./neutron";
export { MachineState, StateMachine } from "./state-machine";
export { Module, StateChangePayload } from "./module";
export { transition as transitioned, when } from "./module-rules";
export { FastDataParser, FastData, SwitchChange } from "./data-parser";
export { Repository } from "./repository";

// Hardware exports
export { NeutronExpansion } from "./hardware/expansion-board";
export { LED } from "./hardware/led";
export { CabinetIO, IO_0804, IO_1616, IO_3208, IoNetwork } from "./hardware/io-network";
export { Coil } from "./hardware/coil";
export { Switch } from "./hardware/switch";
export { Mainboard } from "./hardware/mainboard";

// Command exports
export { ConfigureHardware } from "./commands/configure-hardware";
export { FastCommand } from "./commands/fast-command";
export { ID } from "./commands/id";
export { SetLEDColor } from "./commands/set-led-color";

// Module exports
export { AutoStart } from "./modules/auto-start";
export { Payment } from "./modules/payment";