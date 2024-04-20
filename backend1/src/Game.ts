import { Chess, DEFAULT_POSITION } from 'chess.js'
import { WebSocket } from "ws";
import { GAME_OVER, GAME_STARTED, INIT_GAME, MOVE } from './messages';

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {   
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess(DEFAULT_POSITION);
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: GAME_STARTED,
            payload: {
                color: 'white',
            }
        }));
        this.player2.send(JSON.stringify({
            type: GAME_STARTED,
            payload: {  
                color: 'black',
            }
        }));
    }

    makeMove(player: WebSocket, move: {
        from: string, 
        to: string
    }) {
        // zod validation here
        console.log('make move', move);
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