import { APIApplicationCommandOptionChoice, CacheType, CommandInteraction, CommandInteractionOptionResolver, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import { database, CollectionUpdateOperations } from "../../DatabaseManager";

const { SlashCommandBuilder } = require('discord.js')

const commonOptions = {
	options: [

	]
}
const subcommandNames: string[] = ["set", "increase", "decrease"];

module.exports = {
	data: (() => {
		const cmd = new SlashCommandBuilder()
			.setName("value")
			.setDescription("Modify a value in your current character");

		for (const subcommandName of subcommandNames) {
			cmd.addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
				subcommand.setName(subcommandName)
					.setDescription(`${subcommandName} the value`)
					.addStringOption((option: SlashCommandStringOption) =>
						option.setName("stat")
							.setDescription(`Stat to ${subcommandName}`)
							.setRequired(true)
							.addChoices(
								{ name: 'Speed', value: 'speed' },
								{ name: 'Strength', value: 'strength' },
								{ name: 'Dexterity', value: 'dexterity' },
								{ name: 'Constitution', value: 'constitution' },
								{ name: 'Intelligence', value: 'intelligence' },
								{ name: 'Wisdom', value: 'wisdom' },
								{ name: 'Charisma', value: 'charisma' },
								{ name: 'Max Health', value: 'health' },
								{ name: 'Proficiency', value: 'proficiency_bonus' },
								{ name: 'Current Health', value: 'current_health' },
								{ name: 'Temp Health', value: "temp_health" },
								{ name: 'Level', value: 'level' },
								{ name: 'Gold', value: 'gold' },
								{ name: 'Silver', value: 'silver' },
								{ name: 'Copper', value: 'copper' },
							)
					)

					.addIntegerOption((option: SlashCommandIntegerOption) =>
						option.setName('value')
							.setDescription('Amount to increase')
							.setRequired(true)
					)
			)
		}

		return cmd;
	})()
	,
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver<CacheType>;

		let id = interaction.user.id;
		let stat = options.getString('stat')!;
		let value = options.getInteger('value')!;

		let operationText = "";
		let character;

		// user has a selected character
		if ((character = await database.getCurrentCharacter(id))) {
			// setting a value
			if (options.getSubcommand() === "set") {
				character[stat] = value;
			}
			// decreasing a value
			else if (options.getSubcommand() === "decrease") {
				character[stat] -= value;
				operationText = "Decreased";
			}
			// increasing a value
			else {
				character[stat] += value;
				operationText = "Increased";
			}
	
			database.update(id, character);
			await interaction.reply({ content: `${operationText} ${beautifyText(stat)} ${operationText === "Set" ? "to" : "by"} ${value} for ${character.name}`, ephemeral: true });
		}
		// user hasn't selected
		else {
			await interaction.reply({ content: `You need to select a character`, ephemeral: true });
		}
	},
};

function beautifyText(text: string) {
	return text.replace(/(\w+)/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}