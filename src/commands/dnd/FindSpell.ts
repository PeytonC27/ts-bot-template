import { CacheType, CommandInteraction, CommandInteractionOption, CommandInteractionOptionResolver, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { database } from "../../DatabaseManager";
import Spell from "../../Spell";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("find-spell")
        .setDescription("Adds an existing spell in the cache")
        .addStringOption((option: SlashCommandStringOption) =>
            option.setName("spell_name")
                .setDescription("The spell you want to add")
                .setRequired(true))
    ,

    async execute(interaction: CommandInteraction) {

        const options = interaction.options as CommandInteractionOptionResolver<CacheType>;

        // get the spell name
        let userOption: string = (options.getString("spell_name") as string).toLowerCase();
        let spell: Spell | null = await database.getSpell(userOption);

        // if the spell is null, move on
        if (spell === null) {
            await interaction.reply({
                content: `Could not find a spell called "${userOption}"`,
                ephemeral: true
            });
            return;
        }

        // if the spell exists, show the data
        else {
            await interaction.reply({ embeds: [buildEmbedWithSpell(spell)] });
        }
    },
};

function buildEmbedWithSpell(spell: Spell) {
    return {
        color: 0xE1F08B,
        title: `${spell.name}`,
        footer: { text: spell.source },
        fields: [
            { name: "", value: `*(${spell.numericalLevel}) ${spell.level}*` },
            { name: "", value: `**Casting Time**: ${spell.casting_time}` },
            { name: "", value: `**Range**: ${spell.range}` },
            { name: "", value: `**Components**: ${spell.components}` },
            { name: "", value: `**Duration**: ${spell.duration}` },
            { name: "", value: "======================================================================" },
            { name: "", value: `${spell.description}` + "\n\n***At Higher Levels***. " + spell.at_higher_levels },
            { name: "", value: "" },
            { name: "", value: "" },
        ],
    };
}