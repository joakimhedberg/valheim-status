"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Player_1 = __importDefault(require("./Player"));
const jsdom_1 = require("jsdom");
const LogListener_1 = __importDefault(require("./LogListener"));
const fs_1 = __importDefault(require("fs"));
const DateTimeHelpers_1 = __importDefault(require("./helpers/DateTimeHelpers"));
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
        this._listener.on('got_handshake', (date, steamId, isCatchup) => this._handleGotHandshake(date, steamId, isCatchup));
        this._listener.on('closing_socket', (date, steamId, isCatchup) => this._handleClosingSocket(date, steamId, isCatchup));
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
        let player = this._players.get(steamId);
        if (!player) {
            player = new Player_1.default(steamId);
            this._players.set(steamId, player);
        }
        player.setConnected(true, date);
        player.loadName(this._steamApiKey);
        this.emit('player_connect', player, isCatchup);
        this._log.push({ date: date, message: `User ${player === null || player === void 0 ? void 0 : player.player_name} with steam id ${player === null || player === void 0 ? void 0 : player.playerId}`, player: player, userEvent: 'connected' });
    }
    /**
     * Handle the closing socket event
     * @param date Date, if successfully parsed from the stdout file
     * @param steamId Player steam id
     * @param isCatchup Identifies if this is within the catchup event, passed on through emitters
     */
    _handleClosingSocket(date, steamId, isCatchup) {
        if (this._players.has(steamId)) {
            const player = this._players.get(steamId);
            if (player) {
                player.setConnected(false, date);
                this.emit('player_disconnect', player, isCatchup);
                this._log.push({ date: date, message: `User ${player === null || player === void 0 ? void 0 : player.player_name} with steam id ${player === null || player === void 0 ? void 0 : player.playerId}`, player: player, userEvent: 'disconnected' });
            }
        }
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
    getLog(hostname) {
        var _a;
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
        for (const item of this._log.filter(li => li.userEvent !== undefined && li.message !== undefined)) {
            const item_div = document.createElement('div');
            item_div.className = 'item_div';
            const img = document.createElement('img');
            img.src = `http://${hostname}/img/on`;
            img.alt = 'Connected';
            img.style.width = '24px';
            img.style.height = '24px';
            item_div.appendChild(img);
            const date_span = document.createElement('span');
            date_span.className = 'date_span';
            const text_span = document.createElement('span');
            text_span.className = 'text_span';
            item_div.appendChild(date_span);
            item_div.appendChild(text_span);
            main_div.appendChild(item_div);
            date_span.appendChild(document.createTextNode((item.date !== undefined ? item.date.toLocaleString() : '')));
            text_span.appendChild(document.createTextNode((_a = item.message) !== null && _a !== void 0 ? _a : ''));
        }
        return dom.serialize();
    }
    /**
     *
     * @returns The players as a HTML list
     */
    getHtml(hostname) {
        var _a;
        const dom = new jsdom_1.JSDOM();
        const document = dom.window.document;
        const style = document.createElement('style');
        const meta = document.createElement('meta');
        meta.httpEquiv = 'refresh';
        meta.content = '60';
        const script = document.createElement('script');
        script.lang = 'javascript';
        script.innerHTML = `
    function toggleVisibility(id) {
      const items = document.getElementsByClassName(id)
      if (items[0].style.visibility !== 'collapse') {
        for (const item of items) {
          item.style.visibility = 'collapse'
        }
      }
      else {
        for (const item of items) {
          item.style.visibility = 'visible'
        }
      }
    }
    `;
        const title_div = document.createElement('div');
        const listTable = document.createElement('table');
        title_div.className = 'title_div';
        listTable.className = 'list_div';
        document.body.appendChild(title_div);
        document.body.appendChild(listTable);
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

    .player_row td {
      border-bottom: dashed 1px lightgray;
    }

    .player_name {
      cursor: pointer;
    }

    [class^="stat_row"] {
      background-color: lightgray;
      font-style: italic;
    }

    table {
      width: 100%;
    }
    `;
        document.head.appendChild(meta);
        document.head.appendChild(style);
        document.head.appendChild(script);
        let i = 0;
        for (const player of this.playerList) {
            const playerRow = listTable.insertRow();
            playerRow.className = 'player_row';
            const iconCol = playerRow.insertCell();
            const iconImg = document.createElement('img');
            iconImg.width = iconImg.height = 20;
            iconImg.src = `http://${hostname}/img/${player.isConnected ? 'on' : 'off'}`;
            iconCol.appendChild(iconImg);
            const nameCol = playerRow.insertCell();
            const nameSpan = document.createElement('span');
            nameSpan.className = 'player_name';
            nameSpan.setAttribute('onclick', `toggleVisibility('stat_row${i}')`);
            nameSpan.appendChild(document.createTextNode((_a = player.player_name) !== null && _a !== void 0 ? _a : 'N/A'));
            nameCol.appendChild(nameSpan);
            const durationCol = playerRow.insertCell();
            durationCol.appendChild(document.createTextNode(DateTimeHelpers_1.default.MillisecondsToHumanReadable(player.getTotalDuration())));
            for (const stat of player.getStats()) {
                const statRow = listTable.insertRow();
                statRow.className = `stat_row${i}`;
                statRow.style.visibility = 'collapse';
                const connectedCell = statRow.insertCell();
                const disconnectedCell = statRow.insertCell();
                const durationCell = statRow.insertCell();
                connectedCell.appendChild(document.createTextNode(DateTimeHelpers_1.default.getTimeString(stat.start, 'hh:mm:ss')));
                connectedCell.colSpan = 2;
                statRow.insertCell();
                disconnectedCell.appendChild(document.createTextNode(DateTimeHelpers_1.default.getTimeString(stat.end, 'hh:mm:ss')));
                durationCell.appendChild(document.createTextNode(DateTimeHelpers_1.default.MillisecondsToHumanReadable(stat.duration)));
            }
            i++;
        }
        return dom.serialize();
    }
}
exports.default = ConnectionHandler;
