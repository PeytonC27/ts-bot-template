"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.CollectionUpdateOperations = void 0;
const Character = require("./Character");
const DatabaseCollection_1 = __importDefault(require("./DatabaseCollection"));
const Player = require("./Player");
const Spell = require("./Spell");
const env = require('dotenv').config();
var CollectionUpdateOperations;
(function (CollectionUpdateOperations) {
    CollectionUpdateOperations[CollectionUpdateOperations["SET"] = 0] = "SET";
    CollectionUpdateOperations[CollectionUpdateOperations["INCREMENT"] = 1] = "INCREMENT";
})(CollectionUpdateOperations || (exports.CollectionUpdateOperations = CollectionUpdateOperations = {}));
class Database {
    #playerCollection = new DatabaseCollection_1.default(env.parsed["MONGO_TOKEN"], "dnd-storage", "players");
    #spellCollection = new DatabaseCollection_1.default(env.parsed["MONGO_TOKEN"], "dnd-storage", "spells");
    #characterCollection = new DatabaseCollection_1.default(env.parsed["MONGO_TOKEN"], "dnd-storage", "characters");
    constructor() { }
    /**
     * Connects both the player and spell collections
     */
    async connect() {
        await this.#playerCollection.connect();
        await this.#spellCollection.connect();
        await this.#characterCollection.connect();
    }
    /**
     * Closes connections with the player and spell collections
     */
    async close() {
        await this.#playerCollection.close();
        await this.#spellCollection.close();
        await this.#characterCollection.close();
    }
    /**
     * Registers a new player in the player collection
     * @param id the id of the player
     */
    async addPlayer(id) {
        if (!await this.#playerCollection.exists({ "id": id }))
            this.#playerCollection.insert(new Player(id));
    }
    /**
     * Gets a player that in the database
     * @param id the id of the player
     * @returns the player object if successfully found, null otherwise
     */
    async getPlayer(id) {
        const player = await this.#playerCollection.getOne({ id: id });
        return player ? this.convertToPlayer(player) : undefined;
    }
    /**
     * Gets a spell from the spell collection
     * @param spellName the name of the spell
     * @returns the spell object if successfully found, null otherwise
     */
    async getSpell(spellName) {
        const queryResult = await this.#spellCollection.getOne({ "searchName": spellName.toLowerCase() });
        return queryResult ? this.spellFromQuery(queryResult) : undefined;
    }
    async getCharacter(id, characterName) {
        const queryResult = await this.#characterCollection.getOne({ "id": id, "name": characterName });
        return queryResult ? this.convertToCharacter(queryResult) : undefined;
    }
    /**
     * Gets the current character of the player
     * @param id the id of the player
     * @returns the character object if successfully found, a default chaeracter if not
     */
    async getCurrentCharacter(id) {
        let player, character;
        if ((player = await this.getPlayer(id))) {
            let name = player.getCurrentCharacter();
            if ((character = await this.getCharacter(id, name))) {
                return character;
            }
        }
        return undefined;
    }
    /**
     * Adds a character to a player
     * @param id the id of the player
     * @param character the character to add
     * @returns true if the character was successfully added, false otherwise
     */
    async addCharacterToPlayer(id, character) {
        if (!await this.getCharacter(id, character.name)) {
            const playerResult = await this.#playerCollection.update({ "id": id }, {
                "$push": { "characters": { "$each": [character.name] } },
                "$set": { "currentCharacterName": character.name }
            }, { "upsert": true });
            await this.#characterCollection.insert(character);
            return playerResult?.modifiedCount !== 1;
        }
        return false;
    }
    /**
     * Adds a spell to the player's current selected character
     * @param id the id of the player
     * @param spell the spell to give
     * @returns true if the spell was added, false otherwise
     */
    async addSpellToCurrentCharacter(id, spell) {
        let character;
        if ((character = await this.getCurrentCharacter(id))) {
            if (character.hasSpell(spell.name))
                return false;
            await this.#characterCollection.update({ "id": id, "name": character.name }, // Filter
            { "$push": { "spells": { "$each": [spell] } } } // Update with array push
            );
            return true;
        }
        return false;
    }
    /**
     * Updates the player's current character
     * @param id the player to update
     * @param name the name of the character
     * @returns true if successfully updated, false otherwise
     */
    async changeCurrentCharacter(id, name) {
        if (await this.getCharacter(id, name)) {
            await this.#playerCollection.update({ "id": id }, { "$set": { "currentCharacterName": name } });
            return true;
        }
        return false;
    }
    async update(id, replacement) {
        replacement.update();
        await this.#characterCollection.update({ "id": id }, { $set: replacement });
    }
    /**
     * Converts an object to a Player object. This is used mostly for getting data from the player collection
     * @param obj the object to convert
     * @returns the Player object if constructed successfully, null if the passed in object was null
     */
    convertToPlayer(obj) {
        let player = new Player(obj.id, obj.characters, obj.currentCharacterName);
        return player;
    }
    /**
     * Converts an object to a Character object. This is used mostly for getting data from the player collection
     * @param obj the object to convert
     * @returns the Character object if constructed successfully, null if the passed in object was null
     */
    convertToCharacter(obj) {
        const character = new Character();
        for (const key in obj) {
            let spells = [];
            for (const spellObj of obj.spells) {
                spells.push(this.convertToSpell(spellObj));
            }
            if (character.hasOwnProperty(key)) {
                character[key] = obj[key];
            }
            character.spells = spells;
        }
        character.update();
        return character;
    }
    /**
     * Converts an object to a Spell object. This is used mostly for getting data from the spell collection
     * @param obj the object to convert
     * @returns the Spell object if constructed successfully, null if the passed in object was null
     */
    convertToSpell(obj) {
        const spell = new Spell();
        for (const key in obj) {
            if (spell.hasOwnProperty(key)) {
                spell[key] = obj[key];
            }
        }
        return spell;
    }
    /**
     * Converts a SpellQuery object to a Spell object
     * @param queryResult the result of the query from the spell collection
     * @returns the Spell object
     */
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
module.exports = { database: exports.database, CollectionUpdateOperations };
