"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = exports.User = void 0;
const crypto_1 = require("crypto");
class User {
    constructor(socket, userId) {
        this.socket = socket,
            this.userId = userId,
            this.id = (0, crypto_1.randomUUID)();
    }
}
exports.User = User;
class SocketManager {
    constructor() {
        this.interestedSockets = new Map();
        this.userRoomMappping = new Map();
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new SocketManager();
        return this.instance;
    }
    addUser(user, roomId) {
        this.interestedSockets.set(roomId, [...(this.interestedSockets.get(roomId) || []), user]);
        this.userRoomMappping.set(user.id, roomId);
    }
    broadcast(roomId, message) {
        const users = this.interestedSockets.get(roomId);
        if (!users) {
            console.error("No users in room?");
            return;
        }
        users.forEach(user => {
            user.socket.send(message);
        });
    }
    removeUser(user) {
        var _a;
        const roomId = this.userRoomMappping.get(user.id);
        if (!roomId) {
            console.error("User was not interested in any room?");
            return;
        }
        this.interestedSockets.set(roomId, (this.interestedSockets.get(roomId) || []).filter(u => u !== user));
        if (((_a = this.interestedSockets.get(roomId)) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            this.interestedSockets.delete(roomId);
        }
        this.userRoomMappping.delete(user.id);
    }
}
exports.SocketManager = SocketManager;
