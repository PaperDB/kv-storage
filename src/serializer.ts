
import { VALUE } from './interface'

import * as MsgPack from 'msgpack-lite'

type Value = VALUE | null

/**
 * serialize as msgpack
 */
export const serialize = (value: Value): Uint8Array => {
  return MsgPack.encode(value)
}

/**
 * deserialize from msgpack
 */
export const deserialize = (buffer: Uint8Array): Value => {
  return MsgPack.decode(buffer)
}
