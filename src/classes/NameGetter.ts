import axios from 'axios'
import KnownNames from '../data/KnownNames'
import SteamResponse from '../interfaces/SteamResponse'

/**
 * Helper function to fetch the names, indexed by Steam ID
 */
export default class NameGetter {
  /**
   * Cache all lookups, that way we don't need to ask steam each time. This will be cleared on server restart.
   */
  private static _nameCache: Map<string, string> = new Map()

  /**
   * Get player name from steam id lookup
   * @param steamApi Steam API key
   * @param playerId Player Steam id
   * @returns Name if found, undefined otherwise
   */
  public static async getName(steamApi: string | undefined, playerId: string): Promise<string | undefined> {
    // First test, check the cache and return if found
    const firstTry = NameGetter._nameCache.get(playerId)
    if (firstTry) {
      return firstTry
    }

    // Second test, check the local known names json file
    const secondTry = KnownNames[playerId]
    if (secondTry) {
      NameGetter._nameCache.set(playerId, secondTry)
      return secondTry
    }

    // Third test, ask Steam. Requires a valid API key.
    if (steamApi) {
      const thirdTry = await NameGetter.getSteamAlias(steamApi, playerId)
      if (thirdTry) {
        NameGetter._nameCache.set(playerId, thirdTry)
        return thirdTry
      }
    }

    return undefined
  }

  private static _lastSteamCall = new Date().getTime()
  private static async getSteamAlias(apiKey: string, steamId: string): Promise<string | undefined> {
    /**
     * Let's make sure we do not hammer the steam api
     */
    const currentTime = new Date().getTime()
    const diff_ms = currentTime - NameGetter._lastSteamCall
    if (diff_ms < 1000) {
      await new Promise(resolve => setTimeout(resolve, diff_ms))
    }

    NameGetter._lastSteamCall = currentTime

    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&format=json&steamids=${steamId}`
    try {
      const result = await axios.get(url)
      if (result.status === 200) {
        const data = result.data as SteamResponse
        if (data.response && data.response.players && data.response.players.length > 0) {
          return data.response.players[0].personaname
        }
      } else {
        return undefined
      }
    } catch {
      return undefined
    }
  }
}