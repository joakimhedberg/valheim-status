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
const fs_1 = __importDefault(require("fs"));
const Tail_1 = __importDefault(require("./Tail"));
const test_filename = './testing/tailTest.txt';
const getTailResult = (filename, input) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(resolve => {
        const tail = new Tail_1.default(filename);
        const result = [];
        tail.on('line', line => result.push(line));
        tail.on('lines_end', () => resolve(result));
        tail.tail();
        for (const item of input) {
            fs_1.default.appendFileSync(filename, `${item}\n`);
        }
    });
});
describe('Testing the Tail class', () => {
    before(() => {
        fs_1.default.writeFileSync(test_filename, 'Row 1\nRow 2\n');
    });
    it('Should tail a file and catch two appended rows', () => __awaiter(void 0, void 0, void 0, function* () {
        const input = ['Row 3', 'Row 4'];
        const result = yield getTailResult(test_filename, input);
        (0, chai_1.expect)(result).to.deep.equal(input);
    }));
    after(() => {
        fs_1.default.rmSync(test_filename);
    });
});
