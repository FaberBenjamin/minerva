import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import NotesButton from '../components/NotesButton';
import NotesPanel from '../components/NotesPanel';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { getNotesCount } from '../services/notesService';
import type { Volunteer } from '../types';

interface EditForm {
  oevk: string;
  votingStation: string;
}

function UnknownDistricts() {
  const [unknownVolunteers, setUnknownVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    oevk: '',
    votingStation: ''
  });
  const [saving, setSaving] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<Volunteer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadUnknownVolunteers();
  }, []);

  const handleOpenNotes = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsPanelOpen(true);
  };

  const handleCloseNotes = () => {
    setIsPanelOpen(false);
    setSelectedVolunteer(null);
  };

  const loadUnknownVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);

      const volunteersRef = collection(db, 'volunteers');
      const q = query(volunteersRef, where('district.status', '==', 'unknown'));
      const querySnapshot = await getDocs(q);

      const volunteersData: Volunteer[] = [];
      querySnapshot.forEach((doc) => {
        volunteersData.push({ id: doc.id, ...doc.data() } as Volunteer);
      });

      // Rendezés név szerint
      volunteersData.sort((a, b) => a.name.localeCompare(b.name, 'hu'));

      setUnknownVolunteers(volunteersData);
    } catch (err) {
      console.error('Hiba az ismeretlen körzetek betöltésekor:', err);
      setError('Nem sikerült betölteni az adatokat');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setEditForm({
      oevk: volunteer.district.oevk || '',
      votingStation: volunteer.district.votingStation || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingVolunteer(null);
    setEditForm({ oevk: '', votingStation: '' });
  };

  const handleSave = async () => {
    if (!editForm.oevk || !editForm.votingStation) {
      showToast('Kérlek add meg az OEVK-t és a szavazókört!', 'warning');
      return;
    }

    if (!editingVolunteer) {
      return;
    }

    try {
      setSaving(true);

      const volunteerRef = doc(db, 'volunteers', editingVolunteer.id);
      await updateDoc(volunteerRef, {
        'district.oevk': editForm.oevk,
        'district.votingStation': editForm.votingStation,
        'district.status': 'matched'
      });

      // Frissítjük a lokális listát
      await loadUnknownVolunteers();

      // Modal bezárása
      handleCancelEdit();

      showToast('Sikeres mentés! Az önkéntes átkerült a szavazókörök közé.', 'success');
    } catch (err) {
      console.error('Hiba a mentés során:', err);
      showToast('Hiba történt a mentés során', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (volunteer: Volunteer) => {
    setVolunteerToDelete(volunteer);
  };

  const handleDeleteConfirm = async () => {
    if (!volunteerToDelete) return;

    try {
      setDeleting(true);
      const volunteerRef = doc(db, 'volunteers', volunteerToDelete.id);
      await deleteDoc(volunteerRef);

      // Frissítjük a lokális listát
      setUnknownVolunteers(unknownVolunteers.filter(v => v.id !== volunteerToDelete.id));

      showToast('Önkéntes sikeresen törölve', 'success');
      setVolunteerToDelete(null);
    } catch (err) {
      console.error('Hiba a törlés során:', err);
      showToast('Hiba történt a törlés során', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setVolunteerToDelete(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>Ismeretlen Körzetek</h1>
        <p className="mt-1" style={{ color: 'var(--theme-text-tertiary)' }}>
          Azon önkéntesek listája, akiknek a címe nem található az adatbázisban
        </p>
      </div>

      <div className="rounded-lg shadow" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
        {unknownVolunteers.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--theme-text-tertiary)' }}>
            <p>Nincsenek ismeretlen körzettel rendelkező önkéntesek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border-primary)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                    Név
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                    Telefonszám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                    Cím
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--theme-border-primary)' }}>
                {unknownVolunteers.map((volunteer) => (
                  <tr
                    key={volunteer.id}
                    className="transition-colors"
                    style={{ backgroundColor: 'var(--theme-card-bg)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      {volunteer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      {volunteer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      {volunteer.phone}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      {volunteer.address.fullAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-3 justify-end items-center">
                        <NotesButton
                          notesCount={getNotesCount(volunteer)}
                          onClick={() => handleOpenNotes(volunteer)}
                        />
                        <button
                          onClick={() => handleEdit(volunteer)}
                          className="transition-colors"
                          style={{ color: 'var(--theme-link-text)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
                          title="Szerkesztés"
                        >
                          <svg
                            className="w-5 h-5 inline-block"
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
                        <button
                          onClick={() => handleDeleteClick(volunteer)}
                          disabled={deleting}
                          className="flex transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ color: deleting ? 'var(--theme-text-tertiary)' : 'var(--theme-error)' }}
                          onMouseEnter={(e) => {
                            if (!deleting) e.currentTarget.style.opacity = '0.7';
                          }}
                          onMouseLeave={(e) => {
                            if (!deleting) e.currentTarget.style.opacity = '1';
                          }}
                          title="Önkéntes törlése"
                        >
                          <svg
                            className="w-5 h-5 inline-block"
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Szerkesztő Modal */}
      {editingVolunteer && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-xl max-w-md w-full p-6" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
              Szavazókör hozzárendelése
            </h2>

            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                <span className="font-medium">Név:</span> {editingVolunteer.name}
              </p>
              <p className="text-sm mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                <span className="font-medium">Cím:</span> {editingVolunteer.address.fullAddress}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="oevk" className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                  OEVK <span style={{ color: 'var(--theme-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="oevk"
                  value={editForm.oevk}
                  onChange={(e) => setEditForm({ ...editForm, oevk: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--theme-input-bg)',
                    borderColor: 'var(--theme-input-border)',
                    color: 'var(--theme-input-text)'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-focus)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-border)'}
                  placeholder="pl. 01"
                />
              </div>

              <div>
                <label htmlFor="votingStation" className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                  Szavazókör <span style={{ color: 'var(--theme-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="votingStation"
                  value={editForm.votingStation}
                  onChange={(e) => setEditForm({ ...editForm, votingStation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--theme-input-bg)',
                    borderColor: 'var(--theme-input-border)',
                    color: 'var(--theme-input-text)'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-focus)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-border)'}
                  placeholder="pl. 001"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: saving ? 'var(--theme-btn-secondary-bg)' : 'var(--theme-btn-primary-bg)',
                  color: saving ? 'var(--theme-btn-secondary-text)' : 'var(--theme-btn-primary-text)'
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.backgroundColor = 'var(--theme-btn-primary-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.currentTarget.style.backgroundColor = 'var(--theme-btn-primary-bg)';
                }}
              >
                {saving ? 'Mentés...' : 'Mentés'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1 py-2 px-4 border rounded-md font-medium transition-colors"
                style={{
                  borderColor: 'var(--theme-border-primary)',
                  color: 'var(--theme-text-secondary)',
                  backgroundColor: 'var(--theme-bg-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-bg-primary)';
                }}
              >
                Mégse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Panel */}
      {selectedVolunteer && (
        <NotesPanel
          volunteer={selectedVolunteer}
          isOpen={isPanelOpen}
          onClose={handleCloseNotes}
        />
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!volunteerToDelete}
        volunteerName={volunteerToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={deleting}
      />
    </div>
  );
}

export default UnknownDistricts;
