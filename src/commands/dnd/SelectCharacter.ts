import { CacheType, CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { database } from "../../DatabaseManager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("select")
		.setDescription("Selects a different character you own")
		.addStringOption((option: SlashCommandStringOption) =>
            option.setName("character-name")
                .setDescription("The name of the character you want to switch to")
                .setRequired(true))
	,
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver<CacheType>;
		
        // get data
        let characterName = options.getString("character-name")!;
        let id = interaction.user.id;

        // try changing the character
        if (await database.changeCurrentCharacter(id, characterName)) {
            await interaction.reply( {
                content: `You selected ${characterName}`,
                ephemeral: true
            });
        }
        else {
            await interaction.reply( {
                content: `${characterName} was not found under your ID, make sure this character exists`,
                ephemeral: true
            });
        }
	},
};