class Spell {
	name: string = "";
	level: string = "";
	casting_time: string = "";
	range: string = "";
	components: string = "";
	duration: string = "";
	description: string = "";
	at_higher_levels: string = "";
	source: string = "";
	numericalLevel: number = 0;

	[key: string | number]: any;

	constructor(
		name?: string,
		level?: string,
		castingTime?: string,
		range?: string,
		components?: string,
		duration?: string,
		description?: string,
		atHigherLevels?: string,
		source?: string,
		numericalLevel?: number
	) {
		this.name = (name) ? name : "";
		this.level = (level) ? level : "";
		this.casting_time = (castingTime) ? castingTime : "";
		this.range = (range) ? range : "";
		this.components = (components) ? components : "";
		this.duration = (duration) ? duration : "";
		this.description = (description) ? description : "";
		this.at_higher_levels = (atHigherLevels) ? atHigherLevels : "";
		this.source = (source) ? source : "";
		this.numericalLevel = (numericalLevel) ? numericalLevel : 0;
	}
}

export = Spell;