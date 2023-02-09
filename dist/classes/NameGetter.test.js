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
const NameGetter_1 = __importDefault(require("./NameGetter"));
describe('Testing the name getters', () => {
    it('Should fetch a predefined name from the KnownNames list', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield NameGetter_1.default.getName(undefined, '12345');
        (0, chai_1.expect)(result).to.equal('Greger');
    }));
    it('Should get an undefined response from the name getter', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield NameGetter_1.default.getName(undefined, '0000');
        (0, chai_1.expect)(result).to.be.undefined;
    }));
});
