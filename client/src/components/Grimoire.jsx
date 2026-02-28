import PlayerToken from './PlayerToken.jsx'

export default function Grimoire({ players, script, onClickPlayer }) {
  const nonST = players.filter(p => !p.isStoryteller)

  if (nonST.length === 0) {
    return (
      <div style={{ color: '#5a3a20', fontStyle: 'italic', padding: 20 }}>
        No players connected yet.
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 12,
      justifyContent: 'flex-start', padding: '8px 0',
    }}>
      {nonST.map(p => {
        const ch = p.role ? script.find(c => c.id === p.role) : null
        return (
          <PlayerToken
            key={p.id}
            player={p}
            character={ch}
            onClick={() => onClickPlayer(p)}
          />
        )
      })}
    </div>
  )
}
