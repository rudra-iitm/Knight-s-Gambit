import { WebSocket } from "ws";
import { GAME_ALERT, GAME_JOINED, GAME_NOT_FOUND, GAME_STARTED, INIT_GAME, JOIN_ROOM, MOVE } from "./messages";
import { Game } from "./Game";
import { SocketManager, User } from "./SocketManager";
import { db } from "./db";

export class GameManager {
    private games: Game[]
    private pendingGameId: string | null;
    private users: User[];

    constructor() {
        this.games = [];
        this.pendingGameId = null;
        this.users = [];
    }

    addUser(user: User) {
        this.users.push(user);
        this.addHandler(user);
    }

    removeUser(socket: WebSocket) {
        const user = this.users.find(u => u.socket === socket);
        if (!user) {
            console.log('User not found');
            return;
        }
        this.users = this.users.filter(u => u.socket !== socket);
        SocketManager.getInstance().removeUser(user);
    }

    addHandler(user: User) {
        user.socket.on('message',async (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === INIT_GAME) {
                if (this.pendingGameId) {
                    const game = this.games.find(x => x.gameId === this.pendingGameId)
                    console.log('Games', this.games);
                    console.log('Pending game found', game);
                    if (!game) {
                        console.error("Pending game not found?")
                        return;
                    }
                    if (user.userId === game.player1UserId) {
                        SocketManager.getInstance().broadcast(
                          game.gameId,
                          JSON.stringify({
                            type: GAME_ALERT,
                            payload: {
                              message: 'Trying to Connect with yourself?',
                            },
                          }),
                        );
                        return;
                    }            
                    SocketManager.getInstance().addUser(user, game.gameId)
                    await game?.updateSecondPlayer(user.userId);
                    this.pendingGameId = null;
                }
                else {
                    const game = new Game(user.userId, null)
                    this.games.push(game);
                    this.pendingGameId = game.gameId;
                    console.log('Game created', game.gameId);
                    SocketManager.getInstance().addUser(user, game.gameId)
                }
            }
            if (message.type === MOVE) {
                console.log('Move received', message.payload.move);
                const gameId = message.payload.gameId;
                const game = this.games.find(game => game.gameId == gameId);
                console.log('All games', this.games);
                console.log('Game ID', gameId);
                console.log('Game found', game);
                if (game) {
                    game.makeMove(user, message.payload.move);
                }
            }
            if (message.type == JOIN_ROOM) {
                const gameId = message.payload.gameId;
                if (!gameId) {
                    return;
                }
                const availableGame = this.games.find(game => game.gameId == gameId);
                const gameFromDB = await db.game.findFirst({
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
                })
                if (!gameFromDB) {
                    user.socket.send(JSON.stringify({
                        type: GAME_NOT_FOUND
                    }))
                }

                if (!availableGame) {
                    const game = new Game(gameFromDB?.whitePlayerId!, gameFromDB?.blackPlayerId!)
                    gameFromDB?.moves.map((move) => game.board.move(move))
                    this.games.push(game);
                }
                user.socket.send(JSON.stringify({
                    type: GAME_JOINED,
                    payload: {
                        gameId,
                        moves: gameFromDB?.moves,
                        blackPlayer: {
                            id: gameFromDB?.blackPlayer.id,
                            name: gameFromDB?.blackPlayer.firstname
                        },
                        whitePlayer: {
                            id: gameFromDB?.whitePlayer.id,
                            name: gameFromDB?.whitePlayer.firstname
                        },
                    }
                }))
                SocketManager.getInstance().addUser(user, gameId);
            }
        });
    }
}