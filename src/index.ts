import express, { Express } from 'express'
import dotenv from 'dotenv'
import routes from './routes'
import ConnectionHandler from './classes/ConnectionHandler'
import { Pushover } from 'pushover-js'
import Player from './classes/Player'
import fs from 'fs'
import { execSync } from 'child_process'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

let logPath = process.env.STDOUT_PATH ?? ''

app.use(express.json())
app.use(routes)

if (!fs.existsSync(logPath) && (process.platform === 'linux')) {
  const result = execSync(`ps ax -ww -o pid,ppid,uid,gid,args | grep -v grep | grep valheim_server | awk '{print $1}'`)
  const pid = result.toString()
  if (pid && !isNaN(Number(pid))) {
    logPath = `/proc/${pid}/fd/1`
  }
}

if (!fs.existsSync(logPath)) {
  throw new Error('No stdout file found');
}

export const parser = new ConnectionHandler(process.env.STEAM_API_KEY)
export let pushover: Pushover | undefined = undefined

if (process.env.PUSHOVER_USER && process.env.PUSHOVER_TOKEN && process.env.MODE !== 'development') {
  try {
    pushover = new Pushover(process.env.PUSHOVER_USER, process.env.PUSHOVER_TOKEN)
  }
  catch {
    pushover = undefined
  }
}

parser.on('player_connect', async(player: Player, isCatchup?: boolean) => {
  // If this is a catchup event we don't want to spam pushover with hundreds of messages.
  if (!isCatchup) {
    let maxRetries = 5
    while (player.player_name === undefined && maxRetries > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await player.loadName(process.env.STEAM_API_KEY)
      maxRetries--
    }
    pushover?.send('Valheim user CONNECTED', `${player.player_name} joined the game`)
  }
})

parser.on('player_disconnect', (player: Player, isCatchup?: boolean) => {
  if (!isCatchup) {
    pushover?.send('Valheim user DISCONNECTED', `${player.player_name} left the game`)
  }
})

app.listen(port, () => {
  parser.start(logPath, true)
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
