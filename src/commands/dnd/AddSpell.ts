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

        // if the user's input doesn't map to an existing spell
        if (!await database.spellExists(userOption)) {
            await interaction.reply({ content: `Could not find spell: ${userOption}. Make sure your spelling is correct (capitalization does not matter).`, ephemeral: true });
            return;
        }

        // if the user isn't registered
        if (!await database.playerExists(id)) {
            await interaction.reply({ content: `You need to make a character before you can give yourself spells!`, ephemeral: true });
            return;
        }

        let spell: Spell | null = await database.getSpell(userOption);

        // if the current character is null (should be almost impossible, only if the user deletes all their characters)
        if (await database.getCurrentCharacter(id) === null) {
            await interaction.reply({ content: `You do not have a character selected, please select one`, ephemeral: true });
            return;
        }

        // try adding the spell to the character
        if ((await database.addSpellToCurrentCharacter(id, spell!))) {
            await interaction.reply({ content: `Successfull added spell: ${spell!.name}!`, ephemeral: true });
        }
        // user tried to add a spell they already have
        else {
            await interaction.reply({ content: `You already have spell "${spell!.name} equipped`, ephemeral: true });
            return;
        }
    },
};