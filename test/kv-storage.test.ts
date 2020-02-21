import KVStorage from '../src/'
import path from 'path'
import { rmrf } from './utils'

describe('kv-storage: using localforage-driver-ipfs-repo', () => {
  const repoPath = path.join(__dirname, '.testrepo')

  let storage: KVStorage

  beforeAll(async () => {
    storage = new KVStorage({
      // driverOrder: ['ipfs-repo'],
      ipfsRepo: repoPath,
    })
    await storage.ready()
  })

  const isEmptyStorage = () => {
    it('storage.keys() returns an empty array', async () => {
      const keys = await storage.keys()
      expect(Array.isArray(keys)).toBe(true)
      expect(keys.length).toBe(0)
    })

    it('localforage.key(number) returns an empty string', async () => {
      // @ts-ignore
      const db = await storage._db

      const key0 = await db.key(0)
      expect(key0).toBe('')

      const key1 = await db.key(1)
      expect(key1).toBe('')
    })

    it('storage.length() returns 0', async () => {
      const l = await storage.length()
      expect(l).toBe(0)
    })

    it('storage.forEach() has nothing to iterate through', async () => {
      let iteratorCb = jest.fn()
      await storage.forEach(iteratorCb)
      expect(iteratorCb).not.toHaveBeenCalled()
    })
  }

  it('Using ipfs-repo driver', async () => {
    expect(storage.driver).toBe('ipfs-repo')
  })

  describe('When there is no key/value', isEmptyStorage)

  describe('Set a complex key-value pair', () => {
    const key = 'testkey'
    const value = [123, null, 'test', new Float64Array([123]), [{ a: new Uint8Array([1, 0, 1]), b: { c: 1 } }, 2]]

    const keyNotExit = async () => {
      expect(await storage.has(key)).toBe(false)
      expect(await storage.get(key)).toBe(null)
    }

    it('the key does not exist before adding', keyNotExit)

    it('storage.set has the correct return value', async () => {
      // @ts-ignore
      const v = await storage.set(key, value)
      expect(v).toStrictEqual(value)
    })

    it('storage.get works correctly', async () => {
      const v = await storage.get(key)
      expect(v).toStrictEqual(value)
    })

    it('remove this key-value pair', async () => {
      await storage.remove(key)
      await keyNotExit()
    })
  })

  describe('Add more data', () => {
    const data = [['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]

    it('Add 5 key-value pairs', async () => {
      for (const [key, value] of data) {
        await storage.set(key as string, value)
      }
    })

    it('storage has the correct length', async () => {
      const l = await storage.length()
      expect(l).toBe(5)
    })

    it('returns all keys', async () => {
      const keys = data.map(p => p[0]) as string[]
      expect(await storage.keys()).toStrictEqual(keys)
    })

    it('storage.forEach() works correctly', async () => {
      let iteratorCb = jest.fn()

      await storage.forEach(iteratorCb)

      expect(iteratorCb).toBeCalledTimes(5)

      for (let i = 0; i < data.length; i++) {
        const [key, value] = data[i]
        expect(iteratorCb).toHaveBeenNthCalledWith(i + 1, value, key, i)
      }
    })

    it('localforage.key(number) works correctly', async () => {
      // @ts-ignore
      const db = await storage._db

      for (let i = 0; i < data.length; i++) {
        const [key] = data[i]
        expect(await db.key(i)).toBe(key)
      }
    })
  })

  describe('When the storage is cleared', () => {
    beforeAll(async () => {
      await storage.clear()
    })
    isEmptyStorage()
  })

  it.todo('when the constructor receives an invalid repo path')

  it.todo('reopen the ipfs-repo (persistence)')

  afterAll(async () => {
    await storage.close()
    await rmrf(repoPath)
  })
})
