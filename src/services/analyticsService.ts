import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Volunteer } from '../types';

export interface AnalyticsStats {
  totalVolunteers: number;
  activeDistricts: number;
  unknownAddresses: number;
  todayRegistrations: number;
}

export interface DailyRegistration {
  date: string;
  count: number;
}

export interface OEVKCount {
  oevk: string;
  count: number;
}

/**
 * Calculate basic analytics statistics
 */
export async function calculateAnalytics(): Promise<AnalyticsStats> {
  try {
    const volunteersRef = collection(db, 'volunteers');

    // Get all volunteers
    const allVolunteersSnapshot = await getDocs(volunteersRef);
    const totalVolunteers = allVolunteersSnapshot.size;

    // Get matched volunteers
    const matchedQuery = query(volunteersRef, where('district.status', '==', 'matched'));
    const matchedSnapshot = await getDocs(matchedQuery);

    // Count unique OEVK districts
    const uniqueOEVKs = new Set<string>();
    matchedSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.district?.oevk) {
        uniqueOEVKs.add(data.district.oevk);
      }
    });

    // Get unknown addresses
    const unknownQuery = query(volunteersRef, where('district.status', '==', 'unknown'));
    const unknownSnapshot = await getDocs(unknownQuery);
    const unknownAddresses = unknownSnapshot.size;

    // Count today's registrations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayRegistrations = 0;
    allVolunteersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.createdAt) {
        const createdDate = data.createdAt.toDate();
        createdDate.setHours(0, 0, 0, 0);
        if (createdDate.getTime() === today.getTime()) {
          todayRegistrations++;
        }
      }
    });

    return {
      totalVolunteers,
      activeDistricts: uniqueOEVKs.size,
      unknownAddresses,
      todayRegistrations,
    };
  } catch (error) {
    console.error('Error calculating analytics:', error);
    throw error;
  }
}

/**
 * Get daily registrations for the last N days
 */
export async function getDailyRegistrations(days: number = 30): Promise<DailyRegistration[]> {
  try {
    const volunteersRef = collection(db, 'volunteers');
    const snapshot = await getDocs(volunteersRef);

    // Create a map of date -> count
    const registrationMap = new Map<string, number>();

    // Initialize last N days with 0
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      registrationMap.set(dateStr, 0);
    }

    // Count registrations per day
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.createdAt) {
        const createdDate = data.createdAt.toDate();
        const dateStr = formatDate(createdDate);

        if (registrationMap.has(dateStr)) {
          registrationMap.set(dateStr, (registrationMap.get(dateStr) || 0) + 1);
        }
      }
    });

    // Convert to array and sort by date
    const result: DailyRegistration[] = [];
    registrationMap.forEach((count, date) => {
      result.push({ date, count });
    });

    result.sort((a, b) => a.date.localeCompare(b.date));

    return result;
  } catch (error) {
    console.error('Error getting daily registrations:', error);
    throw error;
  }
}

/**
 * Get volunteer count per OEVK
 */
export async function getOEVKCounts(): Promise<OEVKCount[]> {
  try {
    const volunteersRef = collection(db, 'volunteers');
    const matchedQuery = query(volunteersRef, where('district.status', '==', 'matched'));
    const snapshot = await getDocs(matchedQuery);

    // Count volunteers per OEVK
    const oevkMap = new Map<string, number>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.district?.oevk) {
        const oevk = data.district.oevk;
        oevkMap.set(oevk, (oevkMap.get(oevk) || 0) + 1);
      }
    });

    // Convert to array and sort by OEVK
    const result: OEVKCount[] = [];
    oevkMap.forEach((count, oevk) => {
      result.push({ oevk, count });
    });

    result.sort((a, b) => a.oevk.localeCompare(b.oevk));

    return result;
  } catch (error) {
    console.error('Error getting OEVK counts:', error);
    throw error;
  }
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date as MM.DD (for chart labels)
 */
export function formatChartDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${month}.${day}`;
}
