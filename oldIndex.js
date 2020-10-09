const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const client = new Discord.Client();

client.once("ready", () => {
    console.log("ready!");
});

client.on("message", (message) => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    // example command: [1, 2, 3]
    const args = message.content.slice(prefix.length).split(" ");
    const command = args.shift().toLowerCase();

    //command: "%ping"
    if(command === "ping") {
        message.channel.send("Pong!");
    }
});

client.login(token);