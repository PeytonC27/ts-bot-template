import { SourceTextModule } from "vm";
import Character = require("./Character");
import DatabaseCollection from "./DatabaseCollection";
import Player = require('./Player');
import Spell = require("./Spell");
import { Binary } from "mongodb";
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
    async getPlayer(id: string): Promise<Player | undefined> {
        const player = await this.#playerCollection.getOne({ id: id });
        return player ? this.convertToPlayer(player) : undefined;
    }

    /**
     * Gets a spell from the spell collection
     * @param spellName the name of the spell
     * @returns the spell object if successfully found, null otherwise
     */
    async getSpell(spellName: string): Promise<Spell | undefined> {
        const queryResult: SpellQuery = await this.#spellCollection.getOne({ "searchName": spellName.toLowerCase() }) as SpellQuery;
        return queryResult ? this.spellFromQuery(queryResult) : undefined;
    }

    async getCharacter(id: string, characterName: string): Promise<Character | undefined> {
        const queryResult = await this.#characterCollection.getOne({ "id": id, "name": characterName });
        return queryResult ? this.convertToCharacter(queryResult) : undefined;
    }

    /**
     * Gets the current character of the player
     * @param id the id of the player
     * @returns the character object if successfully found, a default chaeracter if not
     */
    async getCurrentCharacter(id: string): Promise<Character | undefined> {
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
    async addCharacterToPlayer(id: string, character: Character): Promise<boolean> {
        if (!await this.getCharacter(id, character.name)) {
            const playerResult = await this.#playerCollection.update(
                { "id": id },
                {
                    "$push": { "characters": { "$each": [character.name] } },
                    "$set": { "currentCharacterName": character.name }
                },
                { "upsert": true }
            );
            await this.#characterCollection.insert(character);
            return playerResult?.modifiedCount === 1;
        }
        return false;
    }

    async removeCharacter(id: string, characterName: string) {
        let res = await this.#characterCollection.remove({ "id": id, "name": characterName });
        return res?.acknowledged;
    }

    /**
     * Adds a spell to the player's current selected character
     * @param id the id of the player
     * @param spell the spell to give
     * @returns true if the spell was added, false otherwise
     */
    async addSpellToCurrentCharacter(id: string, spell: Spell): Promise<boolean> {
        let character;
        if ((character = await this.getCurrentCharacter(id))) {
            if (character.hasSpell(spell.name))
                return false;

            await this.#characterCollection.update(
                { "id": id, "name": character.name }, // Filter
                { "$push": { "spells": { "$each": [spell] } } } // Update with array push
            );
            return true;
        }
        return false;
    }

    // async addProfilePicture(buffer: Buffer, id: string, characterName: string): Promise<boolean> {
    //     let result = await this.#imageCollection.insert({ "data": buffer, "id": id, "name": characterName });
    //     return (result) ? result.acknowledged : false;
    // }

    // async getProfilePicture(id: string): Promise<ImageData | undefined> {
    //     let character;
    //     if ((character = await this.getCurrentCharacter(id))) {
    //         let name = character.name;
    //         let image;
    //         if ((image = await this.#imageCollection.getOne({ "name": name, "id": id })) != null) {
    //             // console.log((image as ImageData).data);
    //             return image as ImageData;
    //         }
    //         return undefined;
    //     }
    //     return undefined;
    // }


    /**
     * Updates the player's current character
     * @param id the player to update
     * @param name the name of the character
     * @returns true if successfully updated, false otherwise
     */
    async changeCurrentCharacter(id: string, name: string): Promise<boolean> {
        if (await this.getCharacter(id, name) || name === "") {
            await this.#playerCollection.update({ "id": id }, { "$set": { "currentCharacterName": name } });
            return true;
        }
        return false;
    }

    async update(id: string, replacement: Character) {
        replacement.update();
        await this.#characterCollection.update({ "id": id, "name": replacement.name }, { $set: replacement })
    }

    async updatePlayer(replacement: Player) {
        await this.#playerCollection.update({"id": replacement.id }, { $set: replacement });
    }

    /**
     * Converts an object to a Player object. This is used mostly for getting data from the player collection
     * @param obj the object to convert
     * @returns the Player object if constructed successfully, null if the passed in object was null
     */
    private convertToPlayer(obj: any): Player {
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

class ImageData {
    name: string = "";
    id: string = "";
    binary: Binary = new Binary();
}

export const database = new Database();

module.exports = { database, CollectionUpdateOperations };