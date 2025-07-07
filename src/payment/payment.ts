import { Module, RepoDataChangePayload, SwitchChangePayload } from "../module";
import { always, when } from "../module-rules";
import { Repository } from "../repository";
import { StateMachine } from "../state-machine";
import EventEmitter from 'node:events';

export const GameStartableState = new StateMachine<'startable' | 'unstartable'>('startable');
export const PaymentRepo = new Repository({
  credits: 0
});

// Captures coins as payment
export class Payment implements Module {
  readonly active = always();
  readonly children = [
    PaymentRepo,
    GameStartableState,
    new StartGame(this.gameCost)
  ];

  constructor(public readonly gameCost = 4) { }

  onSwitch({ target }: SwitchChangePayload) {
    if (target.roles.includes('coin')) {
      PaymentRepo.data.credits += 1;
    }
  }
}

// Captures the start button to start the game
export class StartGame extends EventEmitter<{ player_added: [] }> implements Module {
  readonly active = when(GameStartableState, 'startable');

  constructor(public readonly gameCost = 4) {
    super();
  }

  onSwitch({ target }: SwitchChangePayload) {
    if (target.roles.includes('start') && PaymentRepo.data.credits >= this.gameCost) {
      PaymentRepo.data.credits -= this.gameCost; // Deduct credits for starting the game
      this.emit('player_added');
    }
  }
}
