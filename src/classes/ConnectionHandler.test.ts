import { expect } from 'chai'
import ConnectionHandler from './ConnectionHandler'
import Player from './Player'


const getUserStatus = async (): Promise<{connected: number, disconnected: number, players: Player[]}> => {
  return new Promise(resolve => {
    const ch = new ConnectionHandler(undefined)
    let connected = 0
    let disconnected = 0
    ch.on('player_connect', () => {
      connected++
    })
    ch.on('player_disconnect', () => disconnected++)

    ch.on('lines_end', () => {
      ch.stop()
      resolve({ connected: connected, disconnected: disconnected, players: ch.playerList })
    })

    ch.start('./testing/stdout_test.log', true)
  })
}


describe('Test the connection handler', () => {  
  before(async function () {
    const status = await getUserStatus()
    this['connected'] = status.connected
    this['disconnected'] = status.disconnected
    this['players'] = status.players
  })
  
  it('Should match the number of connected users', function() {
    expect(this['connected']).to.equal(84)
  })

  it('Should match the number of disconnected users', function() {
    expect(this['disconnected']).to.equal(78)
  })

  it('Should match the players', function () {
    console.log(this['players'])
    expect(this['players'].map((p: Player) => p.player_name)).to.deep.equal(['Greger', 'Uno', 'Tjaldur', 'Björn'])
  })
})