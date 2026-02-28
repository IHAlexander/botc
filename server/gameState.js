const path = require('path')
const fs = require('fs')

const dataDir = path.join(__dirname, 'data')

function loadCharacterDb() {
  try {
    const raw = fs.readFileSync(path.join(dataDir, 'characters.json'), 'utf8')
    const arr = JSON.parse(raw)
    const db = {}
    for (const ch of arr) {
      if (ch.id) db[ch.id] = ch
    }
    return db
  } catch {
    return {}
  }
}

const characterDb = loadCharacterDb()

const OFFICIAL_SCRIPTS = {
  'trouble-brewing': 'trouble-brewing.json',
  'bad-moon-rising': 'bad-moon-rising.json',
  'sects-and-violets': 'sects-and-violets.json',
}

let state = {
  script: [],
  scriptMeta: {},
  players: [],
}

let nextId = 1

function getState() {
  return state
}

function joinPlayer(ws, name) {
  const existing = state.players.find(p => p.ws === ws)
  if (existing) {
    existing.name = name
    return existing
  }
  const player = {
    id: String(nextId++),
    ws,
    name,
    role: null,
    alignment: null,
    status: 'alive',
    ghostVoteUsed: false,
    reminders: [],
    isStoryteller: false,
  }
  state.players.push(player)
  return player
}

function joinStoryteller(ws) {
  const existing = state.players.find(p => p.ws === ws)
  if (existing) {
    existing.isStoryteller = true
    return existing
  }
  const st = {
    id: String(nextId++),
    ws,
    name: 'Storyteller',
    role: null,
    alignment: null,
    status: 'alive',
    ghostVoteUsed: false,
    reminders: [],
    isStoryteller: true,
  }
  state.players.push(st)
  return st
}

function removePlayer(ws) {
  state.players = state.players.filter(p => p.ws !== ws)
}

function setScript(scriptId, customJson) {
  let raw
  if (customJson) {
    raw = customJson
  } else if (OFFICIAL_SCRIPTS[scriptId]) {
    const filePath = path.join(dataDir, OFFICIAL_SCRIPTS[scriptId])
    raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } else {
    return
  }

  const metaEntry = raw.find(e => e.id === '_meta')
  const scriptMeta = metaEntry || {}
  const characters = raw
    .filter(e => e.id !== '_meta')
    .map(e => {
      const fromDb = characterDb[e.id]
      if (fromDb) return fromDb
      return e
    })

  state.script = characters
  state.scriptMeta = scriptMeta
}

function assignRole(playerId, roleId) {
  const player = state.players.find(p => p.id === playerId)
  if (!player) return
  const character = state.script.find(c => c.id === roleId) || characterDb[roleId]
  player.role = roleId
  if (character) {
    player.alignment = character.team === 'townsfolk' || character.team === 'outsider'
      ? 'good'
      : character.team === 'minion' || character.team === 'demon'
      ? 'evil'
      : null
  }
}

function updateStatus(playerId, status, ghostVoteUsed) {
  const player = state.players.find(p => p.id === playerId)
  if (!player) return
  if (status !== undefined) player.status = status
  if (ghostVoteUsed !== undefined) player.ghostVoteUsed = ghostVoteUsed
}

function addReminder(playerId, label) {
  const player = state.players.find(p => p.id === playerId)
  if (!player) return
  player.reminders.push(label)
}

function removeReminder(playerId, label) {
  const player = state.players.find(p => p.id === playerId)
  if (!player) return
  const idx = player.reminders.indexOf(label)
  if (idx !== -1) player.reminders.splice(idx, 1)
}

function deriveNightOrder(characters, phase) {
  const field = phase === 'first' ? 'firstNight' : 'otherNight'
  return characters
    .filter(c => c[field] && c[field] > 0)
    .sort((a, b) => a[field] - b[field])
    .map(c => c.id)
}

function serialiseState() {
  const firstNight = deriveNightOrder(state.script, 'first')
  const otherNight = deriveNightOrder(state.script, 'other')
  return {
    script: state.script,
    scriptMeta: { ...state.scriptMeta, firstNight, otherNight },
    players: state.players.map(p => ({
      id: p.id,
      name: p.name,
      role: p.role,
      alignment: p.alignment,
      status: p.status,
      ghostVoteUsed: p.ghostVoteUsed,
      reminders: p.reminders,
      isStoryteller: p.isStoryteller,
    })),
  }
}

module.exports = {
  getState,
  joinPlayer,
  joinStoryteller,
  removePlayer,
  setScript,
  assignRole,
  updateStatus,
  addReminder,
  removeReminder,
  serialiseState,
  characterDb,
  OFFICIAL_SCRIPTS,
}
