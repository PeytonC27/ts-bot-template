import Spell = require("./Spell");

class Character {

	id: string = "";

	// main stats
	name: string = "Unnamed Character";
	health: number = 0;
	level: number = 0;
	temp_health: number = 0;

	current_health: number = 0;

	// user-modified ones
	strength: number = 8;
	dexterity: number = 8;
	constitution: number = 8;
	intelligence: number = 8;
	wisdom: number = 8;
	charisma: number = 8;

	// passive ones
	STR: number = 0;
	DEX: number = 0;
	CON: number = 0;
	INT: number = 0;
	WIS: number = 0;
	CHA: number = 0;

	// saving throws
	strength_saving: number = 0;
	dexterity_saving: number = 0;
	constitution_saving: number = 0;
	intelligence_saving: number = 0;
	wisdom_saving: number = 0;
	charisma_saving: number = 0;

	acrobatics: number = 0;
	animal_handling: number = 0;
	arcana: number = 0;
	athletics: number = 0;
	deception: number = 0;
	history: number = 0;
	insight: number = 0;
	intimidation: number = 0;
	investigation: number = 0;
	medicine: number = 0;
	nature: number = 0;
	perception: number = 0;
	performance: number = 0;
	persuasion: number = 0;
	religion: number = 0;
	sleight_of_hand: number = 0;
	stealth: number = 0;
	survival: number = 0;

	// secondary stats
	armor_class: number = 0;
	proficiency_bonus: number = 0;
	initiative_bonus: number = 0;
	speed: number = 30;
	spell_save: number = 0;
	spell_attack_modifier: number = 0;

	// user-set stats
	hasGear: boolean = false;
	proficiencies: string[] = [];
	spellcasting_modifier: string = "WIS";

	// other data
	gold: number = 0;
	silver: number = 0;
	copper: number = 0;

	// spell data
	spell_slots: number[] = [];
	spell_slots_avail: number[] = [];
	spells: Spell[] = [];

	[key: string | number]: any;

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
				this.spell_save = 8 + this.proficiency_bonus + this.WIS
				this.spell_attack_modifier = this.proficiency_bonus + this.WIS
				break
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

	checkIfProficient(stat: string): boolean {
		return this.proficiencies.includes(stat);
	}

	setSpellSlot(level: number, num: number): void {
		if (level < 1 || level > 9)
			return;

		this.spell_slots[level - 1] = num;
		this.spell_slots_avail[level - 1] = num;
	}

	/**
	 * Returns a spell with a specific name if it can be found
	 * @param name 
	 * @returns 
	 */
	getSpellByName(name: string): Spell | undefined {
		return this.spells.find(spell => spell.name.toLowerCase() === name.toLowerCase());
	}

	/**
	 * Returns all spells with a certain level
	 * @param level 
	 * @returns 
	 */
	getSpellsOfLevel(level: number): Spell[] {
		return this.spells.filter(spell => spell.numericalLevel === level);
	}

	/**
	 * Checks if the user has a spell with a specific name
	 * @param name 
	 * @returns 
	 */
	hasSpell(name: string) {
		return this.spells.find(spell => spell.name === name) !== undefined;
	}

	/**
	 * Tries to add a spell by name
	 * @return boolean true if the spell was added, false if the spell already existed (this is determined by name)
	 */
	tryAddSpell(spell: Spell) {
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

	tryCastSpell(name: string) {
		let spell;
		if ((spell = this.getSpellByName(name.toLowerCase())) && this.spell_slots_avail[spell.numericalLevel-1] > 0) {
			this.spell_slots_avail[spell.numericalLevel-1]--;
			return spell;
		}
		return undefined;
	}
}

export = Character;