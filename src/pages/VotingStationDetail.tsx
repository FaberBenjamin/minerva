import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import NotesButton from '../components/NotesButton';
import NotesPanel from '../components/NotesPanel';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { getNotesCount } from '../services/notesService';
import { useToast } from '../contexts/ToastContext';
import type { Volunteer } from '../types';

function VotingStationDetail() {
  const { id } = useParams<{ id: string }>();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<Volunteer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  // Parse ID (format: "OEVK-VotingStation")
  const [oevk, votingStation] = id?.split('-') || ['', ''];

  const handleOpenNotes = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsPanelOpen(true);
  };

  const handleCloseNotes = () => {
    setIsPanelOpen(false);
    setSelectedVolunteer(null);
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
      setVolunteers(volunteers.filter(v => v.id !== volunteerToDelete.id));

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

  useEffect(() => {
    const loadVolunteers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lekérjük az adott szavazókör önkénteseit
        const volunteersRef = collection(db, 'volunteers');
        const q = query(
          volunteersRef,
          where('district.oevk', '==', oevk),
          where('district.votingStation', '==', votingStation),
          where('district.status', '==', 'matched')
        );

        const querySnapshot = await getDocs(q);
        const volunteersData: Volunteer[] = [];

        querySnapshot.forEach((doc) => {
          volunteersData.push({ id: doc.id, ...doc.data() } as Volunteer);
        });

        // Rendezés név szerint
        volunteersData.sort((a, b) => a.name.localeCompare(b.name, 'hu'));

        setVolunteers(volunteersData);
      } catch (err) {
        console.error('Hiba az önkéntesek betöltésekor:', err);
        setError('Nem sikerült betölteni az önkénteseket');
      } finally {
        setLoading(false);
      }
    };

    loadVolunteers();
  }, [oevk, votingStation]);

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
        <Link
          to="/"
          className="mb-4 inline-block transition-colors"
          style={{ color: 'var(--theme-link-text)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
        >
          ← Vissza a szavazókörökhöz
        </Link>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>Szavazókör Részletek</h1>
        <div className="flex gap-4" style={{ color: 'var(--theme-text-tertiary)' }}>
          <p><span className="font-medium">OEVK:</span> {oevk}</p>
          <p><span className="font-medium">Szavazókör:</span> {votingStation}</p>
          <p><span className="font-medium">Önkéntesek:</span> {volunteers.length}</p>
        </div>
      </div>

      <div className="rounded-lg shadow" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
        {volunteers.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--theme-text-tertiary)' }}>
            <p>Nincsenek önkéntesek ehhez a szavazókörhöz.</p>
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
                {volunteers.map((volunteer) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-3 justify-end items-center">
                        <NotesButton
                          notesCount={getNotesCount(volunteer)}
                          onClick={() => handleOpenNotes(volunteer)}
                        />
                        <button
                          onClick={() => handleDeleteClick(volunteer)}
                          disabled={deleting}
                          className="transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default VotingStationDetail;
