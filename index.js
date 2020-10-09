const fs = require('fs'); //node's file system
const Discord = require('discord.js');
const { prefix, token } = require('./config.json')
const client = new Discord.Client();

client.commands = new Discord.Collection();

//read new command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(' '); //acm
    const commandName = args.shift().toLowerCase(); 

    const commandFile = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if(commandFile == undefined){
        return;
    }

    if(commandFile.guildOnly && message.channel.type =='dm'){
        return message.reply("This commmand does not work in the dms!!");
    }

    if(!cooldowns.has(commandFile.name)){
        cooldowns.set(commandFile.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(commandFile.name);
    const cooldownAmount = (commandFile.cooldown || 1) * 1000

    /*
    * WE LEFT OFF HERE
    */

    function timeFormat(duration) {   
        // Hours, minutes and seconds
        let hrs = Math.floor(duration / 3600);
        let mins = Math.floor((duration % 3600) / 60);
        let secs = Math.floor(duration % 60);
        let ms = (duration - Math.floor(duration)).toFixed(3);
        
        // Output like "1:01" or "4:03:59" or "123:03:59"
        let ret = "";

        if (hrs > 0) { //if there are hours, include it
            ret += hrs + ":" + (mins < 10 ? "0" : "");
        }
        else { //if there are no hours, include ms 
            secs = parseFloat(secs) + parseFloat(ms);
        }
        
        ret += mins + ":" + (secs < 10 ? "0" : "");
        ret += secs;
        return ret;
    }


    if (timestamps.has(message.author.id)) { 
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        return message.reply(`please wait ${timeFormat(timeLeft)} before reusing the \`${command.name}\` command.`);
    }


    timestamps.set(message.author.id, now);

    setTimeout(() => 
        timestamps.delete(message.author.id), cooldownAmount);


    try {
        commandFile.execute(message, args); 
    } catch (error) { 
        console.log(error); 
        message.reply('there was an error trying to execute that command!');
    }
});