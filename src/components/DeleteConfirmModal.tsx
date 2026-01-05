interface DeleteConfirmModalProps {
  isOpen: boolean;
  volunteerName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteConfirmModal({
  isOpen,
  volunteerName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
      <div
        className="rounded-lg shadow-xl max-w-md w-full p-6"
        style={{ backgroundColor: 'var(--theme-card-bg)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--theme-error)', opacity: 0.1 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--theme-error)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
              Önkéntes törlése
            </h2>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm mb-3" style={{ color: 'var(--theme-text-secondary)' }}>
            Biztosan törlöd az alábbi önkéntest?
          </p>
          <p className="text-base font-semibold mb-3" style={{ color: 'var(--theme-text-primary)' }}>
            {volunteerName}
          </p>
          <div
            className="p-3 rounded-md border-l-4"
            style={{
              backgroundColor: 'var(--theme-bg-secondary)',
              borderColor: 'var(--theme-error)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--theme-error)' }}>
              Figyelem! Ez a művelet nem visszavonható.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
              Minden adat véglegesen törlődik az adatbázisból.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2 px-4 border rounded-md font-medium transition-colors disabled:opacity-50"
            style={{
              borderColor: 'var(--theme-border-primary)',
              color: 'var(--theme-text-secondary)',
              backgroundColor: 'var(--theme-bg-primary)',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) e.currentTarget.style.backgroundColor = 'var(--theme-bg-secondary)';
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) e.currentTarget.style.backgroundColor = 'var(--theme-bg-primary)';
            }}
          >
            Mégse
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDeleting ? 'var(--theme-btn-secondary-bg)' : 'var(--theme-error)',
              color: '#ffffff',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) e.currentTarget.style.opacity = '1';
            }}
          >
            {isDeleting ? 'Törlés...' : 'Törlés'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
