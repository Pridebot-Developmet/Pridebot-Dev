require("dotenv").config();
const { token, databaseToken, topggToken } = process.env;
const { connect } = require("mongoose");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const fs = require("fs");
const { AutoPoster } = require("topgg-autoposter");

const botStartTime = Math.floor(Date.now() / 1000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
});
client.commands = new Collection();
client.commandArray = [];
client.botStartTime = botStartTime;

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
  const functionFolders = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFolders)
    require(`./functions/${folder}/${file}`)(client);
}

const eventHandlers = {
  updateChannelName: require("./events/client/statsTracker.js"),
  handleGuildCreate: require("./events/client/guildCreate.js"),
  handleGuildDelete: require("./events/client/guildDelete.js"),
  handleReportFeedback: require("./events/client/modals.js"),
};

const userprofile = require('./commands/Profile/userprofile.js');
const usergaydar = require("./commands/Fun/usergaydar.js");
const usertransdar = require("./commands/Fun/usertransdar.js");

client.on(Events.GuildCreate, (guild) =>
  eventHandlers.handleGuildCreate(client, guild)
);
client.on(Events.GuildDelete, (guild) =>
  eventHandlers.handleGuildDelete(client, guild)
);
client.on("interactionCreate", (interaction) => {
  eventHandlers.handleReportFeedback(client, interaction);
});

setInterval(() => eventHandlers.updateChannelName(client), 5 * 60 * 1000);
client.once("ready", () => {
  eventHandlers.updateChannelName(client);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isUserContextMenuCommand()) {
    if (interaction.commandName === "User Profile") {
      await userprofile.execute(interaction);
    }
    if (interaction.commandName === "User Gaydar") {
      await usergaydar.execute(interaction);
    }
    if (interaction.commandName === "User Transdar") {
      await usertransdar.execute(interaction);
    }
  }
});
const ap = AutoPoster(topggToken, client);
ap.on("posted", () => {
  console.log("Posted stats to Top.gg!");
});

const commandsPath = "./src/commands";
const clientId = "1101256478632972369";
client.handleCommands(commandsPath, clientId);
client.handleEvents();
client.login(token);

connect(databaseToken)
  .then(() => console.log("Connected to MongoDB"))
  .catch(console.error);


//Vote Webhooks API
const express = require("express")
const app = express()

const port = 2610;

app.listen(port, () => {
  console.log(`API is running on port ${port}`)
})

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.post("/wumpus-votes", (req, res) => {

  let userid = req.body.userId;
  let botid = req.body.botId;

  //Add whatever you want to do when there was a vote here
  console.log(userid + " just voted for " + botid)

  return res.status(200).send("Success!")
})

//http://youripadress:port/wumpus-votes