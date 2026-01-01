import { createContext, useContext, useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await votingDistrictService.loadData();
        setIsReady(true);
      } catch (err) {
        console.error('Hiba a választási adatbázis betöltésekor:', err);
        setError(err.message || 'Nem sikerült betölteni a választási adatbázist');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const findDistrict = (address) => {
    if (!isReady) {
      console.warn('Választási adatbázis még nincs betöltve');
      return null;
    }
    return votingDistrictService.findDistrict(address);
  };

  const value = {
    isLoading,
    error,
    isReady,
    findDistrict
  };

  return (
    <VotingDistrictContext.Provider value={value}>
      {children}
    </VotingDistrictContext.Provider>
  );
};

export default VotingDistrictContext;
