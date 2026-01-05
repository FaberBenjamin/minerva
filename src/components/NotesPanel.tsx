import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import NoteCard from './NoteCard';
import type { Volunteer, Note } from '../types';
import {
  saveNote,
  updateNote,
  deleteNote,
  loadVolunteerNotes,
} from '../services/notesService';

interface NotesPanelProps {
  volunteer: Volunteer;
  isOpen: boolean;
  onClose: () => void;
}

function NotesPanel({ volunteer, isOpen, onClose }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && volunteer.id) {
      loadNotes();
    }
  }, [isOpen, volunteer.id]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedNotes = await loadVolunteerNotes(volunteer.id);
      setNotes(loadedNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Nem sikerült betölteni a jegyzeteket');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteText.trim()) {
      showToast('A jegyzet nem lehet üres', 'warning');
      return;
    }

    if (!currentUser) {
      showToast('Nincs bejelentkezve', 'error');
      return;
    }

    try {
      setSaving(true);

      const newNote = await saveNote(
        volunteer.id,
        newNoteText,
        currentUser.displayName || currentUser.email || 'Ismeretlen',
        currentUser.uid
      );

      setNotes([newNote, ...notes]);
      setNewNoteText('');
      showToast('Jegyzet sikeresen mentve', 'success');
    } catch (err) {
      console.error('Error saving note:', err);
      showToast('Hiba a jegyzet mentésekor', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (noteId: string, newText: string) => {
    try {
      await updateNote(volunteer.id, noteId, newText);
      setNotes(
        notes.map((note) =>
          note.id === noteId
            ? { ...note, text: newText, updatedAt: new Date() as any }
            : note
        )
      );
      showToast('Jegyzet frissítve', 'success');
    } catch (err) {
      console.error('Error updating note:', err);
      showToast('Hiba a jegyzet frissítésekor', 'error');
      throw err;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(volunteer.id, noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
      showToast('Jegyzet törölve', 'success');
    } catch (err) {
      console.error('Error deleting note:', err);
      showToast('Hiba a jegyzet törlésekor', 'error');
      throw err;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40 transition-all"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed inset-y-0 right-0 w-full md:w-[480px] shadow-2xl z-50 flex flex-col animate-slide-in"
        style={{ backgroundColor: 'var(--theme-card-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            borderColor: 'var(--theme-border-primary)'
          }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>Jegyzetek</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>{volunteer.name}</p>
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--theme-text-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-tertiary)'}
            title="Bezárás"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: 'var(--theme-text-primary)' }}
              />
              <p className="ml-3" style={{ color: 'var(--theme-text-secondary)' }}>Jegyzetek betöltése...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--theme-error)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p style={{ color: 'var(--theme-error)' }}>{error}</p>
              <button
                onClick={loadNotes}
                className="mt-4 text-sm hover:underline"
                style={{ color: 'var(--theme-link-text)' }}
              >
                Újrapróbálás
              </button>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--theme-text-tertiary)' }}>
              <svg
                className="w-16 h-16 mx-auto mb-3 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="font-medium">Még nincsenek jegyzetek</p>
              <p className="text-xs mt-1">Adj hozzá egyet lent!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  currentUserId={currentUser?.uid || ''}
                  onEdit={handleUpdateNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </div>

        {/* New Note Input */}
        <div
          className="border-t px-6 py-4 flex-shrink-0"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            borderColor: 'var(--theme-border-primary)'
          }}
        >
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
            Új jegyzet hozzáadása
          </label>

          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Írj egy megjegyzést az önkéntesről..."
            className="w-full px-3 py-2 border rounded-md outline-none resize-none transition-colors"
            style={{
              backgroundColor: 'var(--theme-input-bg)',
              borderColor: 'var(--theme-input-border)',
              color: 'var(--theme-input-text)'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-focus)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-border)'}
            rows={4}
            maxLength={500}
            disabled={saving}
          />

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs" style={{ color: 'var(--theme-text-tertiary)' }}>
              {newNoteText.length}/500 karakter
            </span>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm transition-colors"
                style={{ color: 'var(--theme-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-secondary)'}
                disabled={saving}
              >
                Bezár
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!newNoteText.trim() || saving}
                className="px-4 py-2 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: saving || !newNoteText.trim() ? 'var(--theme-btn-secondary-bg)' : 'var(--theme-btn-primary-bg)',
                  color: saving || !newNoteText.trim() ? 'var(--theme-btn-secondary-text)' : 'var(--theme-btn-primary-text)'
                }}
                onMouseEnter={(e) => {
                  if (!saving && newNoteText.trim()) e.currentTarget.style.backgroundColor = 'var(--theme-btn-primary-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!saving && newNoteText.trim()) e.currentTarget.style.backgroundColor = 'var(--theme-btn-primary-bg)';
                }}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Mentés...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Mentés
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotesPanel;
