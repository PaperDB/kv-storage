
# @paper-db/kv-storage

LocalForage based key-value storage for Browser, Node.js, and Cordova/Ionic.

## LocalForage Drivers

* Browser: 
  * IndexedDB
  * [datastore-level](src/localforage-driver-datastore-level.ts)
  * WebSQL
  * localStorage
* Node.js:
  * [datastore-level](src/localforage-driver-datastore-level.ts)
* Cordova/Ionic
  * [SQLite](https://github.com/thgreasi/localForage-cordovaSQLiteDriver)
  * IndexedDB
  * [datastore-level](src/localforage-driver-datastore-level.ts)
  * WebSQL
  * localStorage

## Installation

```
npm install @paper-db/kv-storage
```

If you would like to use SQLite as a storage engine for Cordova/Ionic, install the SQLite plugin dependency:

```
cordova plugin add cordova-sqlite-storage --save
```

## Usage

Example:

```js
const { KVStorage } = require('@paper-db/kv-storage')

const storage = new KVStorage({
  path: './test-db',  // path to the level-datastore being used, only required when using datastore-level localForage driver
})

await storage.ready()

await storage.set('test', 123)

console.log(await storage.has('test'))  // true
console.log(await storage.get('test'))  // 123

console.log(await storage.length())  // 1
console.log(await storage.keys())  // ['test']

storage.forEach((value, key, i) => {
  console.log(value, key, i)  // 123 'test' 0
})

await storage.remove('test')
```

## API

[see dist/index.d.ts](https://cdn.jsdelivr.net/npm/@paper-db/kv-storage/dist/index.d.ts)

## License

[MIT](./LICENSE)
