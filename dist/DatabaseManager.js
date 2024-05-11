"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const Character = require("./Character");
const DatabaseCollection_1 = __importDefault(require("./DatabaseCollection"));
const Player = require("./Player");
const Spell = require("./Spell");
const env = require('dotenv').config();
class Database {
    #playerCollection = new DatabaseCollection_1.default(env.parsed["MONGO_TOKEN"], "dnd-storage", "players");
    #spellCollection = new DatabaseCollection_1.default(env.parsed["MONGO_TOKEN"], "dnd-storage", "spells");
    constructor() { }
    async connect() {
        await this.#playerCollection.connect();
        await this.#spellCollection.connect();
    }
    async close() {
        await this.#playerCollection.close();
        await this.#spellCollection.close();
    }
    async playerExists(id) {
        return await this.#playerCollection.getOne({ id: id }) !== null;
    }
    async spellExists(name) {
        return await this.#spellCollection.getOne({ searchName: name.toLowerCase() }) !== null;
    }
    async addPlayer(id) {
        this.#playerCollection.insert(new Player(id));
    }
    async getPlayer(id) {
        const player = this.convertToPlayer(await this.#playerCollection.getOne({ id: id }));
        return player;
    }
    async addCharacterToPlayer(id, character) {
        if (this.getPlayer(id) !== null) {
            await this.#playerCollection.update({ id: id }, { $push: { characters: { $each: [character] } } });
            await this.#playerCollection.update({ id: id }, { $set: { currentCharacterName: character.name } });
            return true;
        }
        return false;
    }
    async addSpellToPlayer(id, spell) {
        let player, character;
        if ((player = await this.getPlayer(id)) === null || (character = await this.getCurrentCharacter(id)) === null || character.hasSpell(spell.name))
            return false;
        await this.#playerCollection.update({ id: id, "characters.name": character.name }, // Filter
        { $push: { "characters.$.spells": spell } } // Update with array push
        );
        return true;
    }
    async getCurrentCharacter(id) {
        let player = await this.getPlayer(id);
        if (player === null)
            return null;
        return player.getCurrentCharacter();
    }
    async getSpell(spellName) {
        const queryResult = await this.#spellCollection.getOne({ searchName: spellName.toLowerCase() });
        if (queryResult === null)
            return null;
        return this.spellFromQuery(queryResult);
    }
    convertToPlayer(obj) {
        if (obj === null)
            return null;
        // Handle potential missing properties or data inconsistencies
        // You might need to set default values or throw errors
        let player = new Player(obj.id);
        let characters = [];
        for (const characterObj of obj.characters) {
            let spells = [];
            for (const spellObj of characterObj.spells) {
                spells.push(this.convertToSpell(spellObj));
            }
            const tempChar = this.convertToCharacter(characterObj);
            tempChar.spells = spells;
            characters.push(tempChar);
        }
        player.characters = characters;
        player.currentCharacterName = obj.currentCharacterName.toString();
        return player;
    }
    convertToCharacter(obj) {
        const character = new Character();
        for (const key in obj) {
            if (character.hasOwnProperty(key)) {
                character[key] = obj[key];
            }
        }
        character.update();
        return character;
    }
    convertToSpell(obj) {
        const spell = new Spell();
        for (const key in obj) {
            if (spell.hasOwnProperty(key)) {
                spell[key] = obj[key];
            }
        }
        return spell;
    }
    spellFromQuery(queryResult) {
        let spell = this.convertToSpell(queryResult.data);
        spell.numericalLevel = queryResult.numericalLevel;
        return spell;
    }
}
class SpellQuery {
    name = "";
    searchName = "";
    numericalLevel = 0;
    data = null;
}
exports.database = new Database();
module.exports = { database: exports.database };
