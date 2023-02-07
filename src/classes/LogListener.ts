import EventEmitter from 'events'
import fs from 'fs'
import Tail from './Tail'


declare interface LogListener {
  /**
   * Listen to the handshake rows
   * @param event 
   * @param listener 
   */
  on(event: 'got_handshake', listener: (date: Date | undefined, steamId: string, isCatchup?: boolean) => void): this
  /**
   * Stop listening to the handshake rows
   * @param event 
   * @param listener 
   */
  off(event: 'got_handshake', listener: (date: Date | undefined, steamId: string, isCatchup?: boolean) => void): this
  /**
   * Listen to the closing socket rows
   * @param event 
   * @param listener 
   */
  on(event: 'closing_socket', listener: (date: Date | undefined, steamId: string, isCatchup?: boolean) => void): this
  /**
   * Stop listening to the closing socket rows
   * @param event 
   * @param listener 
   */
  on(event: 'closing_socket', listener: (date: Date | undefined, steamId: string, isCatchup?: boolean) => void): this
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
 * Track the Valheim log file and listen for handshakes and disconnections
 */
class LogListener extends EventEmitter {
  private _filename: string
  /**
   * LogListener
   * @param filename Filename to the valheim stdout
   * @param catchUp Read the entire stdout before tailing it
   */
  constructor(filename: string, catchUp: boolean) {
    super()
    if (catchUp) {
      fs.readFileSync(filename, { encoding: 'utf-8' }).split('\n').forEach(line => this._processLine(line.trim()))
    }
    this._filename = filename
    
  }

  /**
   * Try to parse the timestamp on the event rows
   * @param line Line to parse
   * @returns Date on success, failure otherwise
   */
  private _parseTimestamp(line: string): Date | undefined {
    line = line.trim()
    if (!/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}\s?[0-9]{2}:[0-9]{2}:[0-9]{2}/gm.test(line)) {
      return undefined
    }
    
    return new Date(line.substring(0, 19))
  }

  private _tail: Tail | undefined
  /**
   * Start tracking the stdout file
   */
  public start() {
    this.stop()
    this._tail = new Tail(this._filename)
    this._tail.on('line', (line, isCatchup) => this._processLine(line, isCatchup))
    this._tail.on('lines_start', () => this.emit('lines_start'))
    this._tail.on('lines_end', () => this.emit('lines_end'))
    this._tail.tail(true)
  }

  /**
   * Process a line from the input data
   * @param line Line to process
   * @param isCatchup Indicator if this is the catchup event
   * @returns 
   */
  private _processLine(line: string, isCatchup?: boolean) {
    const date = this._parseTimestamp(line)
    const handshake_result = /Got\s?handshake\s?from\s?client\s?([^\n]+)$/gm.exec(line)
    if (handshake_result && handshake_result.length > 1) {
      const steamId = handshake_result[1].trim()
      if (steamId) {
        this.emit('got_handshake', date, steamId, isCatchup)
        return
      }
    }

    const socket_result = /Closing\s?socket\s?([^\n]+)$/gm.exec(line)
    if (socket_result && socket_result.length > 1) {
      const steamId = socket_result[1].trim()
      if (steamId) {
        this.emit('closing_socket', date, steamId, isCatchup)
      }
    }
  }

  /**
   * Stop tailing
   */
  public stop() {
    if (this._tail) {
      this._tail.untail()
      this._tail.removeAllListeners()
      this._tail = undefined
    }
  }
}

export default LogListener