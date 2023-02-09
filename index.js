"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushover = exports.parser = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const ConnectionHandler_1 = __importDefault(require("./classes/ConnectionHandler"));
const pushover_js_1 = require("pushover-js");
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const log_path = (_a = process.env.STDOUT_PATH) !== null && _a !== void 0 ? _a : '';
app.use(express_1.default.json());
app.use(routes_1.default);
if (!fs_1.default.existsSync(log_path)) {
    throw new Error('No stdout file found');
}
exports.parser = new ConnectionHandler_1.default(process.env.STEAM_API_KEY);
exports.pushover = undefined;
if (process.env.PUSHOVER_USER && process.env.PUSHOVER_TOKEN && process.env.MODE !== 'development') {
    try {
        exports.pushover = new pushover_js_1.Pushover(process.env.PUSHOVER_USER, process.env.PUSHOVER_TOKEN);
    }
    catch (_b) {
        exports.pushover = undefined;
    }
}
exports.parser.on('player_connect', (player, isCatchup) => {
    if (!isCatchup) {
        exports.pushover === null || exports.pushover === void 0 ? void 0 : exports.pushover.send('Valheim user CONNECTED', `${player.player_name} joined the game`);
    }
});
exports.parser.on('player_disconnect', (player, isCatchup) => {
    if (!isCatchup) {
        exports.pushover === null || exports.pushover === void 0 ? void 0 : exports.pushover.send('Valheim user DISCONNECTED', `${player.player_name} left the game`);
    }
});
app.listen(port, () => {
    exports.parser.start(log_path, true);
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
