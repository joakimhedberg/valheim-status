"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GameStatusController_1 = __importDefault(require("../controllers/GameStatusController"));
const img_1 = __importDefault(require("./img"));
const router = (0, express_1.Router)();
router.get('/status', GameStatusController_1.default.GetGameStatus);
router.get('/log', GameStatusController_1.default.GetGameLog);
router.use('/img', img_1.default);
exports.default = router;
