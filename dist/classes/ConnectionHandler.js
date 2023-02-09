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
const events_1 = require("events");
const Player_1 = __importDefault(require("./Player"));
const jsdom_1 = require("jsdom");
const LogListener_1 = __importDefault(require("./LogListener"));
const fs_1 = __importDefault(require("fs"));
/**
 * Handles the connections parsed from the stdout file
 */
class ConnectionHandler extends events_1.EventEmitter {
    /**
     * ConnectionHandler constructor
     * @param steamKey Steam API key, for optional lookup of player names
     */
    constructor(steamKey) {
        super();
        this._players = new Map();
        this._log = [];
        this._steamApiKey = steamKey;
    }
    get log() { return this._log; }
    /**
     * Start tailin the stdout file and parse the results
     * @param filename Stdout filename
     * @param catchUp If true the entire contents of the stdout file will be parsed before tail start
     */
    start(filename, catchUp) {
        this.stop();
        if (!fs_1.default.existsSync(filename)) {
            throw new Error(`File ${filename} does not exists`);
        }
        this._listener = new LogListener_1.default(filename, catchUp);
        this._listener.on('got_handshake', (date, steamId, isCatchup) => __awaiter(this, void 0, void 0, function* () { return yield this._handleGotHandshake(date, steamId, isCatchup); }));
        this._listener.on('closing_socket', (date, steamId, isCatchup) => __awaiter(this, void 0, void 0, function* () { return yield this._handleClosingSocket(date, steamId, isCatchup); }));
        this._listener.on('lines_start', () => this.emit('lines_start'));
        this._listener.on('lines_end', () => this.emit('lines_end'));
        this._listener.start();
    }
    /**
     * Handle the got handshake event
     * @param date Date, if parsed from the stdout file
     * @param steamId Player steam id as parsed from the file
     * @param isCatchup Identifies if this is within the catchup event, passed on through emitters
     */
    _handleGotHandshake(date, steamId, isCatchup) {
        return __awaiter(this, void 0, void 0, function* () {
            let player = this._players.get(steamId);
            if (!player) {
                player = new Player_1.default(steamId);
                this._players.set(steamId, player);
            }
            this.emit('player_connect', player, isCatchup);
            yield player.loadName(this._steamApiKey);
            this._log.push([date, `User ${player === null || player === void 0 ? void 0 : player.player_name} with steam id ${player === null || player === void 0 ? void 0 : player.playerId} connected`]);
        });
    }
    /**
     * Handle the closing socket event
     * @param date Date, if successfully parsed from the stdout file
     * @param steamId Player steam id
     * @param isCatchup Identifies if this is within the catchup event, passed on through emitters
     */
    _handleClosingSocket(date, steamId, isCatchup) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._players.has(steamId)) {
                const player = this._players.get(steamId);
                if (this._players.delete(steamId)) {
                    this.emit('player_disconnect', player, isCatchup);
                    this._log.push([date, `User ${player === null || player === void 0 ? void 0 : player.player_name} with steam id ${player === null || player === void 0 ? void 0 : player.playerId} disconnected`]);
                }
            }
        });
    }
    /**
     * Stop listening
     */
    stop() {
        if (this._listener) {
            this._listener.stop();
            this._listener.removeAllListeners();
            this._listener = undefined;
        }
    }
    /**
     * Get a list of players on the server
     */
    get playerList() {
        return Array.from(this._players.values());
    }
    /**
     *
     * @returns The log items as HTML
     */
    getLog() {
        const dom = new jsdom_1.JSDOM();
        const document = dom.window.document;
        const main_div = document.createElement('div');
        document.body.appendChild(main_div);
        const style = document.createElement('style');
        document.head.appendChild(style);
        style.innerHTML = `
      .item_div {
        border: solid 1px lightgray;
      }

      .date_span {
        width: 500px;
        margin-right: 10px;
      }
    `;
        for (const item of this._log) {
            const item_div = document.createElement('div');
            item_div.className = 'item_div';
            const date_span = document.createElement('span');
            date_span.className = 'date_span';
            const text_span = document.createElement('span');
            text_span.className = 'text_span';
            item_div.appendChild(date_span);
            item_div.appendChild(text_span);
            main_div.appendChild(item_div);
            date_span.appendChild(document.createTextNode((item[0] !== undefined ? item[0].toLocaleString() : '')));
            text_span.appendChild(document.createTextNode(item[1]));
        }
        return dom.serialize();
    }
    /**
     *
     * @returns The players as a HTML list
     */
    getHtml() {
        var _a;
        const dom = new jsdom_1.JSDOM();
        const document = dom.window.document;
        const style = document.createElement('style');
        const meta = document.createElement('meta');
        meta.httpEquiv = 'refresh';
        meta.content = '10';
        const title_div = document.createElement('div');
        const list_div = document.createElement('div');
        title_div.className = 'title_div';
        list_div.className = 'list_div';
        document.body.appendChild(title_div);
        document.body.appendChild(list_div);
        title_div.appendChild(document.createTextNode('Valheim players'));
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
    `;
        document.head.appendChild(meta);
        document.head.appendChild(style);
        for (const player of this._players.values()) {
            const item_div = dom.window.document.createElement('div');
            item_div.appendChild(dom.window.document.createTextNode((_a = player.player_name) !== null && _a !== void 0 ? _a : 'N/A'));
            item_div.setAttribute('hidden_data', player.playerId);
            item_div.className = 'item';
            list_div.appendChild(item_div);
        }
        return dom.serialize();
    }
}
exports.default = ConnectionHandler;
