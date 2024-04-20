import { WebSocket } from "ws";
import { GAME_STARTED, INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";

export class GameManager {
    private games: Game[] = [];
    private pendingUser: WebSocket | null;
    private users: WebSocket[] = [];

    constructor() {
        this.games = [];
        this.pendingUser = null;
    }

    addUser(user: WebSocket) {
        this.users.push(user);
        this.addHandler(user);
    }

    removeUser(user: WebSocket) {
        this.users = this.users.filter(u => u !== user);
        // stop the game here, user left
    }

    addHandler(user: WebSocket) {
        user.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    const game = new Game(this.pendingUser, user);

                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = user;
                }
            }
            if (message.type === MOVE) {
                const game = this.games.find(g => g.player1 === user || g.player2 === user);
                if (game) {
                    game.makeMove(user, message.move);
                }
            }
        });
    }
}