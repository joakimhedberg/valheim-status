import NameGetter from './NameGetter'

/**
 * Convenience class for player info
 */
export default class Player {
  public player_name: string | undefined
  public readonly playerId: string
  public isConnected: boolean = true
  public stateLog: {connected: boolean, date: Date}[] = []
  /**
   * Create a new player
   * @param playerId Steam user key
   */
  constructor(playerId: string) {
    this.playerId = playerId
  }

  public getStats() {
    let connected: {connected: boolean, date: Date} | undefined
    const pairs: { start: Date, end: Date, duration: number }[] = []
    for (const item of this.stateLog.sort((a, b) => a.date.getTime() - b.date.getTime())) {
      if (item.connected) {
        connected = item
      }

      if (!item.connected && connected) {
        pairs.push({start: connected.date, end: item.date, duration: item.date.getTime() - connected.date.getTime()})
        connected = undefined
      }
    }
    return pairs
  }

  public getTotalDuration() {
    return this.getStats().reduce((partial, a) => partial + a.duration, 0)
  }

  public setConnected(connected: boolean, date: Date | undefined) {
    this.isConnected = connected
    if (date) {
      this.stateLog.push({date: date, connected: connected})
    }
  }

  /**
   * Load the player name from the NameGetter.
   * If an api key is supplied there will be a try to get the user name from Steam.
   * @param _steamApiKey Steam API key
   */
  public async loadName(_steamApiKey: string | undefined) {
    if (!this.player_name) {
      this.player_name = await NameGetter.getName(_steamApiKey, this.playerId)
    }

    return this.player_name !== undefined
  }
}