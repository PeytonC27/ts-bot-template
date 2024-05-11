"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerCollection = void 0;
const result = require("dotenv").config();
const DatabaseCollection_1 = __importDefault(require("./DatabaseCollection"));
class PlayerDatabaseCollection {
    collection;
    constructor() {
        this.collection = new DatabaseCollection_1.default(result.parsed["URL"], "testDB", "collection");
    }
    async connect() {
        this.collection.connect();
    }
    async close() {
        this.collection.close();
    }
    async has(id) {
        let obj = await this.collection.getOne({ id: id });
        return obj != null;
    }
    async getCurrentCharacter(id) {
        let player = await this.collection.getOne({ id: id });
        if (player === null)
            return null;
        return player.getCurrentCharacter();
    }
    async selectNewCharacter(id, charName) {
    }
    async getPlayer(id) {
        let player = await this.collection.getOne({ id: id });
        if (player != null)
            return player;
        else
            return null;
    }
    async addNewPlayer(player) {
        await this.collection.insert(player);
        console.log(`Added player: ${player.id}`);
    }
    async addXP(id) {
        let xpAmount = Math.floor(Math.random() * 6) + 5;
        await this.collection.update({ id: id }, { $inc: { xp: xpAmount } });
        console.log(`Added ${xpAmount} XP to ${id}`);
    }
}
exports.playerCollection = new PlayerDatabaseCollection();
module.exports = { playerCollection: exports.playerCollection };
