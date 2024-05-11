import { SourceTextModule } from "vm";
import Character = require("./Character");
import DatabaseCollection from "./DatabaseCollection";
import Player = require('./Player');
import Spell = require("./Spell");
const env = require('dotenv').config();

export enum CollectionUpdateOperations {
    SET,
    INCREMENT
}

class Database {
    #playerCollection: DatabaseCollection = new DatabaseCollection(env.parsed["MONGO_TOKEN"], "dnd-storage", "players");
    #spellCollection: DatabaseCollection = new DatabaseCollection(env.parsed["MONGO_TOKEN"], "dnd-storage", "spells");
    #characterCollection: DatabaseCollection = new DatabaseCollection(env.parsed["MONGO_TOKEN"], "dnd-storage", "characters");

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
    async addPlayer(id: string) {
        if (!await this.#playerCollection.exists({ "id": id }))
            this.#playerCollection.insert(new Player(id));
    }

    /**
     * Gets a player that in the database
     * @param id the id of the player
     * @returns the player object if successfully found, null otherwise
     */
    async getPlayer(id: string): Promise<Player> {
        const player = this.convertToPlayer(await this.#playerCollection.getOne({ id: id }));
        if (player === null)
            return new Player(id);
        return player;
    }

    /**
     * Adds a character to a player
     * @param id the id of the player
     * @param character the character to add
     * @returns true if the character was successfully added, false otherwise
     */
    async addCharacterToPlayer(id: string, character: Character): Promise<boolean> {
        if (!await this.playerExists(id)) {
            console.log("making player char")
            await this.addPlayer(id);
        }

        if (!await this.characterExists(id, character.name)) {
            await this.#playerCollection.update({ "id": id }, { "$push": { "characters": { "$each": [character.name] } } });
            await this.#playerCollection.update({ "id": id }, { "$set": { "currentCharacterName": character.name } });
            await this.#characterCollection.insert(character)
            console.log("add to player", true);
            return true;
        }
        console.log("add to player", false);
        return false;
    }

    /**
     * Adds a spell to the player's current selected character
     * @param id the id of the player
     * @param spell the spell to give
     * @returns true if the spell was added, false otherwise
     */
    async addSpellToCurrentCharacter(id: string, spell: Spell): Promise<boolean> {
        if (!await this.hasCurrentCharacter(id))
            return false;

        let character = await this.getCurrentCharacter(id);
        if (character.hasSpell(spell.name))
            return false;

        await this.#characterCollection.update(
            { "id": id, "name": character.name }, // Filter
            { "$push": { "spells": { "$each": [spell] } } } // Update with array push
        );
        return true;
    }

    /**
     * Gets the current character of the player
     * @param id the id of the player
     * @returns the character object if successfully found, a default chaeracter if not
     */
    async getCurrentCharacter(id: string): Promise<Character> {
        if (!this.playerExists(id))
            return new Character();

        let player: Player = await this.getPlayer(id);
        let name = player.getCurrentCharacter();

        if (!this.characterExists(id, name))
            return new Character();

        let character: Character = this.convertToCharacter(await this.#characterCollection.getOne({ "id": id, "name": name }));
        return character;
    }

    /**
     * Updates the player's current character
     * @param id the player to update
     * @param name the name of the character
     * @returns true if successfully updated, false otherwise
     */
    async changeCurrentCharacter(id: string, name: string): Promise<boolean> {
        if (!await this.playerExists(id))
            return false;

        if (!await this.characterExists(id, name))
            return false;

        await this.#playerCollection.update({ "id": id }, { "$set": { "currentCharacterName": name } });
        return true;
    }

    /**
     * Gets a spell from the spell collection
     * @param spellName the name of the spell
     * @returns the spell object if successfully found, null otherwise
     */
    async getSpell(spellName: string): Promise<Spell | null> {
        const queryResult: SpellQuery = await this.#spellCollection.getOne({ "searchName": spellName.toLowerCase() }) as SpellQuery;
        if (queryResult === null)
            return null;

        return this.spellFromQuery(queryResult);
    }

    async updateCharacterField(id: string, operation: CollectionUpdateOperations, fieldName: string, value: any): Promise<Character> {
        let collectionOp = (operation === CollectionUpdateOperations.INCREMENT) ? "$inc" : "$set";

        if (!await this.hasCurrentCharacter(id))
            return new Character();
        let name = (await this.getCurrentCharacter(id)).name;
        await this.#characterCollection.update({ "id": id, "name": name }, { [collectionOp]: { [fieldName]: value } });
        return await this.getCurrentCharacter(id);
    }

    async update(id: string, replacement: Character) {
        await this.#characterCollection.update({ "id": id }, { $set: replacement })
    }

    async pushNewProficiencies(id: string, proficiencies: string[]): Promise<Character> {
        if (!await this.hasCurrentCharacter(id))
            return new Character();

        let character = await this.getCurrentCharacter(id);

        // filtering out already owned proficiencies
        let existingProficiencies = new Set(character.proficiencies); 
        let newProficiencies = proficiencies.filter(
            element => !existingProficiencies.has(element)
        );

        await this.#characterCollection.update({ "id": id, "name": character.name }, { "$push": { "proficiencies": { "$each": newProficiencies } } });
        return character;
    }

    async pushSpellcastingData(id: string, slots: number[]): Promise<Character> {
        if (!await this.hasCurrentCharacter(id))
            return new Character;

        let character = await this.getCurrentCharacter(id);

        await this.#characterCollection.update({ "id": id, "name": character.name }, { "$set": { "spell_slots": slots } });
        await this.#characterCollection.update({ "id": id, "name": character.name }, { "$set": { "spell_slots_avail": slots } });
        return character;
    }

    /**
     * Checks if a player exists based on their ID
     * @param id the id to check
     * @returns true if they are in the player collection, false otherwise
     */
    async playerExists(id: string): Promise<boolean> {
        let res = await this.#playerCollection.exists({ "id": id });
        console.log("Played Exists", res);
        return (res) ? res : false;
    }

    /**
     * Checks if a spell exists based on its name
     * @param name the spell to check
     * @returns true if it's in the spell collection, false otherwise
     */
    async spellExists(name: string): Promise<boolean> {
        let res = await this.#spellCollection.exists({ "searchName": name.toLowerCase() });
        return (res) ? res : false;
    }

    /**
     * Checks if a character exists based on the player's id and the character's name
     * @param id the id to check
     * @param name the name to check
     * @returns true if the player has a character with this name, false otherwise
     */
    private async characterExists(id: string, name: string): Promise<boolean> {
        let res = await this.#characterCollection.exists({ "id": id, "name": name });
        console.log("character exists", res);
        return (res) ? res : false;
    }

    private async hasCurrentCharacter(id: string): Promise<boolean> {
        if (!await this.playerExists(id))
            return false;

        let player = await this.getPlayer(id);
        return await this.characterExists(id, player.currentCharacterName);
    }

    /**
     * Converts an object to a Player object. This is used mostly for getting data from the player collection
     * @param obj the object to convert
     * @returns the Player object if constructed successfully, null if the passed in object was null
     */
    private convertToPlayer(obj: any): Player | null {

        if (obj === null)
            return null;

        let player: Player = new Player(obj.id, obj.characters, obj.currentCharacterName);

        return player;
    }

    /**
     * Converts an object to a Character object. This is used mostly for getting data from the player collection
     * @param obj the object to convert
     * @returns the Character object if constructed successfully, null if the passed in object was null
     */
    private convertToCharacter(obj: any): Character {
        const character = new Character();

        for (const key in obj) {

            let spells: Spell[] = [];
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
    private convertToSpell(obj: any): Spell {
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
    private spellFromQuery(queryResult: SpellQuery): Spell {
        let spell = this.convertToSpell(queryResult.data);
        spell.numericalLevel = queryResult.numericalLevel;
        return spell;
    }
}

class SpellQuery {
    name: string = "";
    searchName: string = "";
    numericalLevel: number = 0;
    data: Spell | null = null;
}

export const database = new Database();

module.exports = { database, CollectionUpdateOperations };