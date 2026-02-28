const express = require('express')
const http = require('http')
const path = require('path')
const { WebSocketServer } = require('ws')
const cors = require('cors')
const gs = require('./gameState')

const PORT = process.env.PORT || 3001
const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

const clientDist = path.join(__dirname, '..', 'client', 'dist')
app.use(express.static(clientDist))

app.get('/api/scripts', (_req, res) => {
  res.json(Object.keys(gs.OFFICIAL_SCRIPTS))
})

app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

function broadcast(data) {
  const msg = JSON.stringify(data)
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg)
  })
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'GAME_STATE', payload: gs.serialiseState() }))

  ws.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }
    const { type, payload = {} } = msg

    switch (type) {
      case 'JOIN':
        gs.joinPlayer(ws, payload.name)
        break
      case 'JOIN_STORYTELLER':
        gs.joinStoryteller(ws)
        break
      case 'SET_SCRIPT':
        gs.setScript(payload.scriptId, payload.customJson)
        break
      case 'ASSIGN_ROLE':
        gs.assignRole(payload.playerId, payload.roleId)
        break
      case 'UPDATE_STATUS':
        gs.updateStatus(payload.playerId, payload.status, payload.ghostVoteUsed)
        break
      case 'ADD_REMINDER':
        gs.addReminder(payload.playerId, payload.label)
        break
      case 'REMOVE_REMINDER':
        gs.removeReminder(payload.playerId, payload.label)
        break
      default:
        return
    }

    broadcast({ type: 'STATE_UPDATE', payload: gs.serialiseState() })
  })

  ws.on('close', () => {
    gs.removePlayer(ws)
    broadcast({ type: 'STATE_UPDATE', payload: gs.serialiseState() })
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BotC server running on http://0.0.0.0:${PORT}`)
  console.log(`LAN players connect to http://<your-ip>:${PORT}`)
})
