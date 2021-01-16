const { Client } = require("discord.js");

const { WATCHING_TOKEN, FORWARDING_TOKEN, WATCHING_CHANNELS } = require('./config.json');

const watcher = new Client();
const forwarder = new Client();

watcher.login(WATCHING_TOKEN);
forwarder.login(FORWARDING_TOKEN);

watcher.on('ready', async() => {
    console.log(`${watcher.user.username} is ready!`);
    WATCHING_CHANNELS.forEach(element => {
        const channel = watcher.channels.cache.get(element.watching);
        const collector = channel.createMessageCollector(() => true, {});

        collector.on('collect', async m => {
            const target = forwarder.channels.cache.get(element.forwarding);
            console.log(m);
            if(m.content != ''){
                await target.send(m.content);
            }
            if(m.embeds.length > 0){
                for(let embed of m.embeds){
                    await target.send(embed.setFooter('', ''));
                }
            }  
            if(m.attachments.size > 0){
                for(let attachment of m.attachments){
                    await target.send(attachment);
                }
            }
        })
    })
});

forwarder.on('ready', async() => {
    console.log(`${forwarder.user.username} is ready!`);
});