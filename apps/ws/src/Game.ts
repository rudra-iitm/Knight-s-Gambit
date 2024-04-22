import { Chess, DEFAULT_POSITION } from 'chess.js'
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from './messages';
import { randomUUID } from 'crypto';
import { db } from "./db";
import { SocketManager, User } from './SocketManager';

export class Game {
    public player1UserId: string;
    public player2UserId: string | null;
    public board: Chess;
    private startTime: Date;
    public gameId: string;
    public moveCount: number;

    constructor(player1UserId: string, player2UserId: string | null) {   
        this.player1UserId = player1UserId;
        this.player2UserId = player2UserId;
        this.board = new Chess(DEFAULT_POSITION);
        this.startTime = new Date();
        this.gameId = randomUUID();
        this.moveCount = 0;
    }

    async updateSecondPlayer(player2UserId: string) {
        this.player2UserId = player2UserId;

        const users = await db.user.findMany({
            where: {
                id: {
                    in: [this.player1UserId, this.player2UserId ?? ""]
                }
            }
        });

        // console.log('Users', users);

        try {
            await this.createGameInDB();
        } catch(err) {
            console.error(err);
            return;
        }

        SocketManager.getInstance().broadcast(this.gameId, JSON.stringify({
            type: INIT_GAME,
            payload: {
                gameId: this.gameId,
                whitePlayer: { name: users.find(u => u.id === this.player1UserId)?.firstname, id: this.player1UserId },
                blackPlayer: { name: users.find(u => u.id === this.player2UserId)?.firstname, id: this.player2UserId },
                fen: this.board.fen(),
                moves: []
            }
        }));
    }

    async createGameInDB() {
        const game = await db.game.create({
            data: {
                id: this.gameId,
                status: 'IN_PROGRESS',
                currentFen: DEFAULT_POSITION,
                whitePlayer: {
                    connect: {
                        id: this.player1UserId
                    }
                },
                blackPlayer: {
                    connect: {
                        id: this.player2UserId ?? ''
                    }
                }
            },
            include: {
                whitePlayer: true,
                blackPlayer: true
            }
        });
        this.gameId = game.id;
    }

    async addMoveToDB(move: {
        from: string,
        to: string
    }) {
        await db.$transaction([
            db.move.create({
                data: {
                    gameId: this.gameId,
                    moveNumber: this.moveCount + 1,
                    from: move.from,
                    to: move.to,
                    startFen: this.board.fen(),
                    endFen: this.board.fen(),
                }
            }
            ),
            db.game.update({
                    data: {
                        currentFen: this.board.fen(),
                    },
                    where: {
                        id: this.gameId
                    }
                }
            )
        ])

    }

    async makeMove(user: User, move: {
        from: string, 
        to: string
    }) {
        // zod validation here
        console.log('Move received in makeMove fnc', move);
        if (this.moveCount % 2 === 0 && user.userId !== this.player1UserId) {
            return
        }
        if (this.moveCount % 2 === 1 && user.userId !== this.player2UserId) {
            return;
        }
        try {
            await this.addMoveToDB(move);
            this.board.move(move);
            console.log('Move made', move);
        } catch(err) {
            console.error(err);
            return;
        }
        // check the move is over
        SocketManager.getInstance().broadcast(this.gameId, JSON.stringify({
            type: MOVE,
            payload: move
        }))

        console.log('message braodcasted');

        if (this.board.isGameOver()) {
            const result = this.board.isDraw() ? 'DRAW' : this.board.turn() == 'b' ? 'BLACK_WINS' : 'WHITE_WINS'

            SocketManager.getInstance().broadcast(this.gameId, JSON.stringify({
                type: GAME_OVER,
                payload: {
                    result
                }
            }))

            await db.game.update({
                where: {
                    id: this.gameId,
                },
                data: {
                    status: 'COMPLETED'
                }
            })
        }
        this.moveCount++;
    }
}