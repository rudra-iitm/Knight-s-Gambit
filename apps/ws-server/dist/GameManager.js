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
exports.GameManager = void 0;
const messages_1 = require("./messages");
const Game_1 = require("./Game");
const SocketManager_1 = require("./SocketManager");
const db_1 = require("./db");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingGameId = null;
        this.users = [];
    }
    addUser(user) {
        this.users.push(user);
        this.addHandler(user);
    }
    removeUser(socket) {
        const user = this.users.find(u => u.socket === socket);
        if (!user) {
            console.log('User not found');
            return;
        }
        this.users = this.users.filter(u => u.socket !== socket);
        SocketManager_1.SocketManager.getInstance().removeUser(user);
    }
    addHandler(user) {
        user.socket.on('message', (data) => __awaiter(this, void 0, void 0, function* () {
            const message = JSON.parse(data.toString());
            if (message.type === messages_1.INIT_GAME) {
                if (this.pendingGameId) {
                    const game = this.games.find(game => game.gameId === this.pendingGameId);
                    console.log('Games', this.games);
                    console.log('Pending game found', game);
                    if (!game) {
                        console.error("Pending game not found?");
                        return;
                    }
                    if (user.userId === game.player1UserId) {
                        SocketManager_1.SocketManager.getInstance().broadcast(game.gameId, JSON.stringify({
                            type: messages_1.GAME_ALERT,
                            payload: {
                                message: 'Trying to Connect with yourself?',
                            },
                        }));
                        return;
                    }
                    SocketManager_1.SocketManager.getInstance().addUser(user, game.gameId);
                    yield (game === null || game === void 0 ? void 0 : game.updateSecondPlayer(user.userId));
                    console.log('Game started', game);
                    this.pendingGameId = null;
                }
                else {
                    const game = new Game_1.Game(user.userId, null);
                    this.games.push(game);
                    console.log('Game created', this.games);
                    this.pendingGameId = game.gameId;
                    console.log('Game created', game.gameId);
                    SocketManager_1.SocketManager.getInstance().addUser(user, game.gameId);
                    SocketManager_1.SocketManager.getInstance().broadcast(game.gameId, JSON.stringify({
                        type: messages_1.GAME_ADDED,
                    }));
                }
            }
            if (message.type === messages_1.MOVE) {
                console.log('Move received', message.payload.move);
                const gameId = message.payload.gameId;
                console.log('Game ID', gameId);
                console.log('All games', this.games);
                const game = this.games.find((game) => game.gameId == gameId);
                console.log('Game Found after move', game);
                // console.log('All games', this.games);
                // console.log('Game ID', gameId);
                // console.log('Game found', game);
                if (game) {
                    game.makeMove(user, message.payload.move);
                }
            }
            if (message.type == messages_1.JOIN_ROOM) {
                const gameId = message.payload.gameId;
                if (!gameId) {
                    return;
                }
                const availableGame = this.games.find(game => game.gameId == gameId);
                const gameFromDB = yield db_1.db.game.findFirst({
                    where: {
                        id: gameId
                    },
                    include: {
                        moves: {
                            orderBy: {
                                moveNumber: "asc"
                            }
                        },
                        blackPlayer: true,
                        whitePlayer: true
                    }
                });
                if (!gameFromDB) {
                    user.socket.send(JSON.stringify({
                        type: messages_1.GAME_NOT_FOUND
                    }));
                }
                if (!availableGame) {
                    const game = new Game_1.Game(gameFromDB === null || gameFromDB === void 0 ? void 0 : gameFromDB.whitePlayerId, gameFromDB === null || gameFromDB === void 0 ? void 0 : gameFromDB.blackPlayerId);
                    gameFromDB === null || gameFromDB === void 0 ? void 0 : gameFromDB.moves.map((move) => game.board.move(move));
                    this.games.push(game);
                }
                user.socket.send(JSON.stringify({
                    type: messages_1.GAME_JOINED,
                    payload: {
                        gameId,
                        moves: gameFromDB === null || gameFromDB === void 0 ? void 0 : gameFromDB.moves,
                        blackPlayer: {
                            id: gameFromDB === null || gameFromDB === void 0 ? void 0 : gameFromDB.blackPlayer.id,
                            name: gameFromDB === null || gameFromDB === void 0 ? void 0 : gameFromDB.blackPlayer.firstname
                        },
                        whitePlayer: {
                            id: gameFromDB === null || gameFromDB === void 0 ? void 0 : gameFromDB.whitePlayer.id,
                            name: gameFromDB === null || gameFromDB === void 0 ? void 0 : gameFromDB.whitePlayer.firstname
                        },
                    }
                }));
                SocketManager_1.SocketManager.getInstance().addUser(user, gameId);
            }
        }));
    }
}
exports.GameManager = GameManager;
