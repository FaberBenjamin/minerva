import { useState, useEffect, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { exportVolunteersByOEVK, exportAllByOEVK } from '../services/exportService';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Volunteer } from '../types';

interface VotingStationGroup {
  oevk: string;
  votingStation: string;
  count: number;
  volunteers: Volunteer[];
}

function Dashboard() {
  const [votingStations, setVotingStations] = useState<VotingStationGroup[]>([]);
  const [allVolunteers, setAllVolunteers] = useState<Volunteer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const loadVolunteers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lekérjük az összes volunteers-t akiknek van OEVK-ja (matched státusz)
        const volunteersRef = collection(db, 'volunteers');
        const q = query(volunteersRef, where('district.status', '==', 'matched'));
        const querySnapshot = await getDocs(q);

        // Összegyűjtjük az összes volunteers-t exporthoz
        const volunteersData: Volunteer[] = [];
        querySnapshot.forEach((doc) => {
          volunteersData.push({ id: doc.id, ...doc.data() } as Volunteer);
        });
        setAllVolunteers(volunteersData);

        // Csoportosítás OEVK + Szavazókör szerint
        const grouped = new Map<string, VotingStationGroup>();

        volunteersData.forEach((volunteer) => {
          const { oevk, votingStation } = volunteer.district;

          if (!oevk || !votingStation) return;

          const key = `${oevk}-${votingStation}`;

          if (!grouped.has(key)) {
            grouped.set(key, {
              oevk,
              votingStation,
              count: 0,
              volunteers: []
            });
          }

          const group = grouped.get(key)!;
          group.count++;
          group.volunteers.push(volunteer);
        });

        // Map -> Array konverzió, rendezés OEVK majd szavazókör szerint
        const votingStationsArray = Array.from(grouped.values()).sort((a, b) => {
          if (a.oevk !== b.oevk) {
            return a.oevk.localeCompare(b.oevk);
          }
          return a.votingStation.localeCompare(b.votingStation);
        });

        setVotingStations(votingStationsArray);
      } catch (err) {
        console.error('Hiba a szavazókörök betöltésekor:', err);
        setError('Nem sikerült betölteni a szavazóköröket');
      } finally {
        setLoading(false);
      }
    };

    loadVolunteers();
  }, []);

  // Szűrés keresési szöveg alapján
  const filteredStations = votingStations.filter((station) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      station.oevk.toLowerCase().includes(search) ||
      station.votingStation.toLowerCase().includes(search)
    );
  });

  const handleViewDetails = (oevk: string, votingStation: string) => {
    navigate(`/station/${oevk}-${votingStation}`);
  };

  const handleExportOEVK = async (oevk: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      setExporting(true);
      const result = await exportVolunteersByOEVK(allVolunteers, oevk);
      showToast(`Sikeres export! ${result.count} önkéntes exportálva.`, 'success');
    } catch (error: any) {
      showToast(`Hiba az exportálás során: ${error.message}`, 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = async () => {
    // OEVK-k csoportosítása
    const groupedByOEVK = allVolunteers.reduce<Record<string, Volunteer[]>>((acc, volunteer) => {
      if (volunteer.district.status !== 'matched' || !volunteer.district.oevk) {
        return acc;
      }
      const oevk = volunteer.district.oevk;
      if (!acc[oevk]) {
        acc[oevk] = [];
      }
      acc[oevk].push(volunteer);
      return acc;
    }, {});

    const oevkList = Object.keys(groupedByOEVK).sort();

    if (oevkList.length === 0) {
      showToast('Nincsenek matched státuszú önkéntesek az exportáláshoz', 'warning');
      return;
    }

    if (!window.confirm(`${oevkList.length} OEVK-t exportálsz külön fájlokba (${oevkList.join(', ')}). Folytatod?`)) {
      return;
    }

    try {
      setExporting(true);

      for (let i = 0; i < oevkList.length; i++) {
        const oevk = oevkList[i];
        setExportProgress(`Exportálás: ${i + 1}/${oevkList.length} - OEVK ${oevk}`);

        await exportVolunteersByOEVK(allVolunteers, oevk);

        // 1 másodperc késleltetés a böngésző blokkolás elkerülésére
        if (i < oevkList.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setExportProgress(null);
      showToast(`Sikeres export! ${oevkList.length} OEVK exportálva külön fájlokba.`, 'success');
    } catch (error: any) {
      console.error('Export hiba:', error);
      setExportProgress(null);
      showToast(`Hiba az exportálás során: ${error.message}`, 'error');
    } finally {
      setExporting(false);
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold text-minerva-gray-900">Szavazókörök</h1>

          {votingStations.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {exportProgress && (
                <span className="text-sm text-gray-600 font-medium">
                  {exportProgress}
                </span>
              )}
              <button
                onClick={handleExportAll}
                disabled={exporting}
                className={`w-full sm:w-auto px-4 py-2 rounded-md font-medium text-white text-sm ${
                  exporting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {exporting ? 'Exportálás...' : 'Összes OEVK exportálása'}
              </button>
            </div>
          )}
        </div>

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
            <p>Még nincsenek regisztrált önkéntesek hozzárendelt szavazókörrel.</p>
            <p className="text-sm mt-2">Az önkéntesek a /register oldalon tudnak regisztrálni.</p>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="p-8 text-center text-minerva-gray-600">
            <p>Nincs találat a keresési feltételeknek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-minerva-gray-100 border-b border-minerva-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    OEVK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-minerva-gray-700 uppercase tracking-wider">
                    Szavazókör
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
                {filteredStations.map((station) => (
                  <tr
                    key={`${station.oevk}-${station.votingStation}`}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewDetails(station.oevk, station.votingStation)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {station.oevk}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {station.votingStation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {station.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={(e) => handleExportOEVK(station.oevk, e)}
                          disabled={exporting}
                          className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                          title={`Export OEVK ${station.oevk}`}
                        >
                          📥 Export
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(station.oevk, station.votingStation);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Megtekintés →
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
    </div>
  );
}

export default Dashboard;
