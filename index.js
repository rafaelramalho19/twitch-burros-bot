const tmi = require('tmi.js');
require('dotenv').config()

const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [
    'raisingz'
  ]
};
const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

const newJoiners = []
const burros = []

function onMessageHandler(channel, context, _msg, self) {
  if (self) { return; }

  if (newJoiners.length > 100) newJoiners.length = 0;
  if (burros.length > 100) burros.length = 0;

  const message = _msg.trim();

  const match = message.match(/.*Thank you for following (.*)!/)

  if (match && match.length) {
    newJoiners.push(match[1])
  }

  const msg = message.toLowerCase();

  const name = context['display-name'];
  const keywords = ['cheat', 'hack', 'xiter', 'aimbot', 'wallhacker']
  const hasCalledMeSomethingDumb = keywords.reduce((prev, curr) => prev || msg.includes(curr), false)

  if (hasCalledMeSomethingDumb && newJoiners.includes(name)) {
    if (burros.includes(name)) {
      return client.say(channel, `@${name} outra vez, caralho?`)
    }
    if (burros.length === 0) {
      client.say(channel, `${name} has joined the "burros" list`)
    } else {
      client.say(channel, `${name} has joined the "burros" list, here's the other ${burros.length} burros: @${burros.join(' @')}`)
    }
    client.say(channel, 'If you want to report me, please follow this link: https://codepen.io/raising/full/ExNLmBG')
    burros.push(name)
  }

}
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}