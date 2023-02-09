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
const chai_1 = require("chai");
const ConnectionHandler_1 = __importDefault(require("./ConnectionHandler"));
const getUserStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(resolve => {
        const ch = new ConnectionHandler_1.default(undefined);
        let connected = 0;
        let disconnected = 0;
        ch.on('player_connect', () => connected++);
        ch.on('player_disconnect', () => disconnected++);
        ch.on('lines_end', () => {
            ch.stop();
            resolve({ connected: connected, disconnected: disconnected });
        });
        ch.start('./testing/stdout_test.log', true);
    });
});
describe('Test the connection handler', () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield getUserStatus();
            this['connected'] = status.connected;
            this['disconnected'] = status.disconnected;
        });
    });
    it('Should match the number of connected users', function () {
        (0, chai_1.expect)(this['connected']).to.equal(84);
    });
    it('Should match the number of disconnected users', function () {
        (0, chai_1.expect)(this['disconnected']).to.equal(76);
    });
});
