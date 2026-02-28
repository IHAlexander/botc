import { useState } from 'react'

export default function NightOrder({ scriptMeta, script }) {
  const [phase, setPhase] = useState('first')
  const order = phase === 'first' ? scriptMeta.firstNight : scriptMeta.otherNight

  const entries = (order || []).map(id => script.find(c => c.id === id)).filter(Boolean)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['first', 'other'].map(p => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 12, border: 'none',
              cursor: 'pointer',
              background: phase === p ? '#5a3a20' : '#2a1a0a',
              color: phase === p ? '#e8d5b0' : '#7a5a3a',
            }}
          >
            {p === 'first' ? 'First Night' : 'Other Nights'}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div style={{ color: '#5a3a20', fontStyle: 'italic', fontSize: 13 }}>
          No night actions in this script.
        </div>
      ) : (
        <ol style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {entries.map((ch, i) => (
            <li key={ch.id} style={{ fontSize: 13 }}>
              <span style={{ color: '#e8d5b0', fontWeight: 'bold' }}>{ch.name}</span>
              <div style={{ fontSize: 11, color: '#7a5a3a' }}>
                {phase === 'first' ? ch.firstNightReminder : ch.otherNightReminder}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
