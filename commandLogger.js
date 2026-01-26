const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'command-history.json');

function logCommand(user, command) {
  let data = [];

  if (fs.existsSync(LOG_FILE)) {
    data = JSON.parse(fs.readFileSync(LOG_FILE));
  }

  data.push({
    user: user.username,
    command,
    time: new Date().toISOString()
  });

  fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2));
}

function getHistory(limit = 5) {
  if (!fs.existsSync(LOG_FILE)) return [];
  const data = JSON.parse(fs.readFileSync(LOG_FILE));
  return data.slice(-limit);
}

module.exports = { logCommand, getHistory };
