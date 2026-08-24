import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  integrated?: boolean;
}

export default function ThemeToggle({ integrated = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (integrated) {
    return (
      <button
        onClick={toggleTheme}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform var(--transition-fast), color var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.backgroundColor = 'var(--state-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="8" cy="8" r="3.5" />
            <path d="M8 1v2M8 13v2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M1 8h2M13 8h2M3.5 12.5l1.5-1.5M11 5l1.5-1.5" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M9 2a5 5 0 0 1 5 5c0 2.8-2.2 5-5 5a5 5 0 0 1-5-5c0-2.8 2.2-5 5-5z" opacity="0.3" />
            <path d="M9 2c-2.8 0-5 2.2-5 5 0 2.8 2.2 5 5 5 2.8 0 5-2.2 5-5 0-2.8-2.2-5-5-5zM9 3c1.7 0 3 1.3 3 3 0 1.7-1.3 3-3 3-1.7 0-3-1.3-3-3 0-1.7 1.3-3 3-3z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '44px',
        height: '44px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface-raised)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        transition: 'transform var(--transition-fast)',
        zIndex: 9999,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="8" cy="8" r="3.5" />
          <path d="M8 1v2M8 13v2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M1 8h2M13 8h2M3.5 12.5l1.5-1.5M11 5l1.5-1.5" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M9 2a5 5 0 0 1 5 5c0 2.8-2.2 5-5 5a5 5 0 0 1-5-5c0-2.8 2.2-5 5-5z" opacity="0.3" />
          <path d="M9 2c-2.8 0-5 2.2-5 5 0 2.8 2.2 5 5 5 2.8 0 5-2.2 5-5 0-2.8-2.2-5-5-5zM9 3c1.7 0 3 1.3 3 3 0 1.7-1.3 3-3 3-1.7 0-3-1.3-3-3 0-1.7 1.3-3 3-3z" />
        </svg>
      )}
    </button>
  );
}