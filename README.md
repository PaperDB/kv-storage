
# @232c/kv-storage

LocalForage based key-value storage for Browser, Node.js, and Cordova/Ionic.

## LocalForage Drivers

* Browser: 
  * IndexedDB
  * [ipfs-repo](src/localforage-driver-ipfs-repo.ts)
  * WebSQL
  * localStorage
* Node.js:
  * [ipfs-repo](src/localforage-driver-ipfs-repo.ts)
* Cordova/Ionic
  * [SQLite](https://github.com/thgreasi/localForage-cordovaSQLiteDriver)
  * IndexedDB
  * [ipfs-repo](src/localforage-driver-ipfs-repo.ts)
  * WebSQL
  * localStorage

## Installation

```
npm install @232c/kv-storage
```

If you would like to use SQLite as a storage engine for Cordova/Ionic, install the SQLite plugin dependency:

```
cordova plugin add cordova-sqlite-storage --save
```

## Usage

Example:

```js
const { KVStorage } = require('@232c/kv-storage')

const storage = new KVStorage({
  ipfsRepo: './test-repo',  // path to the ipfs-repo being used, only required when using ipfs-repo localForage driver
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

[see dist/index.d.ts](https://cdn.jsdelivr.net/npm/@232c/kv-storage/dist/index.d.ts)

## License

[MIT](./LICENSE)
