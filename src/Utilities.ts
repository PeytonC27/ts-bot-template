import { CommandInteraction } from "discord.js";

async function reply(interaction: CommandInteraction, message: string) {
    interaction.reply({ content: message, ephemeral: true, fetchReply: true }).then(
        msg => setTimeout(() => msg.delete(), 5000)
    );
}

export = { reply };