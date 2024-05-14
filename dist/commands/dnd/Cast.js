"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const DatabaseManager_1 = require("../../DatabaseManager");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("cast")
        .setDescription("Cast a spell")
        .addStringOption((option) => option.setName("spell-name")
        .setDescription("The name of the spell to cast")
        .setRequired(true)),
    async execute(interaction) {
        const options = interaction.options;
        let spellName = options.getString("spell-name");
        let id = interaction.user.id;
        let character, spell;
        if ((character = await DatabaseManager_1.database.getCurrentCharacter(id)) && (spell = character.tryCastSpell(spellName))) {
            await DatabaseManager_1.database.update(id, character);
            await interaction.reply({ embeds: [buildEmbedWithSpell(spell)], ephemeral: true });
        }
        else {
            await interaction.reply({ content: "Spellcasting failed", ephemeral: true });
        }
    },
};
function buildEmbedWithSpell(spell) {
    return {
        color: 0xE1F08B,
        title: `${spell.name}`,
        footer: { text: spell.source },
        fields: [
            { name: "", value: `*(${spell.numericalLevel}) ${spell.level}*` },
            { name: "", value: `**Casting Time**: ${spell.casting_time}` },
            { name: "", value: `**Range**: ${spell.range}` },
            { name: "", value: `**Components**: ${spell.components}` },
            { name: "", value: `**Duration**: ${spell.duration}` },
            { name: "", value: "======================================================================" },
            { name: "", value: `${spell.description}` + "\n\n***At Higher Levels***. " + spell.at_higher_levels },
            { name: "", value: "" },
            { name: "", value: "" },
        ],
    };
}
