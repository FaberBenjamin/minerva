import { useState, useEffect, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { exportVolunteersByOEVK, exportAllByOEVK } from '../services/exportService';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import RegistrationChart from '../components/RegistrationChart';
import OEVKBarChart from '../components/OEVKBarChart';
import {
  calculateAnalytics,
  getDailyRegistrations,
  getOEVKCounts,
  type AnalyticsStats,
  type DailyRegistration,
  type OEVKCount,
} from '../services/analyticsService';
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

  // Analytics state
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [dailyRegistrations, setDailyRegistrations] = useState<DailyRegistration[]>([]);
  const [oevkCounts, setOevkCounts] = useState<OEVKCount[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

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

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setAnalyticsLoading(true);

        const [stats, registrations, oevks] = await Promise.all([
          calculateAnalytics(),
          getDailyRegistrations(30),
          getOEVKCounts(),
        ]);

        setAnalyticsStats(stats);
        setDailyRegistrations(registrations);
        setOevkCounts(oevks);
      } catch (err) {
        console.error('Error loading analytics:', err);
        // Don't show error toast, just silently fail for analytics
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
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
      {/* Analytics Overview */}
      {!analyticsLoading && analyticsStats && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text-primary)' }}>Áttekintés</h2>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Összes önkéntes"
              value={analyticsStats.totalVolunteers}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <StatCard
              title="Aktív körzetek"
              value={analyticsStats.activeDistricts}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              }
            />
            <StatCard
              title="Ismeretlen címek"
              value={analyticsStats.unknownAddresses}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Mai regisztrációk"
              value={analyticsStats.todayRegistrations}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RegistrationChart data={dailyRegistrations} />
            <OEVKBarChart data={oevkCounts} />
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>Szavazókörök</h1>

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
                className="w-full sm:w-auto px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: exporting ? 'var(--theme-btn-secondary-bg)' : 'var(--theme-success)',
                  color: exporting ? 'var(--theme-btn-secondary-text)' : '#ffffff'
                }}
                onMouseEnter={(e) => {
                  if (!exporting) e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!exporting) e.currentTarget.style.opacity = '1';
                }}
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
            className="w-full max-w-md px-4 py-2 border rounded-md outline-none transition-colors"
            style={{
              backgroundColor: 'var(--theme-input-bg)',
              borderColor: 'var(--theme-input-border)',
              color: 'var(--theme-input-text)'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-focus)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-border)'}
          />
        </div>
      </div>

      <div className="rounded-lg shadow" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
        {votingStations.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--theme-text-tertiary)' }}>
            <p>Még nincsenek regisztrált önkéntesek hozzárendelt szavazókörrel.</p>
            <p className="text-sm mt-2">Az önkéntesek a /register oldalon tudnak regisztrálni.</p>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--theme-text-tertiary)' }}>
            <p>Nincs találat a keresési feltételeknek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border-primary)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                    OEVK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                    Szavazókör
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                    Önkéntesek száma
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--theme-border-primary)' }}>
                {filteredStations.map((station) => (
                  <tr
                    key={`${station.oevk}-${station.votingStation}`}
                    className="cursor-pointer transition-colors"
                    style={{ backgroundColor: 'var(--theme-card-bg)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)'}
                    onClick={() => handleViewDetails(station.oevk, station.votingStation)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      {station.oevk}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      {station.votingStation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      {station.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={(e) => handleExportOEVK(station.oevk, e)}
                          disabled={exporting}
                          className="transition-colors disabled:opacity-50"
                          style={{ color: exporting ? 'var(--theme-text-tertiary)' : 'var(--theme-success)' }}
                          onMouseEnter={(e) => {
                            if (!exporting) e.currentTarget.style.opacity = '0.8';
                          }}
                          onMouseLeave={(e) => {
                            if (!exporting) e.currentTarget.style.opacity = '1';
                          }}
                          title={`Export OEVK ${station.oevk}`}
                        >
                          Export
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(station.oevk, station.votingStation);
                          }}
                          className="transition-colors"
                          style={{ color: 'var(--theme-link-text)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
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
