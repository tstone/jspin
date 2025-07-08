import { Module } from "../module";
import { transition } from "../module-rules";
import { MachineState } from "../state-machine";

/** 
 * This module will automatically start the game immediately after boot.
 * This is primarily for the development and testing phases, but could be
 * used for home setups as well.
 */
export class AutoStart implements Module {
  readonly active = transition(MachineState, 'boot', 'ready');
  async onActivated() {
    MachineState.state = 'game'; // Automatically start the game (for testing)
  }
}