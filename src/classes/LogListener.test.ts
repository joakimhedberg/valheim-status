import { expect } from 'chai'
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

describe('Testing the log listener', () => {
  it('Should verity the number of connections and disconnections', async() => {
    const result = await getListenedLog('./testing/stdout_test.log')
    return expect(result).to.deep.equal({ handshake: 84, closing: 79 })
  })
})