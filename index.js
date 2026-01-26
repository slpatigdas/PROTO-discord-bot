require('dotenv').config();
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');
const { logCommand, getHistory } = require('./commandLogger');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(3000, () => {
  console.log('Keep-alive server running');
});


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // LOG COMMANDS
  if (content.startsWith('!')) {
    logCommand(message.author, content);
  }

  // HI COMMAND (case-insensitive)
  if (content === 'hi') {
    return message.channel.send(`Hello ${message.member?.displayName || message.author.username}!`);
  }

  switch (content) {

    case '!news': {
      try {
        const res = await axios.get(
          `https://newsapi.org/v2/top-headlines?category=technology&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
        );

        let msg = '**Tech News:**\n\n';
        res.data.articles.forEach((a, i) => {
          msg += `**${i + 1}. ${a.title}**\n${a.url}\n\n`;
        });

        message.channel.send(msg);
      } catch {
        message.channel.send('Failed to fetch news.');
      }
      break;
    }

    case '!reddit': {
      try {
        const res = await axios.get('https://www.reddit.com/r/technology/top.json?limit=5');
        let msg = '**Reddit /r/technology:**\n\n';

        res.data.data.children.forEach((post, i) => {
          msg += `**${i + 1}. ${post.data.title}**\nhttps://reddit.com${post.data.permalink}\n\n`;
        });

        message.channel.send(msg);
      } catch {
        message.channel.send('Failed to fetch Reddit posts.');
      }
      break;
    }

    case '!hack': {
      try {
        const top = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const ids = top.data.slice(0, 5);

        let msg = '**Hacker News:**\n\n';

        for (let id of ids) {
          const story = await axios.get(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`
          );
          msg += `**${story.data.title}**\n${story.data.url || 'No link'}\n\n`;
        }

        message.channel.send(msg);
      } catch {
        message.channel.send('Failed to fetch Hacker News.');
      }
      break;
    }

    case '!history': {
      const history = getHistory(5);
      if (history.length === 0) {
        return message.channel.send('No command history yet.');
      }

      let msg = '**Recent Commands:**\n\n';
      history.forEach(h => {
        msg += `• **${h.user}** used \`${h.command}\`\n`;
      });

      message.channel.send(msg);
      break;
    }
    
    case "!compliment": {
    const compliments = [
      "You're looking sharp there!😉",
      "Did you know you're in Minecraft? If you pick up lava, you'll get an advancement called 'Hot Stuff🔥'.",
      "Hey, don’t forget to be yourself — you’re already pretty awesome!😁",
      "Whoa, did I hit a jackpot or is it just you?",
      "Are your parents bakers? Because they made you a sweetie-pie!",
      "You're doing better than you think 💙",
      "Certified main character energy ✨",
      "You dropped this 👑"
    ];

    const random = compliments[Math.floor(Math.random() * compliments.length)];
    message.channel.send(random);
    break;
  }
  }
});

client.login(process.env.DISCORD_TOKEN);
