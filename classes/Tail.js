"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const fs_1 = __importDefault(require("fs"));
const FileWatcher_1 = __importDefault(require("./FileWatcher"));
/**
 * Track a file, listening to changes and emits the data as lines(or raw data is no newline is defined)
 */
class Tail extends events_1.default {
    /**
     * Tail
     * @param filename Filename to tail
     * @param options TailOptions
     */
    constructor(filename, options = { newline: /\r\n|\r|\n/g, trimLines: true }) {
        super();
        this.lines = [];
        this._filename = filename;
        this._options = options;
    }
    /**
     * Start tailing
     * @param catchUp If true, the entire file will be read and parsed before the tailing begins
     */
    tail(catchUp = false) {
        this.untail();
        this.lines = [];
        this.emit('tail');
        if (catchUp) {
            this.emit('lines_start');
            const data = fs_1.default.readFileSync(this._filename).toString('utf-8');
            this._emitData(data, true);
            this.emit('lines_end');
        }
        this._watcher = new FileWatcher_1.default(this._filename);
        this._watcher.on('change', (curr, prev) => {
            this._doWatchFile(curr, prev);
        });
        this._watcher.watch();
    }
    /**
     * Stop tailing
     */
    untail() {
        if (this._watcher) {
            this._watcher.unwatch();
            this._watcher = undefined;
            this.emit('untail');
        }
    }
    /**
     * Recieves the data, handles it and emits it
     * @param data The data to emit
     * @param isCatchup Indicator if this is within the catchup scope, this info is emitted
     */
    _emitData(data, isCatchup) {
        var _a;
        if ((_a = this._options) === null || _a === void 0 ? void 0 : _a.newline) {
            for (let line of data.split(this._options.newline)) {
                if (this._options.trimLines) {
                    line = line.trim();
                    if (!line) {
                        continue;
                    }
                }
                this.lines.push(line);
                this.emit('line', line, isCatchup);
            }
        }
        else {
            if (this._options.trimLines) {
                data = data.trim();
            }
            if (data) {
                this.lines.push(data);
                this.emit('line', data, isCatchup);
            }
        }
    }
    /**
     * Read data from the file, starting at an offset and reading to the end of the file
     * @param filename Filename to read
     * @param offset Starting offset of the read
     * @returns String data
     */
    _readTheData(filename, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                const stream = fs_1.default.createReadStream(filename, { start: offset, autoClose: true, encoding: 'utf-8' });
                stream.on('data', (chunk) => {
                    resolve(chunk.toString('utf-8'));
                });
                stream.read();
            });
        });
    }
    /**
     * Hooked into the file change event of FileWatcher
     * @param curr Current file status
     * @param prev Previous file status
     */
    _doWatchFile(curr, prev) {
        if (curr.size <= prev.size) {
            return;
        }
        const offset = curr.size - (curr.size - prev.size);
        this.emit('lines_start');
        this._readTheData(this._filename, offset).then(data => {
            this._emitData(data);
            this.emit('lines_end', offset);
        });
    }
}
exports.default = Tail;
