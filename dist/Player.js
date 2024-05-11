"use strict";
class Player {
    id;
    characters = [];
    currentCharacterName = "";
    /**
     * @description Creates a brand new player for the game
     * @param {string} id
     */
    constructor(id, characters, currentCharactersName) {
        this.id = id;
        this.characters = (characters) ? characters : [];
        this.currentCharacterName = (currentCharactersName) ? currentCharactersName : "";
    }
    /**
     * Adds a new character to a player
     * @param {Character} character
     */
    addCharacter(character) {
        this.characters.push(character);
    }
    removeCharacter(name) {
        if (this.characters.find(c => c.name === name)) {
            this.characters = this.characters.filter(c => c.name !== name);
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * @returns get the player's id
     */
    getId() {
        return this.id;
    }
    /**
     * @returns get the current character selected
     */
    getCurrentCharacter() {
        return this.findCurrentCharacter();
    }
    getCharacterList() {
        return this.characters;
    }
    /**
     * Tries to select a new character if available
     * @param {string} name the name of the character to select
     * @returns true if character was changed, false otherwise
     */
    changeCharacterByName(name) {
        for (let i = 0; i < this.characters.length; i++) {
            if (name == this.characters[i].name) {
                this.currentCharacterName = this.characters[i].name;
                return true;
            }
        }
        return false;
    }
    findCurrentCharacter() {
        for (let character of this.characters) {
            if (character.name === this.currentCharacterName) {
                return character;
            }
        }
        return null;
    }
}
module.exports = Player;
