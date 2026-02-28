import { useState, useSyncExternalStore } from 'react'
import { getState, subscribe } from '../ws.js'

const TEAM_COLOR = {
  townsfolk: '#4a8a6a',
  outsider: '#4a6a8a',
  minion: '#8a6a4a',
  demon: '#8a2a2a',
}

const S = {
  page: { padding: 16, maxWidth: 480, margin: '0 auto', minHeight: '100vh' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #3a2010',
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#c8a96e' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12, textTransform: 'uppercase', letterSpacing: 2,
    color: '#7a5a3a', marginBottom: 8,
  },
  roleCard: (team) => ({
    background: 'rgba(30,15,5,0.85)',
    border: `1px solid ${TEAM_COLOR[team] || '#5a3a20'}`,
    borderRadius: 10, padding: 20,
  }),
  roleName: { fontSize: 24, fontWeight: 'bold', color: '#e8d5b0', marginBottom: 4 },
  teamBadge: (team) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12,
    background: TEAM_COLOR[team] || '#5a3a20', color: '#fff', marginBottom: 12,
    textTransform: 'capitalize',
  }),
  ability: { fontSize: 15, color: '#c8a96e', lineHeight: 1.6, fontStyle: 'italic' },
  unknownRole: { color: '#7a5a3a', fontStyle: 'italic', fontSize: 15 },
  playerList: { display: 'flex', flexDirection: 'column', gap: 8 },
  playerRow: (alive) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
    borderRadius: 8, background: 'rgba(30,15,5,0.7)', opacity: alive ? 1 : 0.55,
    border: '1px solid #2a1a0a',
  }),
  dot: (alive) => ({
    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
    background: alive ? '#4a8a4a' : '#5a2a2a',
  }),
  playerName: { flex: 1, fontSize: 15 },
  ghostLabel: { fontSize: 12, color: '#7a5a3a' },
  textarea: {
    width: '100%', minHeight: 120, padding: 12, fontSize: 14,
    borderRadius: 8, border: '1px solid #3a2010', background: '#1a0800',
    color: '#e8d5b0', resize: 'vertical', outline: 'none', fontFamily: 'inherit',
  },
}

function NotesArea({ notesKey }) {
  const [val, setVal] = useState(() => localStorage.getItem(notesKey) || '')
  function handleChange(e) {
    setVal(e.target.value)
    localStorage.setItem(notesKey, e.target.value)
  }
  return (
    <textarea
      style={S.textarea}
      value={val}
      onChange={handleChange}
      placeholder="Your private notes…"
    />
  )
}

export default function PlayerPage() {
  const gs = useSyncExternalStore(subscribe, getState)
  const myName = sessionStorage.getItem('botc_name') || ''
  const me = gs.players.find(p => p.name === myName && !p.isStoryteller)
  const character = me?.role ? gs.script.find(c => c.id === me.role) : null
  const others = gs.players.filter(p => !p.isStoryteller)

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={S.name}>{myName || 'Player'}</div>
        {character && (
          <div style={S.teamBadge(character.team)}>{character.team}</div>
        )}
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Your Role</div>
        {character ? (
          <div style={S.roleCard(character.team)}>
            <div style={S.roleName}>{character.name}</div>
            <div style={S.teamBadge(character.team)}>{character.team}</div>
            <div style={S.ability}>{character.ability}</div>
          </div>
        ) : (
          <div style={S.roleCard(null)}>
            <div style={S.unknownRole}>
              {me ? 'Waiting for Storyteller to assign your role…' : 'Connecting…'}
            </div>
          </div>
        )}
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Players ({others.length})</div>
        <div style={S.playerList}>
          {others.map(p => (
            <div key={p.id} style={S.playerRow(p.status === 'alive')}>
              <div style={S.dot(p.status === 'alive')} />
              <div style={S.playerName}>{p.name}</div>
              {p.status === 'dead' && (
                <div style={S.ghostLabel}>
                  {p.ghostVoteUsed ? 'vote used' : 'ghost vote'}
                </div>
              )}
            </div>
          ))}
          {others.length === 0 && (
            <div style={{ color: '#5a3a20', fontStyle: 'italic', fontSize: 14 }}>
              No players yet
            </div>
          )}
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Notes</div>
        <NotesArea notesKey={`botc_notes_${myName}`} />
      </div>
    </div>
  )
}
