
export type FastCommand = string | DynFastCommand;

export interface DynFastCommand {
  toString(): string;
}