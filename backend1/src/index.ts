import express from 'express'
import { WebSocketServer } from 'ws'
import { GameManager } from './GameManager'
const host = '0.0.0.0'
const port = 8080

const app = express()
const httpServer = app.listen(port, host,  () => {
    console.log(`Server is running on http://${host}:${port}`)
})

const wss = new WebSocketServer({ server: httpServer });

let gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    gameManager.addUser(ws);
    ws.on('disconnect', () => {
        gameManager.removeUser(ws);
    });
});