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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
const crypto_1 = require("crypto");
const db_1 = require("./db");
const SocketManager_1 = require("./SocketManager");
class Game {
    constructor(player1UserId, player2UserId) {
        this.player1UserId = player1UserId;
        this.player2UserId = player2UserId;
        this.board = new chess_js_1.Chess(chess_js_1.DEFAULT_POSITION);
        this.startTime = new Date();
        this.gameId = (0, crypto_1.randomUUID)();
        this.moveCount = 0;
    }
    updateSecondPlayer(player2UserId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.player2UserId = player2UserId;
            const users = yield db_1.db.user.findMany({
                where: {
                    id: {
                        in: [this.player1UserId, (_a = this.player2UserId) !== null && _a !== void 0 ? _a : ""]
                    }
                }
            });
            // console.log('Users', users);
            try {
                yield this.createGameInDB();
            }
            catch (err) {
                console.error(err);
                return;
            }
            SocketManager_1.SocketManager.getInstance().broadcast(this.gameId, JSON.stringify({
                type: messages_1.INIT_GAME,
                payload: {
                    gameId: this.gameId,
                    whitePlayer: { name: (_b = users.find((u) => u.id === this.player1UserId)) === null || _b === void 0 ? void 0 : _b.firstname, id: this.player1UserId },
                    blackPlayer: { name: (_c = users.find((u) => u.id === this.player2UserId)) === null || _c === void 0 ? void 0 : _c.firstname, id: this.player2UserId },
                    fen: this.board.fen(),
                    moves: []
                }
            }));
        });
    }
    createGameInDB() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const game = yield db_1.db.game.create({
                data: {
                    id: this.gameId,
                    status: 'IN_PROGRESS',
                    currentFen: chess_js_1.DEFAULT_POSITION,
                    whitePlayer: {
                        connect: {
                            id: this.player1UserId
                        }
                    },
                    blackPlayer: {
                        connect: {
                            id: (_a = this.player2UserId) !== null && _a !== void 0 ? _a : ''
                        }
                    }
                },
                include: {
                    whitePlayer: true,
                    blackPlayer: true
                }
            });
            this.gameId = game.id;
        });
    }
    addMoveToDB(move) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.db.$transaction([
                db_1.db.move.create({
                    data: {
                        gameId: this.gameId,
                        moveNumber: this.moveCount + 1,
                        from: move.from,
                        to: move.to,
                        startFen: this.board.fen(),
                        endFen: this.board.fen(),
                    }
                }),
                db_1.db.game.update({
                    data: {
                        currentFen: this.board.fen(),
                    },
                    where: {
                        id: this.gameId
                    }
                })
            ]);
        });
    }
    makeMove(user, move) {
        return __awaiter(this, void 0, void 0, function* () {
            // zod validation here
            console.log('Move received in makeMove fnc', move);
            if (this.moveCount % 2 === 0 && user.userId !== this.player1UserId) {
                return;
            }
            if (this.moveCount % 2 === 1 && user.userId !== this.player2UserId) {
                return;
            }
            try {
                yield this.addMoveToDB(move);
                this.board.move(move);
                console.log('Move made', move);
            }
            catch (err) {
                console.error(err);
                return;
            }
            // check the move is over
            SocketManager_1.SocketManager.getInstance().broadcast(this.gameId, JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
            console.log('message braodcasted');
            if (this.board.isGameOver()) {
                const result = this.board.isDraw() ? 'DRAW' : this.board.turn() == 'b' ? 'BLACK_WINS' : 'WHITE_WINS';
                SocketManager_1.SocketManager.getInstance().broadcast(this.gameId, JSON.stringify({
                    type: messages_1.GAME_OVER,
                    payload: {
                        result
                    }
                }));
                yield db_1.db.game.update({
                    where: {
                        id: this.gameId,
                    },
                    data: {
                        status: 'COMPLETED'
                    }
                });
            }
            this.moveCount++;
        });
    }
}
exports.Game = Game;
