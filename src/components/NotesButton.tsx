interface NotesButtonProps {
  notesCount: number;
  onClick: () => void;
}

function NotesButton({ notesCount, onClick }: NotesButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative transition-colors"
      style={{ color: 'var(--theme-text-secondary)' }}
      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-text-primary)'}
      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-secondary)'}
      title={notesCount > 0 ? `Jegyzetek (${notesCount} db)` : 'Jegyzetek hozzáadása'}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {notesCount > 0 && (
        <span
          className="absolute -top-1 -right-1 text-[8px] rounded-full min-w-[12px] h-3 flex items-center justify-center font-bold px-0.5 leading-none"
          style={{
            backgroundColor: 'var(--theme-btn-primary-bg)',
            color: 'var(--theme-btn-primary-text)',
            boxShadow: '0 0 0 2px var(--theme-card-bg)'
          }}
        >
          {notesCount}
        </span>
      )}
    </button>
  );
}

export default NotesButton;
