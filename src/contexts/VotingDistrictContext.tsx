import { createContext, useContext, ReactNode } from 'react';
import votingDistrictService from '../services/votingDistrictService';
import type { AddressInput, District } from '../types';

interface VotingDistrictContextType {
  findDistrict: (address: AddressInput) => Promise<District | null>;
  isReady: boolean;
  isLoading: boolean;
}

const VotingDistrictContext = createContext<VotingDistrictContextType | undefined>(undefined);

export const useVotingDistrict = (): VotingDistrictContextType => {
  const context = useContext(VotingDistrictContext);
  if (!context) {
    throw new Error('useVotingDistrict must be used within a VotingDistrictProvider');
  }
  return context;
};

interface VotingDistrictProviderProps {
  children: ReactNode;
}

export const VotingDistrictProvider = ({ children }: VotingDistrictProviderProps) => {
  // findDistrict mostmár async és automatikusan tölti be a PIR adatokat
  const findDistrict = async (address: AddressInput): Promise<District | null> => {
    return await votingDistrictService.findDistrict(address);
  };

  const value: VotingDistrictContextType = {
    findDistrict,
    isReady: true, // Mindig ready, mert nincs előzetes betöltés
    isLoading: false // Nincs globális loading, csak PIR-specifikus
  };

  return (
    <VotingDistrictContext.Provider value={value}>
      {children}
    </VotingDistrictContext.Provider>
  );
};

export default VotingDistrictContext;
