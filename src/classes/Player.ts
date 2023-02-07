import NameGetter from './NameGetter'

/**
 * Convenience class for player info
 */
export default class Player {
  public player_name: string | undefined
  public readonly playerId: string

  /**
   * Create a new player
   * @param playerId Steam user key
   */
  constructor(playerId: string) {
    this.playerId = playerId
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
  }
}