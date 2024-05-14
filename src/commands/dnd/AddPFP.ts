import { CacheType, CommandInteraction, CommandInteractionOptionResolver, SlashCommandAttachmentOption, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { database } from "../../DatabaseManager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("add-pfp")
		.setDescription("Adds a pfp to your current character")
		.addAttachmentOption((option: SlashCommandAttachmentOption) =>
            option.setName("image")
                .setDescription("The pfp to use")
                .setRequired(true))
	,
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver<CacheType>;

		//let character = new Character();
		let id = interaction.user.id;
		let attachment = options.getAttachment("image")!;
        let character;

		//character.image_url = `${id}_${attachmentName}`;
		if ((character = await database.getCurrentCharacter(id)) && await downloadAttachment(attachment.url, id, character.name)) {
            await interaction.reply({ content: "Successfully saved image into mongodb", ephemeral: true });
        }
        else {
            await interaction.reply({ content: "Image failed to save", ephemeral: true });
        }
	},
};


// Function to download attachment
async function downloadAttachment(url: string, id: string, name: string) {
	const fetch = (await import('node-fetch')).default;
	const response = await fetch(url);
	const buffer = await response.arrayBuffer();

	const imageData = Buffer.from(buffer);

	return await database.addProfilePicture(imageData, id, name);
}