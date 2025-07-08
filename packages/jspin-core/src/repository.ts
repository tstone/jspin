import _ from 'lodash';
import EventEmitter from 'node:events';
import onChange from 'on-change';

export class Repository<T extends Record<string, any>> extends EventEmitter<{
  // new payload, path, new value, old value, state, this
  change: [T, string, any, any]
}> {
  private _data: T;

  constructor(init: T) {
    super();
    this._data = init;
    onChange(this._data, ((path: string, newValue: any, oldValue: any) => {
      this.emit('change', this._data, path, newValue, oldValue);
    }).bind(this));
  }

  get data(): T {
    return this._data;
  }

  set data(newData: T) {
    this._data = newData;
  }

  get<K extends keyof T>(key: K): T[K] {
    return _.get(this._data, key);
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    _.set(this._data, key, value);
  }
}