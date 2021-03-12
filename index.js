const { Client, Attachment } = require("discord.js");
const fs = require("fs");

const { WATCHING_TOKEN, FORWARDING_TOKEN } = require("./config.json");

const watcher = new Client();
const forwarder = new Client();

watcher.login(WATCHING_TOKEN);
forwarder.login(FORWARDING_TOKEN);

const watchingChannels = fs
    .readFileSync("channels.txt", "utf-8")
    .trim()
    .split("\n")
    .map((str) => {
        return {
            watching: str.trim().split(" ")[0],
            forwarding: str.trim().split(" ")[1],
            postfix: str.trim().split(" ")[2] ? str.trim().split(" ")[2] : "",
        };
    });

console.log(watchingChannels);

watcher.on("ready", async () => {
    console.log(`${watcher.user.username} is ready!`);
    watchingChannels.forEach((channelPair) => {
        const channel = watcher.channels.get(channelPair.watching);
        const collector = channel.createMessageCollector(() => true, {});

        collector.on("collect", async (m) => {
            try {
                const target = forwarder.channels.get(channelPair.forwarding);
                const webhook = await target.createWebhook(
                    m.author.username,
                    m.author.displayAvatarURL
                );
                await webhook.send(
                    m.content.replace(
                        /(<@&([0-9]{18}?)>)|(@everyone)|(@here)/g,
                        channelPair.postfix
                    ),
                    {
                        embeds: m.embeds,
                        files: m.attachments.map(
                            (msgAtt) => new Attachment(msgAtt.proxyURL)
                        ),
                    }
                );
                await webhook.delete();
            } catch (e) {
                //console.log(e);
            }
        });
    });
});

forwarder.on("ready", async () => {
    console.log(`${forwarder.user.username} is ready!`);
});
