"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const DatabaseManager_1 = require("../../DatabaseManager");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("select")
        .setDescription("Selects a different character you own")
        .addStringOption((option) => option.setName("character-name")
        .setDescription("The name of the character you want to switch to")
        .setRequired(true)),
    async execute(interaction) {
        const options = interaction.options;
        // get data
        let characterName = options.getString("character-name");
        let id = interaction.user.id;
        let character, player;
        // try changing the character
        if ((character = await DatabaseManager_1.database.getCharacter(id, characterName)) && (player = await DatabaseManager_1.database.getPlayer(id))) {
            await interaction.reply({
                content: `You selected ${characterName}`,
                ephemeral: true
            });
        }
        else {
            await interaction.reply({
                content: `${characterName} was not found under your ID, make sure this character exists`,
                ephemeral: true
            });
        }
    },
};
