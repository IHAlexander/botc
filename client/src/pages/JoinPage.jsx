import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { send } from '../ws.js'

const S = {
  page: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: 32, padding: 24,
  },
  title: { fontSize: 36, fontWeight: 'bold', color: '#c8a96e', textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.8)' },
  subtitle: { fontSize: 16, color: '#a08060', textAlign: 'center' },
  card: {
    background: 'rgba(30,15,5,0.85)', border: '1px solid #5a3a20',
    borderRadius: 12, padding: '32px 40px', display: 'flex',
    flexDirection: 'column', gap: 16, minWidth: 280,
  },
  input: {
    padding: '10px 14px', fontSize: 16, borderRadius: 8,
    border: '1px solid #5a3a20', background: '#1a0a00',
    color: '#e8d5b0', outline: 'none', width: '100%',
  },
  btn: (color) => ({
    padding: '12px 24px', fontSize: 16, borderRadius: 8, border: 'none',
    background: color, color: '#fff', cursor: 'pointer', fontWeight: 'bold',
    letterSpacing: 1,
  }),
  divider: { textAlign: 'center', color: '#5a3a20', fontSize: 14 },
}

export default function JoinPage() {
  const [name, setName] = useState('')
  const nav = useNavigate()

  function joinPlayer() {
    const n = name.trim()
    if (!n) return
    send('JOIN', { name: n })
    sessionStorage.setItem('botc_name', n)
    sessionStorage.setItem('botc_role', 'player')
    nav('/player')
  }

  function joinStoryteller() {
    send('JOIN_STORYTELLER')
    sessionStorage.setItem('botc_role', 'storyteller')
    nav('/storyteller')
  }

  return (
    <div style={S.page}>
      <div>
        <div style={S.title}>Blood on the Clocktower</div>
        <div style={S.subtitle}>LAN Game Assistant</div>
      </div>
      <div style={S.card}>
        <input
          style={S.input}
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && joinPlayer()}
        />
        <button style={S.btn('#7a3030')} onClick={joinPlayer}>
          Join as Player
        </button>
        <div style={S.divider}>— or —</div>
        <button style={S.btn('#2a4a6a')} onClick={joinStoryteller}>
          Join as Storyteller
        </button>
      </div>
    </div>
  )
}
