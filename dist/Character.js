"use strict";
class Character {
    // main stats
    name = "Unnamed Character";
    health = 0;
    level = 0;
    temp_health = 0;
    current_health = 0;
    // user-modified ones
    strength = 8;
    dexterity = 8;
    constitution = 8;
    intelligence = 8;
    wisdom = 8;
    charisma = 8;
    // passive ones
    STR = 0;
    DEX = 0;
    CON = 0;
    INT = 0;
    WIS = 0;
    CHA = 0;
    // saving throws
    strength_saving = 0;
    dexterity_saving = 0;
    constitution_saving = 0;
    intelligence_saving = 0;
    wisdom_saving = 0;
    charisma_saving = 0;
    acrobatics = 0;
    animal_handling = 0;
    arcana = 0;
    athletics = 0;
    deception = 0;
    history = 0;
    insight = 0;
    intimidation = 0;
    investigation = 0;
    medicine = 0;
    nature = 0;
    perception = 0;
    performance = 0;
    persuasion = 0;
    religion = 0;
    sleight_of_hand = 0;
    stealth = 0;
    survival = 0;
    // secondary stats
    armor_class = 0;
    proficiency_bonus = 0;
    initiative_bonus = 0;
    speed = 30;
    spell_save = 0;
    spell_attack_modifier = 0;
    // user-set stats
    hasGear = false;
    proficiencies = [];
    spellcasting_modifier = "WIS";
    // other data
    gold = 0;
    silver = 0;
    copper = 0;
    // spell data
    spell_slots = [];
    spell_slots_avail = [];
    spells = [];
    constructor() {
        // sets up spell list
        for (let i = 0; i < 9; i++) {
            this.spell_slots.push(0);
            this.spell_slots_avail.push(0);
        }
    }
    /**
     * Updates character stats that are based on equations
     */
    update() {
        // update passive stats
        this.STR = Math.floor(this.strength / 2 - 5);
        this.DEX = Math.floor(this.dexterity / 2 - 5);
        this.CON = Math.floor(this.constitution / 2 - 5);
        this.INT = Math.floor(this.intelligence / 2 - 5);
        this.WIS = Math.floor(this.wisdom / 2 - 5);
        this.CHA = Math.floor(this.charisma / 2 - 5);
        // saving throws
        this.strength_saving = this.STR;
        this.dexterity_saving = this.DEX;
        this.constitution_saving = this.CON;
        this.intelligence_saving = this.INT;
        this.wisdom_saving = this.WIS;
        this.charisma_saving = this.CHA;
        this.acrobatics = this.DEX;
        this.animal_handling = this.WIS;
        this.arcana = this.INT;
        this.athletics = this.STR;
        this.deception = this.CHA;
        this.history = this.INT;
        this.insight = this.WIS;
        this.intimidation = this.CHA;
        this.investigation = this.INT;
        this.medicine = this.WIS;
        this.nature = this.INT;
        this.perception = this.WIS;
        this.performance = this.CHA;
        this.persuasion = this.CHA;
        this.religion = this.INT;
        this.sleight_of_hand = this.DEX;
        this.stealth = this.DEX;
        this.survival = this.WIS;
        this.initiative_bonus = this.DEX;
        // update AC to the best AC based onCON andDEX
        if (!this.hasGear)
            this.armor_class = 10 + Math.max(this.DEX, this.CON);
        // clear out duplicate proficiencies
        this.proficiencies = [...new Set(this.proficiencies)];
        // updating spellcasting save/attack mod
        switch (this.spellcasting_modifier) {
            case "STR":
                this.spell_save = 8 + this.proficiency_bonus + this.STR;
                this.spell_attack_modifier = this.proficiency_bonus + this.STR;
                break;
            case "DEX":
                this.spell_save = 8 + this.proficiency_bonus + this.DEX;
                this.spell_attack_modifier = this.proficiency_bonus + this.DEX;
                break;
            case "CON":
                this.spell_save = 8 + this.proficiency_bonus + this.CON;
                this.spell_attack_modifier = this.proficiency_bonus + this.CON;
                break;
            case "INT":
                this.spell_save = 8 + this.proficiency_bonus + this.INT;
                this.spell_attack_modifier = this.proficiency_bonus + this.INT;
                break;
            case "WIS":
                this.spell_save = 8 + this.proficiency_bonus + this.WIS;
                this.spell_attack_modifier = this.proficiency_bonus + this.WIS;
                break;
            case "CHA":
                this.spell_save = 8 + this.proficiency_bonus + this.CHA;
                this.spell_attack_modifier = this.proficiency_bonus + this.CHA;
                break;
        }
        // apply proficiencies
        for (let i = 0; i < this.proficiencies.length; i++) {
            let prof = this.proficiencies[i];
            // main stats
            if (prof === "Strength")
                this.strength_saving += this.proficiency_bonus;
            else if (prof === "Dexterity")
                this.dexterity_saving += this.proficiency_bonus;
            else if (prof === "Constitution")
                this.constitution_saving += this.proficiency_bonus;
            else if (prof === "Intelligence")
                this.intelligence += this.proficiency_bonus;
            else if (prof === "Wisdom")
                this.wisdom_saving += this.proficiency_bonus;
            else if (prof === "Charisma")
                this.charisma_saving += this.proficiency_bonus;
            // saving throws
            else if (prof === "Acrobatics")
                this.acrobatics += this.proficiency_bonus;
            else if (prof === "Animal Handling")
                this.animal_handling += this.proficiency_bonus;
            else if (prof === "Arcana")
                this.arcana += this.proficiency_bonus;
            else if (prof === "Athletics")
                this.athletics += this.proficiency_bonus;
            else if (prof === "Deception")
                this.deception += this.proficiency_bonus;
            else if (prof === "History")
                this.history += this.proficiency_bonus;
            else if (prof === "Insight")
                this.insight += this.proficiency_bonus;
            else if (prof === "Intimidation")
                this.intimidation += this.proficiency_bonus;
            else if (prof === "Investigation")
                this.investigation += this.proficiency_bonus;
            else if (prof === "Medicine")
                this.medicine += this.proficiency_bonus;
            else if (prof === "Nature")
                this.nature += this.proficiency_bonus;
            else if (prof === "Perception")
                this.perception += this.proficiency_bonus;
            else if (prof === "Performance")
                this.performance += this.proficiency_bonus;
            else if (prof === "Persuasion")
                this.persuasion += this.proficiency_bonus;
            else if (prof === "Religion")
                this.religion += this.proficiency_bonus;
            else if (prof === "Sleight of Hand")
                this.sleight_of_hand += this.proficiency_bonus;
            else if (prof === "Stealth")
                this.stealth += this.proficiency_bonus;
            // illegal proficiency, remove
            else {
                this.proficiencies.splice(i, 1);
                i--;
            }
        }
    }
    checkIfProficient(stat) {
        return this.proficiencies.includes(stat);
    }
    setSpellSlot(level, num) {
        if (level < 1 || level > 9)
            return;
        this.spell_slots[level - 1] = num;
        this.spell_slots_avail[level - 1] = num;
    }
    getSpellByName(name) {
        return this.spells.find(spell => spell.name.toLowerCase() === name.toLowerCase());
    }
    getSpellsOfLevel(level) {
        return this.spells.filter(spell => spell.numericalLevel === level);
    }
    hasSpell(name) {
        return this.spells.find(spell => spell.name === name) !== undefined;
    }
    /**
     * Tries to add a spell by name
     * @return boolean true if the spell was added, false if the spell already existed (this is determined by name)
     */
    tryAddSpell(spell) {
        // already exists
        if (this.getSpellByName(spell.name) !== undefined) {
            return false;
        }
        // add new spell
        else {
            this.spells.push(spell);
            return true;
        }
    }
}
module.exports = Character;
