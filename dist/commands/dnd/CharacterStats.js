"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseManager_1 = require("../../DatabaseManager");
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("View the stats of your current character"),
    async execute(interaction) {
        let id = interaction.user.id;
        let character;
        if (!(character = await DatabaseManager_1.database.getCurrentCharacter(id))) {
            await interaction.reply("You need to select a character to view their stats");
            return;
        }
        // create the four buttons
        const refreshStatsButton = new ButtonBuilder()
            .setCustomId("refresh_stats")
            .setLabel("Refresh")
            .setStyle(ButtonStyle.Secondary);
        const refreshSpellsButton = new ButtonBuilder()
            .setCustomId("refresh_spells")
            .setLabel("Refresh")
            .setStyle(ButtonStyle.Secondary);
        const spellsButton = new ButtonBuilder()
            .setCustomId("spells")
            .setLabel("View Spells")
            .setStyle(ButtonStyle.Primary);
        const statsButton = new ButtonBuilder()
            .setCustomId("stats")
            .setLabel("View Stats")
            .setStyle(ButtonStyle.Primary);
        let row = new ActionRowBuilder()
            .addComponents(spellsButton, refreshStatsButton);
        const embed = buildStatEmbed(character);
        // initially show the player's stats, the "Spells" button, and "refresh
        const MSG = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });
        // handling the button
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = MSG.createMessageComponentCollector({
            filter
        });
        collector.on('collect', async (i) => {
            // on stats, press refresh
            if (i.customId === "refresh_stats") {
                character = await DatabaseManager_1.database.getCurrentCharacter(id);
                row = new ActionRowBuilder()
                    .addComponents(spellsButton, refreshStatsButton);
                await i.update({ embeds: [buildStatEmbed(character)], components: [row] });
            }
            // on spells, press refresh
            else if (i.customId === "refresh_spells") {
                character = await DatabaseManager_1.database.getCurrentCharacter(id);
                row = new ActionRowBuilder()
                    .addComponents(statsButton, refreshSpellsButton);
                await i.update({ embeds: [buildSpellListEmbed(character)], components: [row] });
            }
            // on stats, press spells
            else if (i.customId === "spells") {
                character = await DatabaseManager_1.database.getCurrentCharacter(id);
                row = new ActionRowBuilder()
                    .addComponents(statsButton, refreshSpellsButton);
                await i.update({ embeds: [buildSpellListEmbed(character)], components: [row] });
            }
            // on spells, press stats
            else if (i.customId === "stats") {
                character = await DatabaseManager_1.database.getCurrentCharacter(id);
                row = new ActionRowBuilder()
                    .addComponents(spellsButton, refreshStatsButton);
                await i.update({ embeds: [buildStatEmbed(character)], components: [row] });
            }
        });
        collector.on('end', collected => {
            console.log(`Collected ${collected.size} interactions.`);
        });
    },
};
function buildSpellListEmbed(character) {
    let fields = [];
    let spell_slots;
    let spell_slots_avail;
    let name_list;
    if (character === null) {
        return {
            color: 0xE1F08B,
            title: `NULL CHARACTER`,
        };
    }
    // find the right spacing per table
    let line_spacing = 6;
    for (let i = 1; i <= 9; i++) {
        line_spacing = Math.max(line_spacing, character.getSpellsOfLevel(i).length);
    }
    for (let i = 1; i <= 9; i++) {
        // get spell slots and avail stuff
        spell_slots = character.spell_slots[i - 1];
        spell_slots_avail = character.spell_slots_avail[i - 1];
        // set up spell list
        // spell slots available and spell slot totals
        name_list = `\`${spell_slots_avail}/${spell_slots}\`\n`;
        // fill with spell names, add filler lines if needed
        let temp = character.getSpellsOfLevel(i).map(spell => spell.name);
        while (temp.length < line_spacing) {
            temp.push('-');
        }
        name_list += temp.join('\n');
        fields.push({ name: `__Level ${i} Spells__`, value: name_list, inline: true });
    }
    return {
        color: 0xE1F08B,
        title: `${character.name}'s Spells`,
        fields: fields
    };
}
function buildTable(character, values, names, showProf) {
    if (character === null)
        return "";
    if (values.length !== names.length)
        return "";
    let retVal = "";
    for (let i = 0; i < values.length; i++) {
        if (character && showProf)
            retVal += character.checkIfProficient(names[i]) ? "⬜ " : "🔳 ";
        retVal += `${names[i]}: **\`${values[i]}\`**\n`;
    }
    return retVal.trimEnd();
}
function signed(num) {
    if (num === 0)
        return `${num}`;
    return Math.sign(num) === -1 ? `-${Math.abs(num)}` : `+${num}`;
}
function buildStatEmbed(character) {
    if (character === null) {
        return {
            color: 0xE1F08B,
            title: `NULL CHARACTER`,
        };
    }
    const primary = buildTable(character, [`${character.current_health} / ${character.health}`, character.armor_class.toString(), signed(character.proficiency_bonus), character.speed.toString(), character.level.toString(), signed(character.initiative_bonus)], ["HP", "AC", "PROF", "SPD", "LVL", "INIT"], false);
    const mainStats = buildTable(character, [
        `${character.strength} (${signed(character.STR)})`,
        `${character.dexterity} (${signed(character.DEX)})`,
        `${character.constitution} (${signed(character.CON)})`,
        `${character.intelligence} (${signed(character.INT)})`,
        `${character.wisdom} (${signed(character.WIS)})`,
        `${character.charisma} (${signed(character.CHA)})`
    ], ["STR", "DEX", "CON", "INT", "WIS", "CHA"], false);
    const savingThrows = buildTable(character, [
        signed(character.strength_saving),
        signed(character.dexterity_saving),
        signed(character.constitution_saving),
        signed(character.intelligence_saving),
        signed(character.wisdom_saving),
        signed(character.charisma_saving)
    ], ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"], true);
    const checks = buildTable(character, [
        signed(character.acrobatics),
        signed(character.animal_handling),
        signed(character.athletics),
        signed(character.arcana),
        signed(character.deception),
        signed(character.history),
        signed(character.insight),
        signed(character.intimidation),
        signed(character.investigation),
        signed(character.medicine),
        signed(character.nature),
        signed(character.perception),
        signed(character.performance),
        signed(character.persuasion),
        signed(character.religion),
        signed(character.sleight_of_hand),
        signed(character.stealth),
        signed(character.survival)
    ], ["Acrobatics", "Animal Handling", "Athletics", "Arcana", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"], true);
    const inventory = buildTable(character, [character.gold.toString(), character.silver.toString(), character.copper.toString()], ["Gold", "Siver", "Copper"], false);
    const spellStuff = buildTable(character, [character.spell_save.toString(), character.spell_attack_modifier.toString(), character.spellcasting_modifier], ["Spell Save", "Attack Bonus", "Modifier"], false);
    return new EmbedBuilder()
        .setColor(0xE1F08B)
        .setTitle(`${character.name}'s Stats`)
        .addFields({ name: "__Primary Info__", value: primary, inline: true }, { name: "\u200B", value: "\u200B", inline: true }, { name: "__Main Stats__", value: mainStats, inline: true }, { name: "__Inventory__", value: inventory, inline: true }, { name: "\u200B", value: "\u200B", inline: true }, { name: "__Spell Info__", value: spellStuff, inline: true }, { name: "__Saving Throws__", value: savingThrows, inline: true }, { name: "\u200B", value: "\u200B", inline: true }, { name: "__Ability Checks__", value: checks, inline: true }
    //			{name: "\u200B", value: "\u200B", inline: true},
    );
}
