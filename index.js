require('dotenv').config()
const tmi = require('tmi.js');
const codAPI = require('call-of-duty-api')
const api = codAPI({
  platform: 'battle',
  ratelimit: { maxRequests: 10 }
})

const CHANNELS = ['Raisingz']

const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [...CHANNELS]
};
const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

const newJoiners = []
const burros = []

// const battlenetID = 'Suedzz#21225'
const battlenetID = 'Raising#21445'

const login = async () => await api.login(process.env.ACTI_EMAIL, process.env.ACTI_TOKEN)

const getStats = async () => {
  const { lifetime } = await api.MWwz(battlenetID, api.platforms.battle)
  const { wz: weekly } = await api.MWweeklystats(battlenetID, api.platforms.battle)
  return { lifetime: lifetime.mode.br.properties, weekly: weekly.all.properties }
}

async function handleKD(channel) {
  await login()
  const { lifetime, weekly } = await getStats()
  client.say(channel, `@${CHANNELS[0]} has ${parseFloat(lifetime.kdRatio).toFixed(2)} overall KD and ${parseFloat(weekly.kdRatio).toFixed(2)} weekly KD`)
}

async function handleKills(channel) {
  await login()
  const { lifetime, weekly } = await getStats()
  client.say(channel, `@${CHANNELS[0]} has ${lifetime.kills} overall kills and ${weekly.kills} weekly kills`)
}

async function handleWins(channel) {
  await login()
  const { lifetime } = await getStats()
  client.say(channel, `@${CHANNELS[0]} has ${lifetime.wins} wins`)
}

function onMessageHandler(channel, context, _msg, self) {
  if (self) { return; }

  if (newJoiners.length > 100) newJoiners.length = 0;
  if (burros.length > 100) burros.length = 0;

  const message = _msg.trim();

  if (message.startsWith('!kd')) return handleKD(channel)
  if (message.startsWith('!kills')) return handleKills(channel)
  if (message.startsWith('!wins')) return handleWins(channel)

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