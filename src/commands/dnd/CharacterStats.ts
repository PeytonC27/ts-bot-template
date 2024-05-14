import { AttachmentBuilder, CommandInteraction, Embed, EmbedBuilder, Interaction } from 'discord.js';
import { database } from "../../DatabaseManager";
import Character = require("../../Character");
import path = require('path');
import fs = require("fs");
import { Buffer } from "buffer"
import { Binary } from 'mongodb';

const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')


module.exports = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("View the stats of your current character")
	,
	async execute(interaction: CommandInteraction) {
		let id: string = interaction.user.id;


		let character;
		if (!(character = await database.getCurrentCharacter(id))) {
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
			.addComponents(spellsButton, refreshStatsButton)


		const pfpURL = interaction.user.avatarURL();
		const embed = buildStatEmbed(character, pfpURL);

		// initially show the player's stats, the "Spells" button, and "refresh
		const MSG = await interaction.reply({
			embeds: [embed],
			components: [row],
			fetchReply: true
		});

		// handling the button
		const filter = (i: Interaction) => i.user.id === interaction.user.id;

		const collector = MSG.createMessageComponentCollector({
			filter
		});

		collector.on('collect', async (i) => {

			character = await database.getCurrentCharacter(id);
			let embed: EmbedBuilder, components;

			// pressing refresh on stats page
			if (i.customId === "refresh_stats") {
				embed = buildStatEmbed(character!, pfpURL);
				components = new ActionRowBuilder()
					.addComponents(spellsButton, refreshStatsButton);
			}
			// pressing stats on spells page
			else if (i.customId === "stats") {
				embed = buildStatEmbed(character!, pfpURL);
				components = new ActionRowBuilder()
					.addComponents(spellsButton, refreshStatsButton);
			}
			// pressing refresh on spells page
			else if (i.customId === "refresh_spells") {
				embed = buildSpellListEmbed(character!, pfpURL);
				components = new ActionRowBuilder()
					.addComponents(statsButton, refreshSpellsButton);
			}
			// pressing spells on stats page
			else {
				embed = buildSpellListEmbed(character!, pfpURL);
				components = new ActionRowBuilder()
					.addComponents(statsButton, refreshSpellsButton);
			}

			await i.update({ embeds: [embed], components: [components] });

			// // on stats, press refresh
			// if (i.customId === "refresh_stats") {
			// 	embed = 
			// 	character = await database.getCurrentCharacter(id);
			// 	row = new ActionRowBuilder()
			// 		.addComponents(spellsButton, refreshStatsButton);
			// 	await i.update({ embeds: [buildStatEmbed(character!, pfpURL)], components: [row], files: [pfp] });
			// }
			// // on spells, press refresh
			// else if (i.customId === "refresh_spells") {
			// 	character = await database.getCurrentCharacter(id);
			// 	row = new ActionRowBuilder()
			// 		.addComponents(statsButton, refreshSpellsButton);
			// 	await i.update({ embeds: [buildSpellListEmbed(character!, pfpURL)], components: [row] });
			// }
			// // on stats, press spells
			// else if (i.customId === "spells") {
			// 	character = await database.getCurrentCharacter(id);
			// 	row = new ActionRowBuilder()
			// 		.addComponents(statsButton, refreshSpellsButton);
			// 	await i.update({ embeds: [buildSpellListEmbed(character!, pfpURL)], components: [row] });
			// }
			// // on spells, press stats
			// else if (i.customId === "stats") {
			// 	character = await database.getCurrentCharacter(id);
			// 	row = new ActionRowBuilder()
			// 		.addComponents(spellsButton, refreshStatsButton);
			// 	await i.update({ embeds: [buildStatEmbed(character!, pfpURL)], components: [row] });
			// }
		});

		collector.on('end', collected => {
			console.log(`Collected ${collected.size} interactions.`);
		});
	},
};

