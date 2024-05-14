"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseManager_1 = require("../../DatabaseManager");
const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const path = require("path");
const Character = require("../../Character");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("make-character")
        .setDescription("Creates a new character")
        .addStringOption((option) => option.setName("name")
        .setDescription("The character's name")
        .setRequired(true))
        .addIntegerOption((option) => option.setName("strength")
        .setDescription("The character's strength")
        .setMinValue(0)
        .setMaxValue(20)
        .setRequired(true))
        .addIntegerOption((option) => option.setName("dexterity")
        .setDescription("The character's dexterity")
        .setMinValue(0)
        .setMaxValue(20)
        .setRequired(true))
        .addIntegerOption((option) => option.setName("constitution")
        .setDescription("The character's constitution")
        .setMinValue(0)
        .setMaxValue(20)
        .setRequired(true))
        .addIntegerOption((option) => option.setName("intelligence")
        .setDescription("The character's intelligence")
        .setMinValue(0)
        .setMaxValue(20)
        .setRequired(true))
        .addIntegerOption((option) => option.setName("wisdom")
        .setDescription("The character's wisdom")
        .setMinValue(0)
        .setMaxValue(20)
        .setRequired(true))
        .addIntegerOption((option) => option.setName("charisma")
        .setDescription("The character's charisma")
        .setMinValue(0)
        .setMaxValue(20)
        .setRequired(true))
    // .addAttachmentOption(option =>
    // 	option.setName("image")
    // 		.setDescription("The image for your character")
    // 		.setRequired(true)
    // )
    ,
    async execute(interaction) {
        // get options, make a new character, and get the user's ID
        const options = interaction.options;
        // create character
        let character = new Character();
        let id = interaction.user.id;
        character.name = options.getString("name");
        character.strength = options.getInteger("strength");
        character.dexterity = options.getInteger("dexterity");
        character.constitution = options.getInteger("constitution");
        character.intelligence = options.getInteger("intelligence");
        character.wisdom = options.getInteger("wisdom");
        character.charisma = options.getInteger("charisma");
        character.id = id;
        character.update();
        // add character to the player
        if (await DatabaseManager_1.database.addCharacterToPlayer(id, character)) {
            await interaction.reply({
                content: `Character "${character.name}" created for ${interaction.user}`,
                ephemeral: true
            });
        }
        // character already exists 
        else {
            await interaction.reply({
                content: `Character "${character.name}" already exists.`,
                ephemeral: true
            });
        }
    },
};
// Function to download attachment
// async function downloadAttachment(url, filename) {
// 	const fetch = (await import('node-fetch')).default;
// 	const response = await fetch(url);
// 	const buffer = await response.arrayBuffer();
// 	const directory = path.join(__dirname, '..', '..', 'assets');
// 	const filePath = path.join(directory, filename);
// 	fs.createWriteStream(filePath).write(Buffer.from(buffer));
// }
