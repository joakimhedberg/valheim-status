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
const LogListener_1 = __importDefault(require("./LogListener"));
const getListenedLog = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const listener = new LogListener_1.default(filename, true);
    let closing = 0;
    let handshake = 0;
    listener.on('closing_socket', () => closing++);
    listener.on('got_handshake', () => handshake++);
    listener.start();
    return { closing: closing, handshake: handshake };
});
describe('Testing the log listener', function () {
    it('Should verify the number of connections and disconnections', function () {
        return __awaiter(this, void 0, void 0, function* () {
            return getListenedLog('./testing/stdout_test.log').then(result => {
                chai_1.assert.deepEqual(result, { handshake: 84, closing: 79 });
            });
        });
    });
});
