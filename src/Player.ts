import Character = require("./Character");

class Player {

    id: string;
    characters: string[] = [];
    currentCharacterName: string = "";

    /**
     * @description Creates a brand new player for the game
     * @param {string} id 
     */
    constructor(id: string, characters?: string[], currentCharactersName?: string) {
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
    getCurrentCharacter(): string {
        return this.findCurrentCharacter();
    }

    /**
     * Returns the list of all characters this player has
     * @returns 
     */
    getCharacterList(): string[] {
        return this.characters;
    }

    /**
     * Tries to select a new character if available
     * @param {string} name the name of the character to select 
     * @returns true if character was changed, false otherwise
     */
    changeCharacterByName(name: string): boolean {
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
    findCurrentCharacter(): string {
        for (let character of this.characters) {
            if (character === this.currentCharacterName) {
                return character;
            }
        }
        return "";
    }
}

export = Player;