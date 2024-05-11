import { CacheType, CommandInteraction, CommandInteractionOptionResolver, SlashCommandStringOption } from "discord.js";
import { database } from "../../DatabaseManager";

const {SlashCommandBuilder} = require('discord.js')

module.exports = {
	data: (() => {
		const cmd = new SlashCommandBuilder()
			.setName('add-proficiencies')
			.setDescription('Add proficiencies to your selected character');

		for (let i = 1; i <= 10; i++) {
			cmd.addStringOption((option: SlashCommandStringOption) =>
				option.setName(`proficiency${i}`)
					.setDescription(`Proficiency ${i} that you want to add`)
					.setRequired(i === 1)
					.addChoices(
						    {name: 'Strength', value: 'Strength'},
						    {name: 'Dexterity', value: 'Dexterity'},
						    {name: 'Constitution', value: 'Constitution'},
						    {name: 'Intelligence', value: 'Intelligence'},
						    {name: 'Wisdom', value: 'Wisdom'},
						    {name: 'Charisma', value: 'Charisma'},
						    {name: 'Acrobatics', value: 'Acrobatics'},
						    {name: 'Animal Handling', value: 'Animal Handling'},
						    {name: 'Arcana', value: 'Arcana'},
						    {name: 'Athletics', value: 'Athletics'},
						    {name: 'Deception', value: 'Deception'},
						    {name: 'History', value: 'History'},
						    {name: 'Insight', value: 'Insight'},
						    {name: 'Intimidation', value: 'Intimidation'},
						    {name: 'Investigation', value: 'Investigation'},
						    {name: 'Medicine', value: 'Medicine'},
						    {name: 'Nature', value: 'Nature'},
						    {name: 'Perception', value: 'Perception'},
						    {name: 'Performance', value: 'Performance'},
						    {name: 'Persuasion', value: 'Persuasion'},
						    {name: 'Religion', value: 'Religion'},
						    {name: 'Sleight of Hand', value: 'Sleight of Hand'},
						    {name: 'Stealth', value: 'Stealth'},
						    {name: 'Survival', value: 'Survival'}
					));
		}
		return cmd;
	})(),
	async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver<CacheType>;
        let id = interaction.user.id

        let character = await database.getCurrentCharacter(id);

		// get add all proficiencies
		let profs_added = []
		for (let i = 1; i <= 10; i++) {
			const proficiency = options.getString(`proficiency${i}`);
			if (proficiency) {
				profs_added.push(proficiency);
                character.proficiencies.push(proficiency);
			}
		}

		profs_added = [...new Set(profs_added)];
        character.update();
        await database.update(id, character);

		await interaction.reply({ content: `Proficiencies have been added to ${character.name}: ${profs_added.join(', ')}`, ephemeral: true });
	},
};