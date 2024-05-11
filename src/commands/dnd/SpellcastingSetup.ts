import { CacheType, CommandInteraction, CommandInteractionOptionResolver, SlashCommandIntegerOption } from "discord.js";
import { database } from "../../DatabaseManager";

const {SlashCommandBuilder} = require('discord.js')

module.exports = {
	data: (() => {
		const cmd = new SlashCommandBuilder()
			.setName('setup-spellcasting')
			.setDescription('Add proficiencies to your selected character');

		for (let i = 1; i <= 9; i++) {
			cmd.addIntegerOption((option: SlashCommandIntegerOption) =>
				option.setName(`spell_level_${i}`)
					.setDescription(`Level ${i} spell slots`)
					.setRequired(true)
					.setMinValue(0))
		}
		return cmd;
	})(),
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver<CacheType>;
        const id = interaction.user.id;

		// get add all proficiencies
        let slots: number[] = [];
		for (let i = 1; i <= 9; i++) {
			slots.push(options.getInteger(`spell_level_${i}`)!);
		}

        const character = await database.pushSpellcastingData(id, slots);
		await interaction.reply({content: `Spell slots have been updated for ${character.name}`, ephemeral: true});
	},
};