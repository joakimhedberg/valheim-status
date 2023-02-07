import { EventEmitter } from 'events'
import Player from './Player'
import { JSDOM } from 'jsdom'
import LogListener from './LogListener'
import fs from 'fs'
declare interface ConnectionHandler {
  /**
   * Triggers when a player disconnects from the server
   * @param event 
   * @param listener 
   */
  on(event: 'player_disconnect', listener: (player: Player, isCatchup?: boolean) => void): this
  /**
   * Stop listening to the player disconnect event
   * @param event 
   * @param listener 
   */
  off(event: 'player_disconnect', listener: (player: Player, isCatchup?: boolean) => void): this
  /**
   * Triggers when a player connects to the server
   * @param event 
   * @param listener 
   */
  on(event: 'player_connect', listener: (player: Player, isCatchup?: boolean) => void): this
  /**
   * Stop listening to the player connect event
   * @param event 
   * @param listener 
   */
  on(event: 'player_connect', listener: (player: Player, isCatchup?: boolean) => void): this
  /**
   * Listen to the lines_start event, emitted before data processing starts
   * @param event 
   * @param listener 
   */
  on(event: 'lines_start', listener: () => void): this
  /**
   * Stop listening to the lines_start event
   * @param event 
   * @param listener 
   */
  off(event: 'lines_start', listener: () => void): this
  /**
   * Listen to the lines_end event, emitted after data has been processed and emitted
   * @param event 
   * @param listener 
   */
  on(event: 'lines_end', listener: () => void): this
  /**
   * Stop listening to the lines_end event
   * @param event 
   * @param listener 
   */
  off(event: 'lines_end', listener: () => void): this
}

/**
 * Handles the connections parsed from the stdout file
 */
class ConnectionHandler extends EventEmitter {
  private _steamApiKey: string | undefined
  /**
   * ConnectionHandler constructor
   * @param steamKey Steam API key, for optional lookup of player names
   */
  constructor(steamKey: string | undefined) {
    super()
    this._steamApiKey = steamKey
  }
  private _listener: LogListener | undefined
  private _players: Map<string, Player> = new Map()
  private _log: [Date | undefined, string][] = []

  public get log() { return this._log }

  /**
   * Start tailin the stdout file and parse the results
   * @param filename Stdout filename
   * @param catchUp If true the entire contents of the stdout file will be parsed before tail start
   */
  public start(filename: string, catchUp: boolean) {
    this.stop()
    if (!fs.existsSync(filename)) {
      throw new Error(`File ${filename} does not exists`)
    }
    this._listener = new LogListener(filename, catchUp)
    this._listener.on('got_handshake', async (date, steamId, isCatchup) => await this._handleGotHandshake(date, steamId, isCatchup))
    this._listener.on('closing_socket', async (date, steamId, isCatchup) => await this._handleClosingSocket(date, steamId, isCatchup))
    this._listener.on('lines_start', () => this.emit('lines_start'))
    this._listener.on('lines_end', () => this.emit('lines_end'))
    this._listener.start()
  }

  /**
   * Handle the got handshake event
   * @param date Date, if parsed from the stdout file
   * @param steamId Player steam id as parsed from the file
   * @param isCatchup Identifies if this is within the catchup event, passed on through emitters
   */
  private async _handleGotHandshake(date: Date | undefined, steamId: string, isCatchup?: boolean) {
    let player = this._players.get(steamId)
    if (!player) {
      player = new Player(steamId)
      this._players.set(steamId, player)    
    }

    this.emit('player_connect', player, isCatchup)
    await player.loadName(this._steamApiKey)
    this._log.push([date, `User ${player?.player_name} with steam id ${player?.playerId} connected`])
  }

  /**
   * Handle the closing socket event
   * @param date Date, if successfully parsed from the stdout file
   * @param steamId Player steam id
   * @param isCatchup Identifies if this is within the catchup event, passed on through emitters
   */
  private async _handleClosingSocket(date: Date | undefined, steamId: string, isCatchup?: boolean) {
    if (this._players.has(steamId)) {
      const player = this._players.get(steamId)
      if (this._players.delete(steamId)) {
        this.emit('player_disconnect', player, isCatchup)
        this._log.push([date, `User ${player?.player_name} with steam id ${player?.playerId} disconnected`])
      }
    }
  }

  /**
   * Stop listening
   */
  public stop() {
    if (this._listener) {
      this._listener.stop()
      this._listener.removeAllListeners()
      this._listener = undefined
    }
  }

  /**
   * Get a list of players on the server
   */
  public get playerList() {
    return Array.from(this._players.values())
  }

  /**
   * 
   * @returns The log items as HTML
   */
  public getLog(): string {
    const dom = new JSDOM()
    const document = dom.window.document
    const main_div = document.createElement('div')
    document.body.appendChild(main_div)

    const style = document.createElement('style')
    document.head.appendChild(style)
    style.innerHTML = `
      .item_div {
        border: solid 1px lightgray;
      }

      .date_span {
        width: 500px;
        margin-right: 10px;
      }
    `

    for (const item of this._log) {
      const item_div = document.createElement('div')
      item_div.className = 'item_div'
      const date_span = document.createElement('span')
      date_span.className = 'date_span'
      const text_span = document.createElement('span')
      text_span.className = 'text_span'
      item_div.appendChild(date_span)
      item_div.appendChild(text_span)
      main_div.appendChild(item_div)

      date_span.appendChild(document.createTextNode((item[0] !== undefined? item[0].toLocaleString(): '')))
      text_span.appendChild(document.createTextNode(item[1]))
    }

    return dom.serialize()
  }

  /**
   * 
   * @returns The players as a HTML list
   */
  public getHtml(): string {
    const dom = new JSDOM()
    const document = dom.window.document
    const style = document.createElement('style')
    const meta = document.createElement('meta')
    meta.httpEquiv = 'refresh'
    meta.content = '10'

    const title_div = document.createElement('div')
    const list_div = document.createElement('div')
    
    title_div.className = 'title_div'
    list_div.className = 'list_div'

    document.body.appendChild(title_div)
    document.body.appendChild(list_div)

    title_div.appendChild(document.createTextNode('Valheim players'))
    style.innerHTML = `
    .title_div {
      font-size: 18pt;
      font-weight: bold;
      border-radius: 6px;
      border: solid 2px lightgray;
      padding: 4px;
      background-color: #fee7e7;
    }

    .list_div {
      margin: 3px;
      padding: 10px;
      border-radius: 6px;
      border: solid 2px darkgray;
    }

    .item {
      margin: 2px;
      padding: 4px;
      font-size: 14pt;
      background: #f0f7ff;
      border: solid 2px lightblue;
      border-radius: 3px;
    }
    `
    document.head.appendChild(meta)
    document.head.appendChild(style)
    
    for (const player of this._players.values()) {
      const item_div = dom.window.document.createElement('div')
      item_div.appendChild(dom.window.document.createTextNode(player.player_name ?? 'N/A'))
      item_div.setAttribute('hidden_data', player.playerId)
      item_div.className = 'item'
      list_div.appendChild(item_div)
    }
   
    return dom.serialize()
  }
}

export default ConnectionHandler