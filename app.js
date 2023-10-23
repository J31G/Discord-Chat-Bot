const { Client, GatewayIntentBits, Partials } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const activeChats = [];

const upsert = (array, element) => {
    const i = array.findIndex(_element => _element.id === element.id);
    // eslint-disable-next-line no-param-reassign
    if (i > -1) array[i] = element;
    else array.push(element);
};

const discordClient = new Client({ intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
], partials: [Partials.Channel] });

discordClient.on('ready', () => console.log(`Logged in as ${discordClient?.user?.tag}!`));

discordClient.on('messageCreate', async (message) => {
    // Check if message is from a bot (Important to stop loops)
    if (message.author.bot) return;

    // Only work in a set channel
    if (message?.channel?.id !== '1166064033632366643') return;

    // Get User token
    const userToken = activeChats.filter((user) => user?.id === message?.author?.id)[0]?.token;

    // Send chat message to API
    const reply = await axios.get(process.env.BOT_URL, {
        params: {
            key: process.env.BOT_API_KEY,
            input: message?.content,
            cs: userToken,
            cb_settings_tweak1: 0,
            cb_settings_tweak2: 100,
            cb_settings_tweak3: 100
        }
    });

    // Update Array
    upsert(activeChats, {
        id: message?.author?.id,
        token: reply?.data?.cs
    });

    // Reply to user
    message?.reply({
        content: reply?.data?.output
    });
});

discordClient.login(process.env.DISCORD_TOKEN);