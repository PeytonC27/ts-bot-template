"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("template")
        .setDescription("template")
        .addStringOption((option) => option.setName("template")
        .setDescription("template")
        .setRequired(true)),
    async execute(interaction) {
        const options = interaction.options;
        await interaction.reply("template");
    },
};
