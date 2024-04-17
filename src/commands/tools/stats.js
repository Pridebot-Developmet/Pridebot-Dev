require("dotenv").config();
const { githubToken, apikey } = process.env;
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { calculatePing } = require("../../events/client/ping");
const axios = require("axios");
const chalk = require("chalk");
const CommandUsage = require("../../../mongo/models/usageSchema");
const Profile = require("../../../mongo/models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Get the bot's and discord stats"),

  async execute(interaction, client) {
    await interaction.deferReply();
    const botping = await calculatePing(interaction);

    const estDate = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    console.log(
      chalk.white.bold(
        `-------------------------- \n/stats \nServer: ${interaction.guild.name} (${interaction.guild.id}) \nUser: ${interaction.user.tag} (${interaction.user.id}) \nTime: ${estDate} (EST) \n--------------------------`
      )
    );

    try {
      const repoOwner = "Sdriver1";
      const repoName = "Pridebot";

      const commitsResponse = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      const commitsData = commitsResponse.data;
      const commitCount = commitsData.length;
      const devcommitCount = commitsData.length - 50;

      let commitTens = "0";
      let commitOnes = "0";

      let commitsText = `**Commit Count:** ${commitCount}\n`;

      if (commitCount > 0) {
        const latestCommit = commitsData[0];
        const latestCommitDate = new Date(
          latestCommit.commit.author.date
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        const latestCommitLink = latestCommit.html_url;
        const latestCommitTitle = latestCommit.commit.message;
        const commitCountStr = devcommitCount.toString();
        commitTens = commitCountStr.length > 1 ? commitCountStr[0] : "0";
        commitOnes =
          commitCountStr.length > 0
            ? commitCountStr[commitCountStr.length - 1]
            : "0";

        commitsText += `${latestCommitDate} - [${latestCommitTitle}](${latestCommitLink})`;
      }
      //---------------------------------------------------------------------------------------------------
      const currentGuildCount = client.guilds.cache.size;
      let totalUserCount = 0;
      client.guilds.cache.forEach((guild) => {
        totalUserCount += guild.memberCount;
      });

      const formattedTotalUserCount = totalUserCount.toLocaleString();
      //--------------------------------------------------------------------------------

      async function getRegisteredCommandsCount(client) {
        if (!client.application) {
          console.error("Client application is not ready.");
          return 0;
        }
        const commands = await client.application.commands.fetch();
        return commands.size;
      }

      const CommandsCount = (await getRegisteredCommandsCount(client)) + 2;

      //--------------------------------------------------------------------------------

      const profileAmount = await Profile.countDocuments();

      //--------------------------------------------------------------------------------

      const usages = await CommandUsage.find({}).sort({ count: -1 });
      const totalUsage = usages.reduce((acc, cmd) => acc + cmd.count, 0);

      //--------------------------------------------------------------------------------

      const startTimeTimestamp = `<t:${client.botStartTime}:f>`;

      const ping = `**Ping**: \`${botping}ms\` \n**API Latency**: \`${client.ws.ping}\``;

      const up = `\n**Uptime:** \`${formatUptime(
        process.uptime()
      )} \` \n**Start Time:** ${startTimeTimestamp}`;

      const botstats = `**Guilds:** \`${currentGuildCount}\` \n**Users:** \`${formattedTotalUserCount}\``;

      const commandstats = `**Commands:** \`${CommandsCount}\` \n**Profiles:** \`${profileAmount}\` \n**Total Usage:** \`${totalUsage}\``;

      const botversion = `**Version:** \`2.${commitTens}.${commitOnes}\` \n **Node.js Version:** \`${process.version}\` \n **Discord.js Version:** \`v${client.version}\` \n **MongoDB Version:** \`v4.4.6\``;

      try {
        const embed = new EmbedBuilder().setColor(0xff00ae).addFields(
          {
            name: "<:_:1108228682184654908> __Bot Stats__",
            value: botstats,
            inline: true,
          },
          {
            name: "<:_:1108228682184654908> __Command Stats__",
            value: commandstats,
            inline: true,
          },
          {
            name: "<:_:1193823319246524486> __Bot Stats__",
            value: botversion,
            inline: true,
          },
          {
            name: "<:_:1108417509624926228> __Bot Uptime__",
            value: up,
            inline: true,
          },
          {
            name: "<:_:1191202343505645690> __Bot Ping__",
            value: ping,
            inline: true,
          },
        );

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.error("Error sending edit reply:", error);
        if (error.code !== "InteractionAlreadyReplied") {
          await interaction.followUp({
            content: "There was an error processing your request.",
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      console.error("Error deferring reply:", error);
    }
  },
};

function formatUptime(time) {
  const timeUnits = {
    day: 3600 * 24,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  return Object.entries(timeUnits)
    .reduce((acc, [unit, unitSeconds]) => {
      const amount = Math.floor(time / unitSeconds);
      time -= amount * unitSeconds;
      return amount ? [...acc, `${amount} ${unit}(s)`] : acc;
    }, [])
    .join(" ");
}

function formatTimestamp(timestamp) {
  const dateObj = new Date(timestamp);
  if (isNaN(dateObj)) {
    const dateMatch = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(timestamp);
    if (dateMatch) {
      const [_, year, month, day, hour, minute] = dateMatch;
      return `${year}-${padZero(month)}-${padZero(day)} ${padZero(
        hour
      )}:${padZero(minute)}`;
    }
    return "Invalid Date";
  }
  return dateObj.toLocaleString();
}

function padZero(value) {
  return value.toString().padStart(2, "0");
}
