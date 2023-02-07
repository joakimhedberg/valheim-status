import EventEmitter from 'events'
import fs from 'fs'

declare interface FileWatcher {
  /**
   * Start listening to file change events
   * @param event 
   * @param listener 
   */
  on(event: 'change', listener: (curr: fs.Stats, prev: fs.Stats) => void): this
  /**
   * Stop listening to file change events
   * @param event 
   * @param listener 
   */
  off(event: 'change', listener: (curr: fs.Stats, prev: fs.Stats) => void): this
}

/**
 * Helper class to listen to file changes on the hdd, only emits when the file is growing
 */
class FileWatcher extends EventEmitter {
  private _filename: string
  private _interval: number
  /**
   * FileWatcher
   * @param filename Filename to track
   * @param interval Interval for tracking
   */
  constructor(filename: string, interval: number = 100) {
    super()
    this._filename = filename
    this._interval = interval
  }

  private _is_watching = false
  /**
   * Start watching the file
   */
  public watch() {
    if (!fs.existsSync(this._filename)) {
      throw new Error(`File '${this._filename}' does not exist`);
    }
    this._is_watching = true
    this._doWatch()
  }

  /**
   * Stop watching the file
   */
  public unwatch() {
    this._is_watching = false
  }

  /**
   * The actual watch functionality
   */
  private async _doWatch() {
    let prev: fs.Stats | undefined
    while (this._is_watching) {
      const curr = fs.statSync(this._filename)
      if (prev !== undefined) {
        if ((curr.mtime.getTime() !== prev.mtime.getTime()) || (curr.size !== prev.size)) {
          this.emit('change', curr, prev)
        }
      }
      prev = curr
      await new Promise(resolve => setTimeout(resolve, this._interval))
    }
  }

}

export default FileWatcher