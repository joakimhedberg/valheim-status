import { expect, assert } from 'chai'
import LogListener from './LogListener'

const getListenedLog = async(filename: string) => {
  const listener = new LogListener(filename, true)
  let closing = 0
  let handshake = 0
  listener.on('closing_socket', () => closing++)
  listener.on('got_handshake', () => handshake++)
  listener.start()

  return {closing: closing, handshake: handshake}
}

describe('Testing the log listener', function() {
  it('Should verify the number of connections and disconnections', async function() {
    return getListenedLog('./testing/stdout_test.log').then(result => {
      assert.deepEqual(result, {handshake: 84, closing: 78})
    })
  })
})