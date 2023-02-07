import EventEmitter from 'events'
import fs from 'fs'
import FileWatcher from './FileWatcher'

/**
 * Tail options
 */
interface TailOptions {
  /**
   * New line character or regexp, if undefined there will be no splitting of the data
   * Defaults to /\r\n|\r|\n/g
   */
  newline?: string | RegExp
  /**
   * Trim the lines, removing unwanted whitespace characters
   * Empty lines will not be emitted
   * Defaults to true
   */
  trimLines?: boolean
}

declare interface Tail {
  /**
   * Listen to the line event, emitted when a line or data has been caught and parsed
   * @param event 
   * @param listener 
   */
  on(event: 'line', listener: (line: string, isCatchupEvent?: boolean) => void): this
  /**
   * Stop listening to the line event
   * @param event 
   * @param listener 
   */
  off(event: 'line', listener: (line: string, isCatchupEvent?: boolean) => void): this
  /**
   * Listen to the tail event, emitted when the tailing starts
   * @param event 
   * @param listener 
   */
  on(event: 'tail', listener: () => void): this
  /**
   * Stop listening to the tail event
   * @param event 
   * @param listener 
   */
  off(event: 'tail', listener: () => void): this
  /**
   * Listen to the untail event, emitted when the tailing stops(ie this.untail())
   * @param event 
   * @param listener 
   */
  on(event: 'untail', listener: () => void): this
  /**
   * Stop listening to the untail event
   * @param event 
   * @param listener 
   */
  off(event: 'untail', listener: () => void): this
  /**
   * Listen to the lines_start event, emitted when data is prepared, before the lines are emitted
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
   * Listen to the lines_end event, emitted after the lines are emitted
   * @param event 
   * @param listener 
   */
  on(event: 'lines_end', listener: (offset: number) => void): this
  /**
   * Stop listening to the lines_end event
   * @param event 
   * @param listener 
   */
  off(event: 'lines_end', listener: (offset: number) => void): this
}

/**
 * Track a file, listening to changes and emits the data as lines(or raw data is no newline is defined)
 */
class Tail extends EventEmitter {
  private _filename: string
  private _options: TailOptions

  /**
   * Tail
   * @param filename Filename to tail
   * @param options TailOptions
   */
  constructor(filename: string, options: TailOptions = { newline: /\r\n|\r|\n/g, trimLines: true }) {
    super()
    this._filename = filename
    this._options = options
  }
  
  public lines: string[] = []
  private _watcher: FileWatcher | undefined

  /**
   * Start tailing
   * @param catchUp If true, the entire file will be read and parsed before the tailing begins
   */
  public tail(catchUp: boolean = false) {
    this.untail()
    
    this.lines = []
    this.emit('tail')
    if (catchUp) {
      this.emit('lines_start')
      const data = fs.readFileSync(this._filename).toString('utf-8')
      this._emitData(data, true)
      this.emit('lines_end')
    }

    this._watcher = new FileWatcher(this._filename)
    this._watcher.on('change', (curr, prev) => {
      this._doWatchFile(curr, prev)
    })
    this._watcher.watch()
  }

  /**
   * Stop tailing
   */
  public untail() {
    if (this._watcher) {
      this._watcher.unwatch()
      this._watcher = undefined
      this.emit('untail')
    }
  }

  /**
   * Recieves the data, handles it and emits it
   * @param data The data to emit
   * @param isCatchup Indicator if this is within the catchup scope, this info is emitted
   */
  private _emitData(data: string, isCatchup?: boolean) {
    if (this._options?.newline) {
      for (let line of data.split(this._options.newline)) {
        if (this._options.trimLines) {
          line = line.trim()
          if (!line) {
            continue
          }
        }
        this.lines.push(line)
        this.emit('line', line, isCatchup)
      }
    }
    else {
      if (this._options.trimLines) {
        data = data.trim()
      }

      if (data) {
        this.lines.push(data)
        this.emit('line', data, isCatchup)
      }
    }
  }

  /**
   * Read data from the file, starting at an offset and reading to the end of the file
   * @param filename Filename to read
   * @param offset Starting offset of the read
   * @returns String data
   */
  private async _readTheData(filename: string, offset: number): Promise<string> {
    return new Promise(resolve => {
      const stream = fs.createReadStream(filename, { start: offset, autoClose: true, encoding: 'utf-8' })
      stream.on('data', (chunk) => {
        resolve(chunk.toString('utf-8'))
      })
      stream.read()
    })
  }

  /**
   * Hooked into the file change event of FileWatcher
   * @param curr Current file status
   * @param prev Previous file status
   */
  private _doWatchFile(curr: fs.Stats, prev: fs.Stats) {
    if (curr.size <= prev.size) {
      return
    }
   
    const offset = curr.size - (curr.size - prev.size)
    this.emit('lines_start')
    this._readTheData(this._filename, offset).then(data => {
      this._emitData(data)
      this.emit('lines_end', offset)
    })
  }
}

export default Tail