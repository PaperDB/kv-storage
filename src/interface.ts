
type PlainObj = {
  [x: string]: VALUE;
}

export type VALUE = ArrayBuffer
  | Float32Array | Float64Array
  | Int8Array | Int16Array | Int32Array
  | Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array
  | Array<VALUE>
  | number | PlainObj | string | boolean

/**
 * Basic Interface for Preference (key-value) Storage
 * Support for various backend;
 * The recommend backend is LocalForage + localforage-cordovasqlitedriver
 */
export interface KVStorage {
  /** the name of the driver being used */
  readonly driver: string | null;

  /** the name of the backend being used */
  readonly backend?: 'localforage' | string;

  ready?: () => Promise<void>;
  close?: () => Promise<void>;

  has (key: string): Promise<boolean>;

  get (key: string): Promise<VALUE>;

  set<T extends VALUE> (key: string, value: T): Promise<T | void>;

  remove (key: string): Promise<void>;

  clear (): Promise<void>;

  length (): Promise<number>;

  keys (): Promise<string[]>;

  forEach (
    iteratorCallback: (value: VALUE, key: string, iterationNumber: Number) => void
  ): Promise<void>;
}
