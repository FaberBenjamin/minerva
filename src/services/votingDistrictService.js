import Papa from 'papaparse';

class VotingDistrictService {
  constructor() {
    this.data = null;
    this.indexedByPIR = new Map(); // PIR -> Array of addresses
    this.isLoaded = false;
    this.isLoading = false;
    this.loadError = null;
  }

  /**
   * Betölti a korzetek.csv fájlt és indexeli PIR alapján
   */
  async loadData() {
    if (this.isLoaded) {
      return this.data;
    }

    if (this.isLoading) {
      // Várunk amíg a betöltés befejeződik
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (this.isLoaded) {
            clearInterval(checkInterval);
            resolve(this.data);
          } else if (this.loadError) {
            clearInterval(checkInterval);
            reject(this.loadError);
          }
        }, 100);
      });
    }

    this.isLoading = true;

    try {
      const response = await fetch('/minerva/korzetek.csv');
      if (!response.ok) {
        throw new Error('Nem sikerült betölteni a választási adatbázist');
      }

      const csvText = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true,
          complete: (results) => {
            try {
              this.data = results.data;
              this.indexData();
              this.isLoaded = true;
              this.isLoading = false;
              console.log(`✅ Választási adatbázis betöltve: ${this.data.length} rekord`);
              resolve(this.data);
            } catch (error) {
              this.loadError = error;
              this.isLoading = false;
              reject(error);
            }
          },
          error: (error) => {
            this.loadError = error;
            this.isLoading = false;
            reject(error);
          }
        });
      });
    } catch (error) {
      this.loadError = error;
      this.isLoading = false;
      throw error;
    }
  }

  /**
   * Indexeli az adatokat PIR alapján gyorsabb kereséshez
   */
  indexData() {
    this.indexedByPIR.clear();

    this.data.forEach(record => {
      const pir = record.PIR?.trim();
      if (!pir) return;

      if (!this.indexedByPIR.has(pir)) {
        this.indexedByPIR.set(pir, []);
      }

      this.indexedByPIR.get(pir).push(record);
    });

    console.log(`📇 ${this.indexedByPIR.size} különböző PIR indexelve`);
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
   * @returns {Object|null} - { oevk, votingStation, status: 'matched' } vagy null
   */
  findDistrict(address) {
    if (!this.isLoaded) {
      console.warn('⚠️ Választási adatbázis még nincs betöltve');
      return null;
    }

    const { pir, street, streetType, houseNumber } = address;

    // 1. PIR alapján szűrés
    const recordsInPIR = this.indexedByPIR.get(pir?.trim());
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
  }
}

// Singleton instance
const votingDistrictService = new VotingDistrictService();

export default votingDistrictService;
