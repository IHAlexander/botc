// Singleton WebSocket client with external store pattern

let socket = null
const listeners = new Set()
let state = { script: [], scriptMeta: {}, players: [] }

function getState() {
  return state
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify() {
  listeners.forEach(fn => fn())
}

function send(type, payload = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }))
  }
}

function connect() {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const url = `${proto}://${window.location.host}/ws`
  socket = new WebSocket(url)

  socket.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    if (msg.type === 'GAME_STATE' || msg.type === 'STATE_UPDATE') {
      state = msg.payload
      notify()
    }
  }

  socket.onclose = () => {
    setTimeout(connect, 2000)
  }
}

connect()

export { getState, subscribe, send }
