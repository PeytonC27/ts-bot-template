import { CacheType, CommandInteraction, CommandInteractionOption, CommandInteractionOptionResolver, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { database } from "../../DatabaseManager";
import Spell from "../../Spell";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-spell")
        .setDescription("Adds an existing spell in the cache")
        .addStringOption((option: SlashCommandStringOption) =>
            option.setName("spell_name")
                .setDescription("The spell you want to add")
                .setRequired(true))
    ,

    async execute(interaction: CommandInteraction) {

        const options = interaction.options as CommandInteractionOptionResolver<CacheType>;

        // find the spell
        let userOption: string = (options.getString("spell_name") as string).toLowerCase();
        let id = interaction.user.id;

        let spell;

        // if the user's input doesn't map to an existing spell
        if (!(spell = await database.getSpell(userOption))) {
            await interaction.reply({ content: `Could not find spell: ${userOption}. Make sure your spelling is correct (capitalization does not matter).`, ephemeral: true });
            return;
        }        

        // try adding the spell to the character
        if ((await database.addSpellToCurrentCharacter(id, spell))) {
            await interaction.reply({ content: `Successfull added spell: ${spell.name}!`, ephemeral: true });
        }
        // user tried to add a spell they already have
        else {
            await interaction.reply({ content: `You already have spell "${spell.name} equipped`, ephemeral: true });
            return;
        }
    },
};