"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const DatabaseManager_1 = require("../../DatabaseManager");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("find-spell")
        .setDescription("Adds an existing spell in the cache")
        .addStringOption((option) => option.setName("spell_name")
        .setDescription("The spell you want to add")
        .setRequired(true)),
    async execute(interaction) {
        const options = interaction.options;
        let userOption = options.getString("spell_name").toLowerCase();
        let spell = await DatabaseManager_1.database.getSpell(userOption);
        if (spell === null) {
            await interaction.reply({
                content: `Could not find a spell called "${userOption}"`,
                ephemeral: true
            });
            return;
        }
        else {
            await interaction.reply({ embeds: [buildEmbedWithSpell(spell)] });
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
