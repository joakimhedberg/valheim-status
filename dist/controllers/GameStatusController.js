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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
class GameStatusController {
}
exports.default = GameStatusController;
_a = GameStatusController;
GameStatusController.GetGameStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(__1.parser.getHtml());
    }
    catch (err) {
        res.status(400).send();
    }
});
GameStatusController.GetGameLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(__1.parser.getLog());
    }
    catch (_b) {
        res.status(400).send();
    }
});
