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
        let userOption = options.getString("spell_name").toLowerCase();
        let id = interaction.user.id;
        if (!await DatabaseManager_1.database.spellExists(userOption)) {
            await interaction.reply({ content: `Could not find spell: ${userOption}. Make sure your spelling is correct (capitalization does not matter).`, ephemeral: true });
            return;
        }
        if (!await DatabaseManager_1.database.playerExists(id)) {
            await interaction.reply({ content: `You need to make a character before you can give yourself spells!`, ephemeral: true });
            return;
        }
        let spell = await DatabaseManager_1.database.getSpell(userOption);
        if (await DatabaseManager_1.database.getCurrentCharacter(id) === null) {
            await interaction.reply({ content: `You do not have a character selected, please select one`, ephemeral: true });
            return;
        }
        if ((await DatabaseManager_1.database.addSpellToPlayer(id, spell))) {
            await interaction.reply({ content: `Successfull added spell: ${spell.name}!`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `You already have spell "${spell.name} equipped`, ephemeral: true });
            return;
        }
    },
};
