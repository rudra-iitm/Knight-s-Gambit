"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.wss = void 0;
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const url_1 = __importDefault(require("url"));
const SocketManager_1 = require("./SocketManager");
// import { extractUserId } from './auth';
const host = '0.0.0.0';
const port = 8000;
const app = (0, express_1.default)();
exports.app = app;
const httpServer = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
app.get('/health', (req, res) => {
    res.send('Health OK!');
});
const wss = new ws_1.WebSocketServer({ server: httpServer });
exports.wss = wss;
let gameManager = new GameManager_1.GameManager();
wss.on('connection', function connection(ws, req) {
    ws.on('error', console.error);
    // @ts-ignore
    const userId = url_1.default.parse(req.url, true).query.userId;
    gameManager.addUser(new SocketManager_1.User(ws, userId));
    ws.on('disconnect', () => {
        gameManager.removeUser(ws);
    });
});
exports.default = app;
