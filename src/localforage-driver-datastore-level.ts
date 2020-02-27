
import LocalForage, { defineDriver, createInstance } from 'localforage'
import LevelDatastore from 'datastore-level'
import { Key, Datastore } from 'interface-datastore'
import { VALUE } from './interface'
import { KVStorageConfig } from './index'
import { serialize, deserialize } from './serializer'

type Driver = typeof defineDriver extends (driver: infer A) => any ? A : never
type LocalForageOptions = typeof createInstance extends (options: infer A) => any ? A : never

interface DriverThis extends LocalForage {
  /**
   * options passed to the LocalForage.createInstance method
   */
  readonly _config: LocalForageOptions;

  /**
   * the return value of _initStorage
   */
  readonly _ready: Datastore;

  /**
   * interface-datastore
   */
  _db: Datastore;

  /**
   * '/' + _config.name + '/'
   */
  _keyPrefix: string;

  /**
   * wrap a key string into the interface-datastore.Key class
   */
  _toKeyClass: (key: string) => Key;

  /**
   * get the key string from an instance of the interface-datastore.Key class
   * @returns key string
   */
  _fromKeyClass: (k: Key) => string;
}

export const LevelDatastoreDriver: Driver = {
  _driver: 'level-datastore',

  _initStorage (this: DriverThis, options: KVStorageConfig) {
    const db = new LevelDatastore(options.path || './kvdb')
    this._db = db

    const keyPrefix = '/' + this._config.name + '/'
    this._keyPrefix = keyPrefix

    this._toKeyClass = (key: string): Key => {
      return new Key(`${keyPrefix}${key}`)
    }
    this._fromKeyClass = (k: Key): string => {
      const str = k.toString()
      const m = str.match(`^${keyPrefix}(.*)$`)
      return m ? m[1] : '' // '' is the placeholder for TS type checking
    }

    return db
  },

  async dropInstance (this: DriverThis) {
    await this._db.close()
  },

  // @ts-ignore
  async setItem (this: DriverThis, key: string, value: VALUE) {
    const buf = serialize(value) as Buffer
    const k = this._toKeyClass(key)
    await this._db.put(k, buf)
    return value
  },

  // @ts-ignore
  async getItem (this: DriverThis, key) {
    const k = this._toKeyClass(key)

    let buf: Buffer
    try {
      buf = await this._db.get(k)
    } catch (_) {
      //  NotFoundError: Key not found in database
      return null
    }

    return deserialize(buf)
  },

  // @ts-ignore
  async removeItem (this: DriverThis, key) {
    const k = this._toKeyClass(key)
    await this._db.delete(k)
  },

  async clear (this: DriverThis) {
    const q = this._db.query({
      prefix: this._keyPrefix,
      keysOnly: true,
    })

    const b = this._db.batch()
    for await (const result of q) {
      b.delete(result.key)
    }
    await b.commit()
  },

  // @ts-ignore
  async iterate (this: DriverThis, iteratorCallback) {
    const q = this._db.query({
      prefix: this._keyPrefix,
    })

    let i = 0
    for await (const result of q) {
      const value = deserialize(result.value)
      const key = this._fromKeyClass(result.key)
      // @ts-ignore
      iteratorCallback(value, key, i)
      i++
    }
  },

  /**
   * @deprecated
   */
  async key (this: DriverThis, keyIndex: number) {
    const q = this._db.query({
      prefix: this._keyPrefix,
      limit: 1,
      offset: keyIndex,
      keysOnly: true,
    })

    for await (const result of q) {
      const key = this._fromKeyClass(result.key)
      return key
    }

    // placeholder for TS type checking
    return ''
  },

  async keys (this: DriverThis) {
    const q = this._db.query({
      prefix: this._keyPrefix,
      keysOnly: true,
    })

    const l: string[] = []
    for await (const result of q) {
      l.push(this._fromKeyClass(result.key))
    }

    return l
  },

  // @ts-ignore
  async length (this: DriverThis) {
    const l = await this.keys()
    return l.length
  },
}

export default LevelDatastoreDriver
