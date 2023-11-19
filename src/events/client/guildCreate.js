const { EmbedBuilder, ChannelType } = require("discord.js");

module.exports = async (client, guild) => {
  const channel = await client.channels.cache.get("1112590962867310602");
  const name = guild.name;
  const serverID = guild.id;
  const memberCount = guild.memberCount;
  const ownerID = guild.ownerId;
  const owner = await client.users.cache.get(ownerID);
  const ownerName = owner.username;
  const serverBoost = guild.premiumSubscriptionCount;
  const boostTier = guild.premiumTier;
  const channelamount = guild.channels.cache.size;

  const voiceChannels = guild.channels.cache.filter(
    (channel) => channel.type === ChannelType.GuildVoice
  ).size;
  const textChannels = guild.channels.cache.filter(
    (channel) => channel.type === ChannelType.GuildText
  ).size;
  const announceChannels = guild.channels.cache.filter(
    (channel) => channel.type === ChannelType.GuildAnnouncement
  ).size;
  const stageChannels = guild.channels.cache.filter(
    (channel) => channel.type === ChannelType.GuildStageVoice
  ).size;
  const forumChannels = guild.channels.cache.filter(
    (channel) => channel.type === ChannelType.GuildForum
  ).size;

  const currentGuildCount = client.guilds.cache.size;
  let totalUserCount = 0;
  client.guilds.cache.forEach((guild) => {
    totalUserCount += guild.memberCount;
  });

  const invchannel = await guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText
  );
  if (!channel) return;

  const inviteOptions = {
    temporary: false, // Set to true if you want a temporary invite
    maxUses: 0, // Set to a number if you want to limit the number of uses
    maxAge: 0, // Set to a number in seconds if you want to limit the invite's age
    unique: true, // Set to true if you want a unique invite
  };

  const invite = await invchannel.createInvite(inviteOptions);

  const embed = new EmbedBuilder()
    .setColor(0xff00ae)
    .setTitle(`👋 New Server Joined`)
    .setFields(
      {
        name: "<:_:1112602480128299079> Server Info",
        value: `**Server Name:** [**${name}**](${
          invite.url
        }) (\`${serverID}\`) \n**Server Owner:** <@${ownerID}> (\`${ownerName} / ${ownerID}\`) \n**Member Count:** \`${memberCount}\` \n**Channels:** \`${channelamount}\` \n • Text: \`${textChannels}\` \n • Voice: \`${voiceChannels}\` \n • Forum: \`${forumChannels}\` \n • Announcement: \`${announceChannels}\` \n • Stage: \`${stageChannels}\` \n**Boosts:** \`${serverBoost}/14\` (\`Level ${boostTier}\`) \n**Server Creation:** <t:${parseInt(
          guild.createdTimestamp / 1000
        )}:F> (<t:${parseInt(guild.createdTimestamp / 1000)}:R>)`,
      },
      {
        name: "<:_:1112602480128299079> Bot Info",
        value: `**Total # of guild:** \`${currentGuildCount}\` \n**Total user count**: \`${totalUserCount}\``,
      }
    )
    .setTimestamp()
    .setFooter({ text: `${serverID}` });

  await channel.send({ embeds: [embed] });
};
