import { useState } from 'react';

function Dashboard() {
  // TODO: Firebase Firestore adatok betöltése (Fázis 5)
  const [votingStations, setVotingStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-minerva-gray-900 mb-4">Szavazókörök</h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Keresés szavazókör vagy OEVK szerint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-minerva-gray-300 rounded-md focus:ring-2 focus:ring-minerva-gray-600 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {votingStations.length === 0 ? (
          <div className="p-8 text-center text-minerva-gray-600">
            <p>Még nincsenek szavazókörök az adatbázisban.</p>
            <p className="text-sm mt-2">Az adatok a Google Sheets szinkronizálás után jelennek meg itt.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-minerva-gray-100 border-b border-minerva-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    Szavazókör
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    OEVK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    Önkéntesek száma
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-minerva-gray-200">
                {/* TODO: Szavazókörök listázása */}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
