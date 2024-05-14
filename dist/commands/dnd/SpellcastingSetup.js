"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseManager_1 = require("../../DatabaseManager");
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: (() => {
        const cmd = new SlashCommandBuilder()
            .setName('setup-spellcasting')
            .setDescription('Add proficiencies to your selected character');
        for (let i = 1; i <= 9; i++) {
            cmd.addIntegerOption((option) => option.setName(`spell_level_${i}`)
                .setDescription(`Level ${i} spell slots`)
                .setRequired(true)
                .setMinValue(0));
        }
        return cmd;
    })(),
    async execute(interaction) {
        const options = interaction.options;
        const id = interaction.user.id;
        let character;
        if ((character = await DatabaseManager_1.database.getCurrentCharacter(id))) {
            // get add all proficiencies
            let slots = [];
            for (let i = 1; i <= 9; i++) {
                slots.push(options.getInteger(`spell_level_${i}`));
            }
            character.spell_slots = slots;
            character.spell_slots_avail = slots;
            DatabaseManager_1.database.update(id, character);
            await interaction.reply({ content: `Spell slots have been updated for ${character.name}`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `You need to select a character`, ephemeral: true });
        }
    },
};
