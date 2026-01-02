import { createContext, useContext } from 'react';
import votingDistrictService from '../services/votingDistrictService';

const VotingDistrictContext = createContext({});

export const useVotingDistrict = () => {
  const context = useContext(VotingDistrictContext);
  if (!context) {
    throw new Error('useVotingDistrict must be used within a VotingDistrictProvider');
  }
  return context;
};

export const VotingDistrictProvider = ({ children }) => {
  // findDistrict mostmár async és automatikusan tölti be a PIR adatokat
  const findDistrict = async (address) => {
    return await votingDistrictService.findDistrict(address);
  };

  const value = {
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
