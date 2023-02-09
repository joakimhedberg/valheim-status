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
/**
 * Helper class to listen to file changes on the hdd, only emits when the file is growing
 */
class FileWatcher extends events_1.default {
    /**
     * FileWatcher
     * @param filename Filename to track
     * @param interval Interval for tracking
     */
    constructor(filename, interval = 100) {
        super();
        this._is_watching = false;
        this._filename = filename;
        this._interval = interval;
    }
    /**
     * Start watching the file
     */
    watch() {
        if (!fs_1.default.existsSync(this._filename)) {
            throw new Error(`File '${this._filename}' does not exist`);
        }
        this._is_watching = true;
        this._doWatch();
    }
    /**
     * Stop watching the file
     */
    unwatch() {
        this._is_watching = false;
    }
    /**
     * The actual watch functionality
     */
    _doWatch() {
        return __awaiter(this, void 0, void 0, function* () {
            let prev;
            while (this._is_watching) {
                const curr = fs_1.default.statSync(this._filename);
                if (prev !== undefined) {
                    if ((curr.mtime.getTime() !== prev.mtime.getTime()) || (curr.size !== prev.size)) {
                        this.emit('change', curr, prev);
                    }
                }
                prev = curr;
                yield new Promise(resolve => setTimeout(resolve, this._interval));
            }
        });
    }
}
exports.default = FileWatcher;
