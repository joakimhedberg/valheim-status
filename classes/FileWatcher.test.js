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
const FileWatcher_1 = __importDefault(require("./FileWatcher"));
const fs_1 = __importDefault(require("fs"));
const test_filename = './testing/fileWatcher.txt';
describe('Testing the file watcher', () => {
    before(() => {
        fs_1.default.writeFileSync(test_filename, '');
    });
    it('Should detect file changes', () => __awaiter(void 0, void 0, void 0, function* () {
        const fw = new FileWatcher_1.default(test_filename);
        let hadChanges = false;
        fw.on('change', () => {
            hadChanges = true;
        });
        fw.watch();
        fs_1.default.appendFileSync(test_filename, 'Changes happens here');
        yield new Promise(resolve => setTimeout(resolve, 100));
        fw.unwatch();
        yield new Promise(resolve => setTimeout(resolve, 100));
        (0, chai_1.expect)(hadChanges).to.be.true;
    }));
    after(() => {
        fs_1.default.rmSync(test_filename);
    });
});
