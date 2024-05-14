"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const DatabaseManager_1 = require("../../DatabaseManager");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("add-spell")
        .setDescription("Adds an existing spell in the cache")
        .addStringOption((option) => option.setName("spell_name")
        .setDescription("The spell you want to add")
        .setRequired(true)),
    async execute(interaction) {
        const options = interaction.options;
        // find the spell
        let userOption = options.getString("spell_name").toLowerCase();
        let id = interaction.user.id;
        let spell;
        // if the user's input doesn't map to an existing spell
        if (!(spell = await DatabaseManager_1.database.getSpell(userOption))) {
            await interaction.reply({ content: `Could not find spell: ${userOption}. Make sure your spelling is correct (capitalization does not matter).`, ephemeral: true });
            return;
        }
        // try adding the spell to the character
        if ((await DatabaseManager_1.database.addSpellToCurrentCharacter(id, spell))) {
            await interaction.reply({ content: `Successfull added spell: ${spell.name}!`, ephemeral: true });
        }
        // user tried to add a spell they already have
        else {
            await interaction.reply({ content: `You already have spell "${spell.name} equipped`, ephemeral: true });
            return;
        }
    },
};
