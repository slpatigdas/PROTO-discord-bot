require('dotenv').config();
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js'); // Import necessary classes
const newsCooldown = new Map();
const NEWS_COOLDOWN_TIME = 30 * 1000; // 30 seconds
const content = message.content.toLowerCase();



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Required for the bot to function in a server
        GatewayIntentBits.GuildMessages, // Required to access message events
        GatewayIntentBits.MessageContent // Required to read message content (due to the intent you enabled in Step 1)
    ]
});

// Log a message when the bot is ready
client.once('ready', () => {
    console.log('Bot is online!');
});

// Listen for messages
client.on('messageCreate', message => {
    // Ignore messages from the bot itself
    if (message.author.bot) return;

    // A simple Hi-Hello command
    if (content === 'hi') {
        message.channel.send(`Hello ${message.author.displayName}!`);

    }

    //Switch Command Statement
    switch (content) {

  case "!news": {
    const userId = message.author.id;
    const now = Date.now();

    if (newsCooldown.has(userId)) {
      const lastUsed = newsCooldown.get(userId);
      const timeLeft = NEWS_COOLDOWN_TIME - (now - lastUsed);

      if (timeLeft > 0) {
        return message.reply(
          `⏳ Please wait **${Math.ceil(timeLeft / 1000)}s** before using \`!news\` again.`
        );
      }
    }

    // Set cooldown
        newsCooldown.set(userId, now);
        setTimeout(() => newsCooldown.delete(userId), NEWS_COOLDOWN_TIME);

        (async () => {
          try {
            const response = await axios.get(
              `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
            );

            const articles = response.data.articles;

            if (!articles || articles.length === 0) {
              return message.channel.send("No PH news available.");
            }

            let newsMessage = "**Latest PH News:**\n\n";

            articles.forEach((article, index) => {
              newsMessage += `**${index + 1}. ${article.title}**\n${article.url}\n\n`;
            });

        message.channel.send(newsMessage);

      } catch (error) {
        console.error(error);
        message.channel.send("Failed to fetch news.");
      }
    })();

    break;
  }

  case "!compliment": {
    const compliments = [
      "You're looking sharp there!",
      "Did you know you're in Minecraft? If you pick up lava, you'll get an advancement called 'Hot Stuff'.",
      "Hey, don’t forget to be yourself — you’re already pretty awesome!",
      "Whoa, did I hit a jackpot or is it just you?",
      "Are your parents bakers? Because they made you a sweetie-pie!"
    ];

    const random = compliments[Math.floor(Math.random() * compliments.length)];
    message.channel.send(random);
    break;
  }

}

});
// Log in to Discord with your app's token
client.login(process.env.DISCORD_TOKEN);
