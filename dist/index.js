"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const rest_1 = require("@discordjs/rest");
const v10_1 = require("discord-api-types/v10");
const DatabaseManager_1 = require("./DatabaseManager");
const fs = require("fs");
const path = require("path");
const env = require('dotenv').config();
// custom MyClient client
class MyClient extends discord_js_1.Client {
    commands;
    constructor(options) {
        super(options);
        this.commands = new discord_js_1.Collection();
    }
}
const rest = new rest_1.REST().setToken(env.parsed["CLIENT_TOKEN"]);
const client = new MyClient({
    intents: [
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMessageReactions
    ]
});
const commands = [];
client.commands = new discord_js_1.Collection();
const guildID = "1015374977551319061";
const clientID = "1226637655211773993";
// registering slash commands
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
// ==================================================================== //
// ==================== REGISTERING SLASH COMMANDS ==================== //
// ==================================================================== //
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
// ============================================================ //
// ==================== DEPLOYING COMMANDS ==================== //
// ============================================================ //
(async () => {
    try {
        // connecting to the database
        // refreshing commands
        //console.log(`Started refreshing ${client.commands.size} application (/) commands.`);
        // reloading commands
        const data = await rest.put(v10_1.Routes.applicationGuildCommands(clientID, guildID), { body: commands });
        await DatabaseManager_1.database.connect();
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
    catch (error) {
        console.error(error);
    }
})();
client.login(env.parsed["CLIENT_TOKEN"]);
// ======================================================== //
// ==================== BOT LOGGING IN ==================== //
// ======================================================== //
client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});
// ========================================================= //
// ==================== BOT LOGGING OFF ==================== //
// ========================================================= //
client.on("close", async () => {
    await DatabaseManager_1.database.close();
});
process.on('SIGINT', () => {
    DatabaseManager_1.database.close().then(() => process.exit(0));
});
// ========================================================= //
// ==================== ON MESSAGE SEND ==================== //
// ========================================================= //
client.on('messageCreate', async (message) => {
    if (message.author.bot)
        return;
});
// ========================================================== //
// ==================== ON SLASH COMMAND ==================== //
// ========================================================== //
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    // if not a modal, then ignore non chat-input commands
    if (!interaction.isChatInputCommand())
        return;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
        await command.execute(interaction);
        let opts = "";
        interaction.options.data.forEach(opt => opts += `${opt.name}: ${opt.value} `);
        console.log(`Slash command called by ${interaction.user.id} - /${interaction.commandName} ${opts}`);
    }
    catch (error) {
        console.log(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});
