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
const NameGetter_1 = __importDefault(require("./NameGetter"));
/**
 * Convenience class for player info
 */
class Player {
    /**
     * Create a new player
     * @param playerId Steam user key
     */
    constructor(playerId) {
        this.isConnected = true;
        this.stateLog = [];
        this.playerId = playerId;
    }
    getStats() {
        let connected;
        const pairs = [];
        for (const item of this.stateLog.sort((a, b) => a.date.getTime() - b.date.getTime())) {
            if (item.connected) {
                connected = item;
            }
            if (!item.connected && connected) {
                pairs.push({ start: connected.date, end: item.date, duration: item.date.getTime() - connected.date.getTime() });
                connected = undefined;
            }
        }
        return pairs;
    }
    getTotalDuration() {
        return this.getStats().reduce((partial, a) => partial + a.duration, 0);
    }
    setConnected(connected, date) {
        this.isConnected = connected;
        if (date) {
            this.stateLog.push({ date: date, connected: connected });
        }
    }
    /**
     * Load the player name from the NameGetter.
     * If an api key is supplied there will be a try to get the user name from Steam.
     * @param _steamApiKey Steam API key
     */
    loadName(_steamApiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.player_name) {
                this.player_name = yield NameGetter_1.default.getName(_steamApiKey, this.playerId);
            }
            return this.player_name !== undefined;
        });
    }
}
exports.default = Player;
