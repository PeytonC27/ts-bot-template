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
    /**
     * Returns the list of all characters this player has
     * @returns
     */
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
            if (name == this.characters[i]) {
                this.currentCharacterName = this.characters[i];
                return true;
            }
        }
        return false;
    }
    /**
     * Tries to find the current character, returning them if they exist
     * @returns
     */
    findCurrentCharacter() {
        for (let character of this.characters) {
            if (character === this.currentCharacterName) {
                return character;
            }
        }
        return "";
    }
}
module.exports = Player;
