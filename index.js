const { Client } = require("discord.js");
const fs = require('fs');

const { WATCHING_TOKEN, FORWARDING_TOKEN } = require('./config.json');

const watcher = new Client();
const forwarder = new Client();

watcher.login(WATCHING_TOKEN);
forwarder.login(FORWARDING_TOKEN);

const watchingChannels = fs.readFileSync('channels.txt', 'utf-8').trim().split('\n').map(str => {
    return {
        watching: str.trim().split(' ')[0],
        forwarding: str.trim().split(' ')[1]
    }
});

console.log(watchingChannels);

watcher.on('ready', async() => {
    console.log(`${watcher.user.username} is ready!`);
    watchingChannels.forEach(channelPair => {
        const channel = watcher.channels.get(channelPair.watching);
        const collector = channel.createMessageCollector(() => true, {});

        collector.on('collect', async m => {
            const target = forwarder.channels.get(channelPair.forwarding);
            if(m.content != ''){
                await target.send(`**${m.author.username}:** ${m.content}`);
            }
            if(m.embeds.length > 0){
                for(let embed of m.embeds){
                    await target.send(`**${m.author.username}:**`, embed);
                }
            }  
            if(m.attachments.size > 0){
                for(let attachment of m.attachments){
                    await target.send(`**${m.author.username}:**`, {
                        files: [{
                            attachment: attachment[1].proxyURL
                        }]
                    });
                }
            }
        })
    })
});

forwarder.on('ready', async() => {
    console.log(`${forwarder.user.username} is ready!`);
});