import express from 'express'
import { WebSocketServer } from 'ws'
import { GameManager } from './GameManager'
import url from "url";
import { User } from './SocketManager';
// import { extractUserId } from './auth';
const host = '0.0.0.0'
const port = 8000

const app = express()
const httpServer = app.listen(port,  () => {
    console.log(`Server is running on http://localhost:${port}`)
})

const wss = new WebSocketServer({ server: httpServer });

let gameManager = new GameManager();

wss.on('connection', function connection(ws, req) {
    ws.on('error', console.error);
    // @ts-ignore
    const userId: string = url.parse(req.url, true).query.userId;
    gameManager.addUser(new User(ws, userId));
    ws.on('disconnect', () => {
        gameManager.removeUser(ws);
    });
});