async function findCharacterPFP(id: string): Promise<AttachmentBuilder | null> {
	let imageObject;

	if ((imageObject = await database.getProfilePicture(id))) {
		
		const buffer = Buffer.from(imageObject.binary.buffer);

		try {
			// Create an AttachmentBuilder using the imageData buffer
			//const attachment = new AttachmentBuilder(imageData, { name: "character-pfp.jpg" });
			const attachment = new AttachmentBuilder(buffer, { name: "image-attachment.png" });
			const filePath = path.join(__dirname, 'test-image.jpg');
			await fs.promises.writeFile(filePath, buffer);
			console.log('Image saved successfully!');

			// Return the URL for the embed image using AttachmentBuilder
			return attachment;
		} catch (error) {
			console.error('Error creating attachment:', error);
			return null;
		}
	}

	return null;
}

function buildSpellListEmbed(character: Character, url: string | null): EmbedBuilder {
	let fields = [];
	let spell_slots;
	let spell_slots_avail;
	let name_list;

	if (character === null) {
		return new EmbedBuilder()
			.setColor(0xe1f08b)
			.setTitle("NULL CHARACTER");
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

	return new EmbedBuilder()
		.setColor(0xE1F08B)
		.setTitle(`${character.name}'s Spells`)
		.setFields(fields)
		.setThumbnail(url);
}

function buildTable(character: Character, values: string[], names: string[], showProf: boolean) {

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

function signed(num: number) {

	if (num === 0)
		return `${num}`;

	return Math.sign(num) === -1 ? `-${Math.abs(num)}` : `+${num}`;
}

function buildStatEmbed(character: Character, url: string | null): EmbedBuilder {
	if (character === null) {
		if (character === null) {
			return new EmbedBuilder()
				.setColor(0xe1f08b)
				.setTitle("NULL CHARACTER");
		}
	}

	const primary = buildTable(
		character,
		[`${character.current_health} / ${character.health}`, character.armor_class.toString(), signed(character.proficiency_bonus), character.speed.toString(), character.level.toString(), signed(character.initiative_bonus)],
		["HP", "AC", "PROF", "SPD", "LVL", "INIT"],
		false
	);

	const mainStats = buildTable(
		character,
		[
			`${character.strength} (${signed(character.STR)})`,
			`${character.dexterity} (${signed(character.DEX)})`,
			`${character.constitution} (${signed(character.CON)})`,
			`${character.intelligence} (${signed(character.INT)})`,
			`${character.wisdom} (${signed(character.WIS)})`,
			`${character.charisma} (${signed(character.CHA)})`],
		["STR", "DEX", "CON", "INT", "WIS", "CHA"],
		false
	);
	const savingThrows = buildTable(
		character,
		[
			signed(character.strength_saving),
			signed(character.dexterity_saving),
			signed(character.constitution_saving),
			signed(character.intelligence_saving),
			signed(character.wisdom_saving),
			signed(character.charisma_saving)
		],
		["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
		true
	);
	const checks = buildTable(
		character,
		[
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
		],
		["Acrobatics", "Animal Handling", "Athletics", "Arcana", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"],
		true
	);
	const inventory = buildTable(
		character,
		[character.gold.toString(), character.silver.toString(), character.copper.toString()],
		["Gold", "Siver", "Copper"],
		false
	);
	const spellStuff = buildTable(
		character,
		[character.spell_save.toString(), character.spell_attack_modifier.toString(), character.spellcasting_modifier],
		["Spell Save", "Attack Bonus", "Modifier"],
		false
	);

	return new EmbedBuilder()
		.setColor(0xE1F08B)
		.setTitle(`${character.name}'s Stats`)
		.addFields(
			{ name: "__Primary Info__", value: primary, inline: true },
			{ name: "\u200B", value: "\u200B", inline: true },
			{ name: "__Main Stats__", value: mainStats, inline: true },

			{ name: "__Inventory__", value: inventory, inline: true },
			{ name: "\u200B", value: "\u200B", inline: true },
			{ name: "__Spell Info__", value: spellStuff, inline: true },

			{ name: "__Saving Throws__", value: savingThrows, inline: true },
			{ name: "\u200B", value: "\u200B", inline: true },
			{ name: "__Ability Checks__", value: checks, inline: true }

			//			{name: "\u200B", value: "\u200B", inline: true},
		)
		.setThumbnail(url);
}