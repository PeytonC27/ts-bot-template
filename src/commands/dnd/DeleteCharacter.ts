import { CacheType, CommandInteraction, CommandInteractionOptionResolver, SlashCommandIntegerOption, SlashCommandStringOption } from 'discord.js';
import { database } from '../../DatabaseManager';

const { SlashCommandBuilder } = require('discord.js')
const fs = require("fs");
const path = require("path")
const Character = require("../../Character");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("delete-character")
		.setDescription("Deletes a character")
		.addStringOption((option: SlashCommandStringOption) =>
			option.setName("name")
				.setDescription("The character's name")
				.setRequired(true)
		)
	,

	async execute(interaction: CommandInteraction) {
		// get options, make a new character, and get the user's ID
		const options = interaction.options as CommandInteractionOptionResolver<CacheType>;

		// create character
        let player, index;
		let characterName = options.getString("name")!;
		let id = interaction.user.id;

        if ((player = await database.getPlayer(id)) && (index = player.characters.indexOf(characterName)) != -1) {
            // removing character from player array
            player.characters.splice(index, 1);

            // removing character
            await database.removeCharacter(id, characterName);

            // set current character name
            if (player.characters.length > 1)
                player.currentCharacterName = player.characters[0];
            else
                player.currentCharacterName = ""; 


            // update player
            await database.updatePlayer(player);

            await interaction.reply({
				content: `Character "${characterName}" was deleted for ${interaction.user}`,
				ephemeral: true
			});
        }
        else {
            await interaction.reply({
				content: `Could not find character: "${characterName}"`,
				ephemeral: true
			});
        }
	}
	,
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