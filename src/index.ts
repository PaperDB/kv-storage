
import LocalForage from 'localforage'
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver'
import { KVStorage as KVStorageInterface, VALUE } from './interface'
import IPFSRepoDriver from './localforage-driver-ipfs-repo'
import Repo from 'ipfs-repo'

type DriverNames = 'sqlite' | 'indexeddb' | 'ipfs-repo' | 'websql' | 'localstorage'

export interface KVStorageConfig {
  /**
   * The name of the database.
   * May appear during storage limit prompts.
   * Useful to use the name of your app here.
   * In localStorage, this is used as a key prefix for all keys stored in localStorage and ipfs-repo.
   * Must be alphanumeric, with underscores.
   */
  name?: string;
  version?: number;
  /**
   * The size of the database in bytes.
   * Used only in WebSQL for now.
   */
  size?: number;
  /**
   * The name of the datastore.
   * In IndexedDB this is the dataStore,
   * in WebSQL this is the name of the key/value table in the database,
   * Must be alphanumeric, with underscores. Any non-alphanumeric characters will be converted to underscores.
   */
  storeName?: string;
  description?: string;
  driverOrder?: DriverNames[];
  /**
   * similar to `name`.
   * Used only in CordovaSQLiteDriver.
   */
  dbKey?: string;
  /**
   * Used only in localforage-driver-ipfs-repo
   * @type string (file path) or ipfs.Repo instance
   * @see options.repo in IPFS Constructor
   */
  ipfsRepo?: string | Repo;
}

export const getDefaultConfig = () => {
  return {
    name: '232c_preference',
    storeName: 'kvstorage',
    dbKey: '232c_preference',
    driverOrder: ['sqlite', 'indexeddb', 'ipfs-repo', 'websql', 'localstorage'],
    ipfsRepo: typeof process !== 'undefined' ? '~/.jsipfs' : 'ipfs',
  }
}

/**
 * Preference (key-value) Storage,
 * work in both Browser, Node.js, and Cordova/Ionic
 *
 * Modified from https://github.com/ionic-team/ionic-storage/blob/master/src/storage.ts
 */
export class KVStorage implements KVStorageInterface {
  private _db: Promise<LocalForage> | LocalForage;
  private _driver: string | null = null;

  readonly backend = 'localforage';

  constructor (config?: KVStorageConfig) {
    this._db = (async () => {
      const _config = Object.assign({}, getDefaultConfig(), config || {})

      const drivers = this._getDrivers(_config.driverOrder)
      const actualConfig = Object.assign({}, _config, {
        driver: drivers,
      })

      await LocalForage.defineDriver(CordovaSQLiteDriver)
      await LocalForage.defineDriver(IPFSRepoDriver)

      const db = LocalForage.createInstance(actualConfig)
      await db.setDriver(drivers)

      this._driver = db.driver()

      this._db = db

      return db
    })()
  }

  async ready () {
    await this._db
  }

  async close () {
    const db = await this._db
    if (typeof db.dropInstance === 'function') {
      await db.dropInstance()
    }
  }

  /**
   * Get the name of the driver being used.
   */
  get driver (): string | null {
    return this._driver
  }

  private _getDrivers (driverOrder: DriverNames[]): string[] {
    return driverOrder.map(driver => {
      switch (driver) {
        case 'sqlite':
          return CordovaSQLiteDriver._driver
        case 'ipfs-repo':
          return IPFSRepoDriver._driver
        case 'indexeddb':
          return LocalForage.INDEXEDDB
        case 'websql':
          return LocalForage.WEBSQL
        case 'localstorage':
          return LocalForage.LOCALSTORAGE
      }
    })
  }

  async has (key: string): Promise<boolean> {
    const db = await this._db
    const v = await db.getItem(key)
    return v !== null
  }

  /**
   * Get the value associated with the given key.
   * @param key the key to identify this value
   * @returns Returns a promise with the value of the given key
   */
  async get (key: string): Promise<VALUE> {
    const db = await this._db
    return db.getItem(key)
  }

  /**
   * Set the value for the given key.
   * @param key the key to identify this value
   * @param value the value for this key
   * @returns Returns a promise that resolves when the key and value are set
   */
  async set<T extends VALUE> (key: string, value: T): Promise<T> {
    const db = await this._db
    return db.setItem(key, value)
  }

  /**
   * Remove any value associated with this key.
   * @param key the key to identify this value
   * @returns Returns a promise that resolves when the value is removed
   */
  async remove (key: string): Promise<any> {
    const db = await this._db
    return db.removeItem(key)
  }

  /**
   * Clear the entire key value store. WARNING: HOT!
   * @returns Returns a promise that resolves when the store is cleared
   */
  async clear (): Promise<void> {
    const db = await this._db
    return db.clear()
  }

  /**
   * @returns Returns a promise that resolves with the number of keys stored.
   */
  async length (): Promise<number> {
    const db = await this._db
    return db.length()
  }

  /**
   * @returns Returns a promise that resolves with the keys in the store.
   */
  async keys (): Promise<string[]> {
    const db = await this._db
    return db.keys()
  }

  /**
   * Iterate through each key,value pair.
   * @param iteratorCallback a callback of the form (value, key, iterationNumber)
   * @returns Returns a promise that resolves when the iteration has finished.
   */
  async forEach (
    iteratorCallback: (value: any, key: string, iterationNumber: Number) => any
  ): Promise<void> {
    const db = await this._db
    return db.iterate(iteratorCallback)
  }
}

export default KVStorage
