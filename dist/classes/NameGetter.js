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
const axios_1 = __importDefault(require("axios"));
const KnownNames_1 = __importDefault(require("../data/KnownNames"));
/**
 * Helper function to fetch the names, indexed by Steam ID
 */
class NameGetter {
    /**
     * Get player name from steam id lookup
     * @param steamApi Steam API key
     * @param playerId Player Steam id
     * @returns Name if found, undefined otherwise
     */
    static getName(steamApi, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // First test, check the cache and return if found
            const firstTry = NameGetter._nameCache.get(playerId);
            if (firstTry) {
                return firstTry;
            }
            // Second test, check the local known names json file
            const secondTry = KnownNames_1.default[playerId];
            if (secondTry) {
                NameGetter._nameCache.set(playerId, secondTry);
                return secondTry;
            }
            // Third test, ask Steam. Requires a valid API key.
            if (steamApi) {
                const thirdTry = yield NameGetter.getSteamAlias(steamApi, playerId);
                if (thirdTry) {
                    NameGetter._nameCache.set(playerId, thirdTry);
                    return thirdTry;
                }
            }
            return undefined;
        });
    }
    static getSteamAlias(apiKey, steamId) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Let's make sure we do not hammer the steam api
             */
            const currentTime = new Date().getTime();
            const diff_ms = currentTime - NameGetter._lastSteamCall;
            if (diff_ms < 1000) {
                yield new Promise(resolve => setTimeout(resolve, diff_ms));
            }
            NameGetter._lastSteamCall = currentTime;
            const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&format=json&steamids=${steamId}`;
            try {
                const result = yield axios_1.default.get(url);
                if (result.status === 200) {
                    const data = result.data;
                    if (data.response && data.response.players && data.response.players.length > 0) {
                        return data.response.players[0].personaname;
                    }
                }
                else {
                    return undefined;
                }
            }
            catch (err) {
                return undefined;
            }
        });
    }
}
exports.default = NameGetter;
/**
 * Cache all lookups, that way we don't need to ask steam each time. This will be cleared on server restart.
 */
NameGetter._nameCache = new Map();
NameGetter._lastSteamCall = new Date().getTime();
