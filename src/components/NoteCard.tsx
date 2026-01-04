import { useState } from 'react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  currentUserId: string;
  onEdit?: (noteId: string, newText: string) => Promise<void>;
  onDelete?: (noteId: string) => Promise<void>;
}

function NoteCard({ note, currentUserId, onEdit, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [saving, setSaving] = useState(false);

  const isOwnNote = note.authorId === currentUserId;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Most';
    if (diffMins < 60) return `${diffMins} perce`;
    if (diffHours < 24) {
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      return `Ma ${hours}:${mins}`;
    }
    if (diffDays === 1) {
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      return `Tegnap ${hours}:${mins}`;
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${mins}`;
  };

  const handleSave = async () => {
    if (!editText.trim() || !onEdit) return;

    try {
      setSaving(true);
      await onEdit(note.id, editText);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = window.confirm('Biztosan törlöd ezt a jegyzetet?');
    if (!confirmed) return;

    try {
      await onDelete(note.id);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleCancel = () => {
    setEditText(note.text);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-minerva-gray-50 rounded-lg p-4 border border-minerva-gray-200">
        <div className="flex items-center gap-2 text-sm mb-2">
          <span className="font-medium text-minerva-gray-900">{note.author}</span>
          <span className="text-minerva-gray-400">•</span>
          <span className="text-minerva-gray-600">{formatDate(note.createdAt)}</span>
        </div>

        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full px-3 py-2 border border-minerva-gray-300 rounded-md focus:ring-2 focus:ring-minerva-gray-600 focus:border-transparent resize-none text-sm"
          rows={3}
          maxLength={500}
          disabled={saving}
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-minerva-gray-500">
            {editText.length}/500 karakter
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-xs text-minerva-gray-600 hover:text-minerva-gray-900 disabled:opacity-50"
            >
              Mégse
            </button>
            <button
              onClick={handleSave}
              disabled={!editText.trim() || saving}
              className="text-xs text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Mentés...' : 'Mentés'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-minerva-gray-50 rounded-lg p-4 border border-minerva-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-minerva-gray-900">{note.author}</span>
          <span className="text-minerva-gray-400">•</span>
          <span className="text-minerva-gray-600">{formatDate(note.createdAt)}</span>
        </div>

        {isOwnNote && (onEdit || onDelete) && (
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-minerva-gray-500 hover:text-blue-600 text-xs transition-colors"
                title="Szerkesztés"
              >
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-minerva-gray-500 hover:text-red-600 text-xs transition-colors"
                title="Törlés"
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-minerva-gray-800 whitespace-pre-wrap">
        {note.text}
      </p>

      {note.updatedAt && note.updatedAt !== note.createdAt && (
        <p className="text-xs text-minerva-gray-500 mt-2 italic">
          Szerkesztve: {formatDate(note.updatedAt)}
        </p>
      )}
    </div>
  );
}

export default NoteCard;
