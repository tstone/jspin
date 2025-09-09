
export class WatchdogEvent {
  public readonly status: 'failed' | 'success' | 'invalid' | 'unknown';

  constructor(event: string) {
    this.status = event == 'p' ? 'success' :
      event == 'f' ? 'failed' :
        event == 'x' ? 'invalid' :
          'unknown';
  }
}