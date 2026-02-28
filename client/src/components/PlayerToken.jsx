import ReminderToken from './ReminderToken.jsx'

const ALIGN_COLOR = {
  good: '#4a6a4a',
  evil: '#6a2a2a',
}

const TEAM_ICON = {
  townsfolk: '☀',
  outsider: '☽',
  minion: '★',
  demon: '✦',
}

export default function PlayerToken({ player, character, onClick }) {
  const alive = player.status === 'alive'

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
        background: 'rgba(20,10,2,0.85)',
        border: `1px solid ${alive ? '#5a3a20' : '#2a1a0a'}`,
        opacity: alive ? 1 : 0.6, minWidth: 90, userSelect: 'none',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: player.alignment ? ALIGN_COLOR[player.alignment] : '#2a1a0a',
        border: `2px solid ${player.alignment ? ALIGN_COLOR[player.alignment] : '#3a2010'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        position: 'relative',
      }}>
        {character ? (TEAM_ICON[character.team] || '?') : '?'}
        {!alive && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>†</div>
        )}
      </div>

      <div style={{ fontSize: 13, fontWeight: 'bold', color: '#e8d5b0', textAlign: 'center' }}>
        {player.name}
      </div>

      {character && (
        <div style={{ fontSize: 11, color: '#a08060', textAlign: 'center' }}>
          {character.name}
        </div>
      )}

      {player.alignment && (
        <div style={{
          fontSize: 10, padding: '1px 6px', borderRadius: 8,
          background: ALIGN_COLOR[player.alignment], color: '#fff',
          textTransform: 'capitalize',
        }}>
          {player.alignment}
        </div>
      )}

      {player.reminders.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          {player.reminders.map((r, i) => (
            <ReminderToken key={i} label={r} />
          ))}
        </div>
      )}

      {player.status === 'dead' && !player.ghostVoteUsed && (
        <div style={{ fontSize: 10, color: '#8a6a4a' }}>ghost vote</div>
      )}
    </div>
  )
}
