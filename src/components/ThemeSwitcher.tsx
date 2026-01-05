import { useTheme, Theme } from '../contexts/ThemeContext';
import { useState } from 'react';

// Theme icon components
function ThemeIcon({ theme }: { theme: Theme }) {
  const className = "w-5 h-5";

  switch (theme) {
    case 'light':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'dark':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    case 'blue':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    default:
      return null;
  }
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Világos' },
    { value: 'dark', label: 'Sötét' },
    { value: 'blue', label: 'Kék' },
  ];

  const currentTheme = themes.find((t) => t.value === theme);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
        style={{
          backgroundColor: 'var(--theme-btn-secondary-bg)',
          color: 'var(--theme-btn-secondary-text)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--theme-btn-secondary-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--theme-btn-secondary-bg)';
        }}
        aria-label="Téma váltás"
      >
        <ThemeIcon theme={theme} />
        <span className="hidden md:inline text-sm font-medium">{currentTheme?.label}</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20 overflow-hidden"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--theme-card-border)',
            }}
          >
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => handleThemeChange(t.value)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                style={{
                  color: theme === t.value ? 'var(--theme-btn-primary-text)' : 'var(--theme-text-primary)',
                  backgroundColor: theme === t.value ? 'var(--theme-btn-primary-bg)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (theme !== t.value) {
                    e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== t.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  } else {
                    e.currentTarget.style.backgroundColor = 'var(--theme-btn-primary-bg)';
                  }
                }}
              >
                <ThemeIcon theme={t.value} />
                <span className="font-medium">{t.label}</span>
                {theme === t.value && (
                  <svg
                    className="w-4 h-4 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeSwitcher;
