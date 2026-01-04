interface NotesButtonProps {
  notesCount: number;
  onClick: () => void;
}

function NotesButton({ notesCount, onClick }: NotesButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-minerva-gray-600 hover:text-minerva-gray-900 transition-colors"
      title={notesCount > 0 ? `Jegyzetek (${notesCount} db)` : 'Jegyzetek hozzáadása'}
    >
      <svg
        className="w-4 h-4"
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
        <span className="bg-minerva-gray-200 text-minerva-gray-700 text-xs rounded-full px-2 py-0.5 font-medium">
          {notesCount}
        </span>
      )}
    </button>
  );
}

export default NotesButton;
