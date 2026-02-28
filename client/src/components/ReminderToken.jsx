export default function ReminderToken({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 12, fontSize: 11,
      background: '#3a2a10', border: '1px solid #5a3a20', color: '#c8a96e',
    }}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: 'none', border: 'none', color: '#8a4a4a',
            cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '0 2px',
          }}
        >
          ×
        </button>
      )}
    </span>
  )
}
