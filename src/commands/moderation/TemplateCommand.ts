import { CacheType, CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("template")
		.setDescription("template")
		.addStringOption((option: SlashCommandStringOption) =>
            option.setName("template")
                .setDescription("template")
                .setRequired(true))
	,
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver<CacheType>;
		await interaction.reply("template");
	},
};