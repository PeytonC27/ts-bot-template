import { CacheType, CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { database } from "../../DatabaseManager";
import Spell from "../../Spell";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("cast")
		.setDescription("Cast a spell")
		.addStringOption((option: SlashCommandStringOption) =>
            option.setName("spell-name")
                .setDescription("The name of the spell to cast")
                .setRequired(true))
	,
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver<CacheType>;
        
        let spellName = options.getString("spell-name")!;
        let id = interaction.user.id;

        let character, spell;
        if ((character = await database.getCurrentCharacter(id)) && (spell = character.tryCastSpell(spellName))) {
            await database.update(id, character);
            await interaction.reply({ embeds: [buildEmbedWithSpell(spell)], ephemeral: true });
        }
        else {
            await interaction.reply({ content: "Spellcasting failed", ephemeral: true })
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