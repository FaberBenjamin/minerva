import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function VotingStationDetail() {
  const { id } = useParams();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse ID (format: "OEVK-VotingStation")
  const [oevk, votingStation] = id.split('-');

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
        const volunteersData = [];

        querySnapshot.forEach((doc) => {
          volunteersData.push({ id: doc.id, ...doc.data() });
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
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Betöltés...</p>
      </div>
    );
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
        <Link to="/" className="text-gray-600 hover:text-gray-900 mb-4 inline-block">
          ← Vissza a szavazókörökhöz
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Szavazókör Részletek</h1>
        <div className="flex gap-4 text-gray-600">
          <p><span className="font-medium">OEVK:</span> {oevk}</p>
          <p><span className="font-medium">Szavazókör:</span> {votingStation}</p>
          <p><span className="font-medium">Önkéntesek:</span> {volunteers.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {volunteers.length === 0 ? (
          <div className="p-8 text-center text-minerva-gray-600">
            <p>Nincsenek önkéntesek ehhez a szavazókörhöz.</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-minerva-gray-200">
                {volunteers.map((volunteer) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default VotingStationDetail;
