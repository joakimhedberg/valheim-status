"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const fs_1 = __importDefault(require("fs"));
const Tail_1 = __importDefault(require("./Tail"));
/**
 * Track the Valheim log file and listen for handshakes and disconnections
 */
class LogListener extends events_1.default {
    /**
     * LogListener
     * @param filename Filename to the valheim stdout
     * @param catchUp Read the entire stdout before tailing it
     */
    constructor(filename, catchUp) {
        super();
        if (catchUp) {
            fs_1.default.readFileSync(filename, { encoding: 'utf-8' }).split('\n').forEach(line => this._processLine(line.trim()));
        }
        this._filename = filename;
    }
    /**
     * Try to parse the timestamp on the event rows
     * @param line Line to parse
     * @returns Date on success, failure otherwise
     */
    _parseTimestamp(line) {
        line = line.trim();
        if (!/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}\s?[0-9]{2}:[0-9]{2}:[0-9]{2}/gm.test(line)) {
            return undefined;
        }
        return new Date(line.substring(0, 19));
    }
    /**
     * Start tracking the stdout file
     */
    start() {
        this.stop();
        this._tail = new Tail_1.default(this._filename);
        this._tail.on('line', (line, isCatchup) => this._processLine(line, isCatchup));
        this._tail.on('lines_start', () => this.emit('lines_start'));
        this._tail.on('lines_end', () => this.emit('lines_end'));
        this._tail.tail(true);
    }
    /**
     * Process a line from the input data
     * @param line Line to process
     * @param isCatchup Indicator if this is the catchup event
     * @returns
     */
    _processLine(line, isCatchup) {
        const date = this._parseTimestamp(line);
        const handshake_result = /Got\s?handshake\s?from\s?client\s?([^\n]+)$/gm.exec(line);
        if (handshake_result && handshake_result.length > 1) {
            const steamId = handshake_result[1].trim();
            if (steamId) {
                this.emit('got_handshake', date, steamId, isCatchup);
                return;
            }
        }
        const socket_result = /Closing\s?socket\s?([^\n]+)$/gm.exec(line);
        if (socket_result && socket_result.length > 1) {
            const steamId = socket_result[1].trim();
            if (steamId) {
                this.emit('closing_socket', date, steamId, isCatchup);
            }
        }
    }
    /**
     * Stop tailing
     */
    stop() {
        if (this._tail) {
            this._tail.untail();
            this._tail.removeAllListeners();
            this._tail = undefined;
        }
    }
}
exports.default = LogListener;
