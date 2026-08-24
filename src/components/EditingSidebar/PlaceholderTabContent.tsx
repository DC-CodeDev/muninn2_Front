export function PlaceholderTabContent() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        gap: '12px',
        color: 'var(--text-muted)',
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        style={{ opacity: 0.3 }}
      >
        <circle cx="8" cy="8" r="6"></circle>
        <path d="M8 4v4h4"></path>
      </svg>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-xs)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          opacity: 0.5,
        }}
      >
        Próximamente
      </div>
    </div>
  );
}
