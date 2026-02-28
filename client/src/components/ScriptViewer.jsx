const TEAM_ORDER = ['townsfolk', 'outsider', 'minion', 'demon']
const TEAM_LABEL = {
  townsfolk: 'Townsfolk',
  outsider: 'Outsiders',
  minion: 'Minions',
  demon: 'Demon',
}
const TEAM_COLOR = {
  townsfolk: '#4a8a6a',
  outsider: '#4a6a8a',
  minion: '#8a6a4a',
  demon: '#8a2a2a',
}

export default function ScriptViewer({ script }) {
  if (!script || script.length === 0) {
    return (
      <div style={{ color: '#5a3a20', fontStyle: 'italic', padding: 8 }}>
        No script loaded.
      </div>
    )
  }

  const byTeam = {}
  for (const ch of script) {
    const t = ch.team || 'unknown'
    if (!byTeam[t]) byTeam[t] = []
    byTeam[t].push(ch)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {TEAM_ORDER.filter(t => byTeam[t]?.length).map(team => (
        <div key={team}>
          <div style={{
            fontSize: 12, textTransform: 'uppercase', letterSpacing: 2,
            color: TEAM_COLOR[team], marginBottom: 6,
          }}>
            {TEAM_LABEL[team]}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {byTeam[team].map(ch => (
              <div key={ch.id} style={{
                padding: '6px 10px', borderRadius: 6,
                background: 'rgba(30,15,5,0.7)',
                border: `1px solid ${TEAM_COLOR[team]}33`,
              }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#e8d5b0' }}>
                  {ch.name}
                </div>
                {ch.ability && (
                  <div style={{ fontSize: 12, color: '#a08060', marginTop: 2 }}>
                    {ch.ability}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
