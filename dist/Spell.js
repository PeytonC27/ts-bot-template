"use strict";
class Spell {
    name = "";
    level = "";
    casting_time = "";
    range = "";
    components = "";
    duration = "";
    description = "";
    at_higher_levels = "";
    source = "";
    numericalLevel = 0;
    constructor(name, level, castingTime, range, components, duration, description, atHigherLevels, source, numericalLevel) {
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
module.exports = Spell;
