import { useState, useEffect, useSyncExternalStore } from 'react'
import { getState, subscribe, send } from '../ws.js'
import Grimoire from '../components/Grimoire.jsx'
import ScriptViewer from '../components/ScriptViewer.jsx'
import NightOrder from '../components/NightOrder.jsx'
import ReminderToken from '../components/ReminderToken.jsx'

const S = {
  layout: {
    display: 'grid', gridTemplateColumns: '1fr 260px',
    gridTemplateRows: 'auto 1fr', minHeight: '100vh',
    gap: 0,
  },
  topBar: {
    gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 16px', borderBottom: '1px solid #3a2010',
    background: 'rgba(15,5,0,0.9)',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#c8a96e', marginRight: 'auto' },
  main: { padding: 16, overflowY: 'auto' },
  sidebar: {
    borderLeft: '1px solid #3a2010', padding: 16, overflowY: 'auto',
    background: 'rgba(15,5,0,0.7)',
  },
  sectionTitle: {
    fontSize: 11, textTransform: 'uppercase', letterSpacing: 2,
    color: '#7a5a3a', marginBottom: 10,
  },
  select: {
    padding: '6px 10px', borderRadius: 6, border: '1px solid #5a3a20',
    background: '#1a0800', color: '#e8d5b0', fontSize: 13, cursor: 'pointer',
  },
  btn: (variant) => ({
    padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 'bold',
    background: variant === 'danger' ? '#5a2020' : variant === 'primary' ? '#4a3010' : '#2a1a0a',
    color: variant === 'danger' ? '#e8a0a0' : '#c8a96e',
  }),
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  modalCard: {
    background: '#1a0800', border: '1px solid #5a3a20', borderRadius: 12,
    padding: 24, minWidth: 320, maxWidth: 480, width: '90vw', maxHeight: '80vh',
    overflowY: 'auto',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#c8a96e', marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 12, color: '#7a5a3a', marginBottom: 4 },
  input: {
    padding: '6px 10px', borderRadius: 6, border: '1px solid #3a2010',
    background: '#0a0400', color: '#e8d5b0', fontSize: 13, width: '100%',
  },
}

function PlayerModal({ player, script, onClose }) {
  const [roleId, setRoleId] = useState(player.role || '')
  const [status, setStatus] = useState(player.status)
  const [ghostUsed, setGhostUsed] = useState(player.ghostVoteUsed)
  const [reminderInput, setReminderInput] = useState('')

  function save() {
    if (roleId !== player.role) {
      send('ASSIGN_ROLE', { playerId: player.id, roleId: roleId || null })
    }
    if (status !== player.status || ghostUsed !== player.ghostVoteUsed) {
      send('UPDATE_STATUS', { playerId: player.id, status, ghostVoteUsed: ghostUsed })
    }
    onClose()
  }

  function addReminder() {
    const label = reminderInput.trim()
    if (!label) return
    send('ADD_REMINDER', { playerId: player.id, label })
    setReminderInput('')
  }

  const allReminders = script.flatMap(c => c.reminders || [])
  const uniqueReminders = [...new Set(allReminders)]

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalCard}>
        <div style={S.modalTitle}>{player.name}</div>

        <div style={S.field}>
          <label style={S.label}>Role</label>
          <select
            style={{ ...S.select, width: '100%' }}
            value={roleId}
            onChange={e => setRoleId(e.target.value)}
          >
            <option value="">— none —</option>
            {script.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.team})</option>
            ))}
          </select>
        </div>

        <div style={S.field}>
          <label style={S.label}>Status</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['alive', 'dead'].map(s => (
              <button
                key={s}
                style={{
                  ...S.btn(status === s ? 'primary' : ''),
                  flex: 1, padding: '8px',
                }}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {status === 'dead' && (
          <div style={S.field}>
            <label style={{ ...S.label, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={ghostUsed}
                onChange={e => setGhostUsed(e.target.checked)}
              />
              Ghost vote used
            </label>
          </div>
        )}

        <div style={S.field}>
          <label style={S.label}>Reminders</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {player.reminders.map((r, i) => (
              <ReminderToken
                key={i}
                label={r}
                onRemove={() => send('REMOVE_REMINDER', { playerId: player.id, label: r })}
              />
            ))}
            {player.reminders.length === 0 && (
              <span style={{ color: '#5a3a20', fontSize: 12 }}>None</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              list="reminder-suggestions"
              style={{ ...S.input, flex: 1 }}
              value={reminderInput}
              onChange={e => setReminderInput(e.target.value)}
              placeholder="Add reminder…"
              onKeyDown={e => e.key === 'Enter' && addReminder()}
            />
            <datalist id="reminder-suggestions">
              {uniqueReminders.map(r => <option key={r} value={r} />)}
            </datalist>
            <button style={S.btn('primary')} onClick={addReminder}>Add</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button style={S.btn('')} onClick={onClose}>Cancel</button>
          <button style={S.btn('primary')} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function StorytellerPage() {
  const gs = useSyncExternalStore(subscribe, getState)
  const [scripts, setScripts] = useState([])
  const [selectedScript, setSelectedScript] = useState('')
  const [activeTab, setSideTab] = useState('nightorder')
  const [editingPlayer, setEditingPlayer] = useState(null)

  useEffect(() => {
    fetch('/api/scripts')
      .then(r => r.json())
      .then(setScripts)
      .catch(() => {})
  }, [])

  function loadScript() {
    if (!selectedScript) return
    send('SET_SCRIPT', { scriptId: selectedScript })
  }

  function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result)
        send('SET_SCRIPT', { customJson: json })
      } catch {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const scriptLabel = gs.scriptMeta?.name
    ? `${gs.scriptMeta.name} (${gs.script.length} chars)`
    : 'No script loaded'

  return (
    <div style={S.layout}>
      {editingPlayer && (
        <PlayerModal
          player={editingPlayer}
          script={gs.script}
          onClose={() => setEditingPlayer(null)}
        />
      )}

      <div style={S.topBar}>
        <div style={S.title}>Storyteller — {scriptLabel}</div>
        <select
          style={S.select}
          value={selectedScript}
          onChange={e => setSelectedScript(e.target.value)}
        >
          <option value="">Select script…</option>
          {scripts.map(s => (
            <option key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
        <button style={S.btn('primary')} onClick={loadScript}>Load</button>
        <label style={{ ...S.btn(''), cursor: 'pointer' }}>
          Upload JSON
          <input type="file" accept=".json" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={S.main}>
        <div style={S.sectionTitle}>
          Grimoire — {gs.players.filter(p => !p.isStoryteller).length} players
        </div>
        <Grimoire
          players={gs.players}
          script={gs.script}
          onClickPlayer={setEditingPlayer}
        />
      </div>

      <div style={S.sidebar}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['nightorder', 'script'].map(tab => (
            <button
              key={tab}
              onClick={() => setSideTab(tab)}
              style={{
                ...S.btn(activeTab === tab ? 'primary' : ''),
                flex: 1, fontSize: 11,
              }}
            >
              {tab === 'nightorder' ? 'Night Order' : 'Script'}
            </button>
          ))}
        </div>

        {activeTab === 'nightorder' ? (
          <NightOrder scriptMeta={gs.scriptMeta} script={gs.script} />
        ) : (
          <ScriptViewer script={gs.script} />
        )}
      </div>
    </div>
  )
}
