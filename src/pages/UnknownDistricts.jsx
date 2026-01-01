import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

function UnknownDistricts() {
  const [unknownVolunteers, setUnknownVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [editForm, setEditForm] = useState({
    oevk: '',
    votingStation: ''
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadUnknownVolunteers();
  }, []);

  const loadUnknownVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);

      const volunteersRef = collection(db, 'volunteers');
      const q = query(volunteersRef, where('district.status', '==', 'unknown'));
      const querySnapshot = await getDocs(q);

      const volunteersData = [];
      querySnapshot.forEach((doc) => {
        volunteersData.push({ id: doc.id, ...doc.data() });
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

  const handleEdit = (volunteer) => {
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
        <h1 className="text-2xl font-bold text-minerva-gray-900">Ismeretlen Körzetek</h1>
        <p className="text-minerva-gray-600 mt-1">
          Azon önkéntesek listája, akiknek a címe nem található az adatbázisban
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {unknownVolunteers.length === 0 ? (
          <div className="p-8 text-center text-minerva-gray-600">
            <p>Nincsenek ismeretlen körzettel rendelkező önkéntesek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-minerva-gray-100 border-b border-minerva-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    Név
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    Telefonszám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    Cím
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-minerva-gray-200">
                {unknownVolunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {volunteer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {volunteer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {volunteer.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {volunteer.address.fullAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(volunteer)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Szerkesztés
                      </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Szavazókör hozzárendelése
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Név:</span> {editingVolunteer.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Cím:</span> {editingVolunteer.address.fullAddress}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="oevk" className="block text-sm font-medium text-gray-700 mb-1">
                  OEVK <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="oevk"
                  value={editForm.oevk}
                  onChange={(e) => setEditForm({ ...editForm, oevk: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="pl. 01"
                />
              </div>

              <div>
                <label htmlFor="votingStation" className="block text-sm font-medium text-gray-700 mb-1">
                  Szavazókör <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="votingStation"
                  value={editForm.votingStation}
                  onChange={(e) => setEditForm({ ...editForm, votingStation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="pl. 001"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-white ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saving ? 'Mentés...' : 'Mentés'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
              >
                Mégse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnknownDistricts;
