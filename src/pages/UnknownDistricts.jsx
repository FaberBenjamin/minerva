import { useState } from 'react';

function UnknownDistricts() {
  // TODO: Firebase Firestore adatok betöltése (Fázis 6)
  const [unknownVolunteers, setUnknownVolunteers] = useState([]);

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
                {/* TODO: Ismeretlen önkéntesek listázása és szerkesztés */}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnknownDistricts;
