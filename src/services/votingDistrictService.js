class VotingDistrictService {
  constructor() {
    this.pirCache = new Map(); // Cache a már letöltött PIR adatoknak
    this.loadingPirs = new Map(); // Promise-ok a jelenleg töltődő PIR-ekhez
  }

  /**
   * Betölti az adott PIR JSON fájlt
   * @param {string} pir - PIR / irányítószám
   * @returns {Promise<Array>} - A PIR-hez tartozó címek tömbje
   */
  async loadPirData(pir) {
    const cleanPir = pir?.trim();
    if (!cleanPir) {
      throw new Error('PIR megadása kötelező');
    }

    // Ha már cache-elve van
    if (this.pirCache.has(cleanPir)) {
      console.log(`✅ PIR ${cleanPir} cache-ből betöltve`);
      return this.pirCache.get(cleanPir);
    }

    // Ha épp töltődik, várjuk meg
    if (this.loadingPirs.has(cleanPir)) {
      console.log(`⏳ PIR ${cleanPir} töltődik, várakozás...`);
      return this.loadingPirs.get(cleanPir);
    }

    // Új betöltés indítása
    const loadPromise = (async () => {
      try {
        console.log(`📥 PIR ${cleanPir} betöltése...`);
        const response = await fetch(`/minerva/districts/${cleanPir}.json`);

        if (!response.ok) {
          if (response.status === 404) {
            console.log(`❌ PIR ${cleanPir} nem található az adatbázisban`);
            this.pirCache.set(cleanPir, []); // Üres tömb cache-elése
            return [];
          }
          throw new Error(`HTTP ${response.status}: Nem sikerült betölteni a PIR adatokat`);
        }

        const data = await response.json();
        console.log(`✅ PIR ${cleanPir} betöltve: ${data.length} cím`);

        this.pirCache.set(cleanPir, data);
        return data;
      } catch (error) {
        console.error(`❌ Hiba PIR ${cleanPir} betöltése során:`, error);
        throw error;
      } finally {
        this.loadingPirs.delete(cleanPir);
      }
    })();

    this.loadingPirs.set(cleanPir, loadPromise);
    return loadPromise;
  }

  /**
   * Normalizálja a házszámot összehasonlításhoz
   * "000001" -> "1"
   * "000012A" -> "12A"
   */
  normalizeHouseNumber(houseNumber) {
    if (!houseNumber) return '';

    // Trim és uppercase
    let normalized = houseNumber.trim().toUpperCase();

    // Eltávolítjuk a leading zeros-t, de megtartjuk a betűket
    // "000012A" -> "12A"
    normalized = normalized.replace(/^0+/, '') || '0';

    return normalized;
  }

  /**
   * Normalizálja a szöveget összehasonlításhoz (kisbetű, ékezet nélkül)
   */
  normalizeText(text) {
    if (!text) return '';

    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Ékezetek eltávolítása
  }

  /**
   * Keresi a megadott cím alapján a választókörzetet
   * @param {Object} address - { pir, street, streetType, houseNumber }
   * @returns {Promise<Object|null>} - { oevk, votingStation, status: 'matched' } vagy null
   */
  async findDistrict(address) {
    const { pir, street, streetType, houseNumber } = address;

    try {
      // 1. PIR adatok betöltése
      const recordsInPIR = await this.loadPirData(pir);

      if (!recordsInPIR || recordsInPIR.length === 0) {
        console.log(`❌ Nincs találat a PIR-re: ${pir}`);
        return null;
      }

      console.log(`🔍 ${recordsInPIR.length} rekord a PIR-ben: ${pir}`);

      // Normalizált értékek
      const normalizedStreet = this.normalizeText(street);
      const normalizedStreetType = this.normalizeText(streetType);
      const normalizedHouseNumber = this.normalizeHouseNumber(houseNumber);

      // 2. Közterület név szűrés
      const streetMatches = recordsInPIR.filter(record => {
        return this.normalizeText(record['Közterület név']) === normalizedStreet;
      });

      if (streetMatches.length === 0) {
        console.log(`❌ Nincs találat a közterület névre: ${street}`);
        return null;
      }

      console.log(`🔍 ${streetMatches.length} rekord a közterület névre: ${street}`);

      // 3. Közterület jelleg szűrés
      const streetTypeMatches = streetMatches.filter(record => {
        return this.normalizeText(record['Közterület jelleg']) === normalizedStreetType;
      });

      if (streetTypeMatches.length === 0) {
        console.log(`❌ Nincs találat a közterület jellegre: ${streetType}`);
        return null;
      }

      console.log(`🔍 ${streetTypeMatches.length} rekord a közterület jellegre: ${streetType}`);

      // 4. Házszám szűrés
      const houseNumberMatches = streetTypeMatches.filter(record => {
        const dbHouseNumber = this.normalizeHouseNumber(record['Házszám']);
        return dbHouseNumber === normalizedHouseNumber;
      });

      if (houseNumberMatches.length === 0) {
        console.log(`❌ Nincs találat a házszámra: ${houseNumber} (normalizált: ${normalizedHouseNumber})`);
        return null;
      }

      // 5. Találat! Visszaadjuk az első egyezést
      const match = houseNumberMatches[0];

      console.log(`✅ Találat! OEVK: ${match.OEVK}, Szavazókör: ${match['Szavazókör']}`);

      return {
        oevk: match.OEVK || null,
        votingStation: match['Szavazókör'] || null,
        status: 'matched'
      };
    } catch (error) {
      console.error('Hiba a cím keresése során:', error);
      return null;
    }
  }
}

// Singleton instance
const votingDistrictService = new VotingDistrictService();

export default votingDistrictService;
