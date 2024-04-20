import { Chess, DEFAULT_POSITION } from 'chess.js'
import { WebSocket } from "ws";
import { GAME_OVER, GAME_STARTED, INIT_GAME, MOVE } from './messages';
import { randomUUID } from 'crypto';

export class Game {
    public player1UserId: string;
    public player2UserId: string | null;
    private board: Chess;
    private startTime: Date;
    public gameId: string;

    constructor(player1UserId: string, player2UserId: string | null) {   
        this.player1UserId = player1UserId;
        this.player2UserId = player2UserId;
        this.board = new Chess(DEFAULT_POSITION);
        this.startTime = new Date();
        this.gameId = randomUUID();
    }

    async updateSecondPlayer(player2UserId: string) {
        this.player2UserId = player2UserId;

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: [this.player1UserId, this.player2UserId ?? ""]
                }
            }
        });

        try {
            await this.createGameInDB(users);
        } catch(err) {
            console.error(err);
            return;
        }

        SocketManager.getInstance().broadcast(this.gameId, JSON.stringify({
            type: GAME_STARTED,
            payload: {
                gameId: this.gameId,
                whitePlayer: { name: users.find(u => u.id === this.player1UserId)?.name, id: this.player1UserId },
                blackPlayer: { name: users.find(u => u.id === this.player2UserId)?.name, id: this.player2UserId },
                player2: users[1],
                fen: this.board.fen(),
                moves: []
            }
        }));
    }

    async createGameInDB() {
        const game = await prisma.game.create({
            data: {
                id: this.gameId,
                status: 'IN_PROGRESS',
                currentfen: DEFAULT_POSITION,
                whitePlayer: {
                    connect: {
                        id: this.player1UserId
                    }
                },
                blackPlayer: {
                    connect: {
                        id: this.player2UserId ?? ''
                    }
                },
                include: {
                    whitePlayer: true,
                    blackPlayer: true
                }
            }
        });
        this.gameId = game.id;
    }

    makeMove(player: WebSocket, move: {
        from: string, 
        to: string
    }) {
        // zod validation here
        try {
            this.board.move(move);
        } catch(err) {
            console.error(err);
            return;
        }
        // check the move is over
        if (this.board.isGameOver()) {
            // send the game over message to both the players
            this.player1.emit(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? 'black' : 'white',
                    time: new Date().getTime() - this.startTime.getTime()
                }
            }));
        }

        if (player === this.player1) {
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
        } else {
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
        }
    }
}