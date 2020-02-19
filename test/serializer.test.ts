
import { serialize, deserialize } from '../src/serializer'

describe('kv-storage: msgpack serializer', () => {
  it('return an instance of Buffer/Uint8Array', () => {
    const buf = serialize('test')
    expect(buf instanceof Uint8Array).toBe(true)
    expect(buf instanceof Buffer).toBe(true)
  })

  describe('serialize & deserialize', () => {
    it('unicode string', () => {
      const buf = serialize('你好')
      expect(deserialize(buf)).toBe('你好')
    })

    it('null', () => {
      const buf = serialize(null)
      expect(deserialize(buf)).toBe(null)
    })

    it('NaN', () => {
      const buf = serialize(NaN)
      expect(deserialize(buf)).toBe(NaN)
    })

    it('+Infinity', () => {
      const buf = serialize(Infinity)
      expect(deserialize(buf)).toBe(Infinity)
    })

    it('-Infinity', () => {
      const buf = serialize(-Infinity)
      expect(deserialize(buf)).toBe(-Infinity)
    })

    it('ArrayBuffer', () => {
      const input = new Uint8Array([123, 200, 78]).buffer
      const buf = serialize(input)
      expect(deserialize(buf)).toStrictEqual(input)
    })

    it('Uint8Array', () => {
      const input = new Uint8Array([123, 200, 78])
      const buf = serialize(input)
      expect(deserialize(buf)).toStrictEqual(input)
    })

    it('complex array & object', () => {
      const input = [123, null, 'test', new Float64Array([123]), [{ a: new Uint8Array([1, 0, 1]), b: { c: 1 } }, 2]]
      // @ts-ignore
      const buf = serialize(input)
      expect(deserialize(buf)).toStrictEqual(input)
    })

    it('input cannot be a cyclic object value', () => {
      const input = { a: 1 }
      input['b'] = input
      expect(() => serialize(input)).toThrowError()
    })

    it('input cannot be undefined', () => {
      // @ts-ignore
      const buf = serialize(undefined)
      expect(deserialize(buf)).not.toBe(undefined)
      expect(deserialize(buf)).toBe(null)
    })
  })
})
